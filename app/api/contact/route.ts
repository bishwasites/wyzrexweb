import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { db } from "@/lib/db";
import { leads } from "@/db/schema";
import { bustTag, CACHE_TAGS } from "@/lib/admin-resources";
import { buildLeadAutoReplyEmail, buildLeadNotificationEmail } from "@/lib/lead-email";
import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional(),
  service: z.string().trim().max(160).optional(),
  message: z.string().trim().max(5000).optional(),
  sourcePage: z.string().trim().max(120).optional(),
  // Hidden field real users never fill in. Any value here means a bot did.
  // No length constraint on purpose: a schema rejection would 422 with a
  // field error naming this field, tipping a bot off that it's a honeypot.
  // Instead it's accepted, then checked after parsing and answered with a
  // fake success (see below) so the bot learns nothing either way.
  company: z.string().optional(),
});

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!checkRateLimit(`contact:${ip}`, 3)) {
    return NextResponse.json({ error: "Too many submissions. Please try again in a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Honeypot tripped — pretend success so the bot doesn't learn anything,
  // but skip every real side effect.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const { company: _company, ...data } = parsed.data;

  let lead;
  try {
    [lead] = await db.insert(leads).values(data).returning();
  } catch (err) {
    console.error("[contact] Failed to save lead:", err);
    return NextResponse.json({ error: "Message could not be sent. Please try again." }, { status: 500 });
  }

  bustTag(CACHE_TAGS.leads);

  // The lead is safely in the database at this point — everything below is
  // best-effort. An email outage must never look like a lost submission.
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_TO_EMAIL;
  const fromEmail = process.env.LEAD_FROM_EMAIL || "WYZREX <onboarding@resend.dev>";

  if (resendKey && toEmail && lead) {
    const resend = new Resend(resendKey);
    const notification = buildLeadNotificationEmail(lead);
    const autoReply = buildLeadAutoReplyEmail(lead);

    const [notifyResult, replyResult] = await Promise.allSettled([
      resend.emails.send({ from: fromEmail, to: toEmail, replyTo: lead.email, ...notification }),
      resend.emails.send({ from: fromEmail, to: lead.email, ...autoReply }),
    ]);

    if (notifyResult.status === "rejected") {
      console.error("[contact] Failed to send lead notification email:", notifyResult.reason);
    }
    if (replyResult.status === "rejected") {
      console.error("[contact] Failed to send lead auto-reply email:", replyResult.reason);
    }
  } else if (!resendKey || !toEmail) {
    console.warn("[contact] RESEND_API_KEY or LEAD_TO_EMAIL not set — lead saved, no email sent.");
  }

  return NextResponse.json({ ok: true });
}

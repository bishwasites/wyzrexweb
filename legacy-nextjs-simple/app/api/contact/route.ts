import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name: string;
  email: string;
  details: string;
}

function isValidPayload(body: unknown): body is ContactPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.trim().length > 0 &&
    b.name.length <= 200 &&
    typeof b.email === "string" &&
    EMAIL_RE.test(b.email) &&
    typeof b.details === "string" &&
    b.details.trim().length > 0 &&
    b.details.length <= 5000
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Please fill in every field with a valid email." }, { status: 422 });
  }

  const { name, email, details } = body;
  const toEmail = process.env.CONTACT_TO_EMAIL || "wyzrex@gmail.com";
  const resendApiKey = process.env.RESEND_API_KEY;

  // Without a RESEND_API_KEY configured (see .env.example), there is no mail
  // provider wired up — the submission is logged server-side and the client
  // still gets a success response so the form is usable in every environment.
  if (!resendApiKey) {
    console.log("[contact] RESEND_API_KEY not set — logging submission instead of sending email:", {
      name,
      email,
      details,
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "WYZREX Website <onboarding@resend.dev>",
        to: toEmail,
        reply_to: email,
        subject: `New project inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${details}`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[contact] Resend API error:", res.status, errText);
      return NextResponse.json({ error: "Message could not be sent. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] Failed to send:", err);
    return NextResponse.json({ error: "Message could not be sent. Please try again." }, { status: 502 });
  }
}

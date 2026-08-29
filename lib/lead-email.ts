import "server-only";
import type { NewLead } from "@/db/schema";

// Inline styles throughout — email clients strip <style> blocks unpredictably,
// so anything that has to render consistently in Gmail/Outlook goes on the tag.

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatColombo(date: Date): string {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  }).format(date);
}

/** Sent to LEAD_TO_EMAIL — every field, source page, timestamp, reply link. */
export function buildLeadNotificationEmail(lead: NewLead & { createdAt: Date }) {
  const rows: [string, string | null | undefined][] = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Service", lead.service],
    ["Source page", lead.sourcePage],
    ["Received", formatColombo(lead.createdAt) + " (Asia/Colombo)"],
  ];

  const rowsHtml = rows
    .filter(([, v]) => v)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #262626;color:#8a8a8a;font-size:13px;width:120px;vertical-align:top;">${label}</td>
          <td style="padding:10px 0;border-bottom:1px solid #262626;color:#ffffff;font-size:14px;">${escapeHtml(String(value))}</td>
        </tr>`
    )
    .join("");

  const html = `
  <div style="background:#0a0a0a;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;">
      <div style="padding:24px 28px;border-bottom:1px solid #262626;">
        <span style="color:#ffc629;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">New lead</span>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:600;">${escapeHtml(lead.name)} wants to build something</h1>
      </div>
      <div style="padding:24px 28px;">
        <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
        ${
          lead.message
            ? `<div style="margin-top:16px;">
                 <p style="color:#8a8a8a;font-size:13px;margin:0 0 6px;">Message</p>
                 <p style="color:#ffffff;font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0;">${escapeHtml(lead.message)}</p>
               </div>`
            : ""
        }
        <a href="mailto:${encodeURIComponent(lead.email)}" style="display:inline-block;margin-top:24px;background:#ffc629;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:999px;">Reply to ${escapeHtml(lead.name)}</a>
      </div>
    </div>
  </div>`;

  return {
    subject: `New lead — ${lead.name}${lead.service ? ` (${lead.service})` : ""}`,
    html,
  };
}

/** Sent to the submitter — a short confirmation, on-brand, no lead data beyond their own. */
export function buildLeadAutoReplyEmail(lead: Pick<NewLead, "name">) {
  const html = `
  <div style="background:#0a0a0a;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;">
      <div style="padding:28px;">
        <div style="color:#ffc629;font-size:20px;font-weight:800;letter-spacing:-0.01em;">WYZREX</div>
        <h1 style="margin:20px 0 8px;color:#ffffff;font-size:20px;font-weight:600;">Thanks, ${escapeHtml(lead.name)}.</h1>
        <p style="color:#b3b3b3;font-size:14px;line-height:1.6;margin:0;">
          We've got your message and someone from the team will get back to you within one business day.
          In the meantime, feel free to reply directly to this email if there's anything else worth knowing.
        </p>
        <p style="color:#595959;font-size:12px;margin:28px 0 0;">WYZREX · Colombo, Sri Lanka</p>
      </div>
    </div>
  </div>`;

  return {
    subject: "We've got your message — WYZREX",
    html,
  };
}

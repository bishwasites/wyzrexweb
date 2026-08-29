import { db } from "@/lib/db";
import { desc } from "drizzle-orm";
import { contactSubmissions } from "@/db/schema";
import { deleteMessage, markMessageRead } from "@/lib/actions/messages";
import { TrashIcon } from "@/components/site/Icons";

export default async function MessagesPage() {
  const messages = await db.query.contactSubmissions.findMany({ orderBy: desc(contactSubmissions.createdAt) });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Messages</h1>

      {messages.length === 0 ? (
        <p className="rounded-card-sm border border-dashed border-line p-10 text-center text-muted">
          No submissions yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-card-sm border p-5 ${m.read ? "border-line bg-surface" : "border-gold/50 bg-gold/5"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {m.name} <span className="font-normal text-muted">— {m.email}</span>
                  </p>
                  <p className="text-xs text-muted">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <form action={markMessageRead.bind(null, m.id, !m.read)}>
                    <button type="submit" className="rounded-pill border border-line px-3 py-1.5 text-xs font-medium hover:border-gold">
                      Mark as {m.read ? "unread" : "read"}
                    </button>
                  </form>
                  <form action={deleteMessage.bind(null, m.id)}>
                    <button type="submit" aria-label="Delete" className="flex h-8 w-8 items-center justify-center rounded-control border border-line text-red-600 hover:border-red-400">
                      <TrashIcon />
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, projects, topContents } from "@/db/schema";

export default async function AdminDashboardPage() {
  const [unreadLeads, allProjects, allContents, recentLeads] = await Promise.all([
    db.query.leads.findMany({ where: eq(leads.isRead, false) }),
    db.query.projects.findMany(),
    db.query.topContents.findMany(),
    db.query.leads.findMany({ orderBy: (l, { desc }) => desc(l.createdAt), limit: 5 }),
  ]);

  const cards = [
    { label: "Unread leads", value: unreadLeads.length, sub: "in the inbox", href: "/admin/leads" },
    { label: "Projects", value: allProjects.length, sub: "listed", href: "/admin/projects" },
    { label: "Top contents", value: allContents.length, sub: "listed", href: "/admin/top-contents" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-card-sm border border-line bg-surface p-6 transition-colors hover:border-gold"
          >
            <div className="text-4xl font-semibold text-gold">{card.value}</div>
            <div className="mt-2 text-sm font-medium">{card.label}</div>
            <div className="text-xs text-muted">{card.sub}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest leads</h2>
          <Link href="/admin/leads" className="text-sm font-semibold text-gold-dark hover:underline">
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="rounded-card-sm border border-dashed border-line p-8 text-center text-muted">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-card-sm border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-line last:border-0">
                    <td className={`px-4 py-3 ${lead.isRead ? "" : "font-semibold"}`}>{lead.name}</td>
                    <td className="px-4 py-3 text-muted">{lead.email}</td>
                    <td className="px-4 py-3 text-muted">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {lead.isRead ? (
                        <span className="text-muted">Read</span>
                      ) : (
                        <span className="rounded-pill bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-dark">New</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

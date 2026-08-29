"use client";

import { useMemo, useState } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { TrashIcon } from "@/components/site/Icons";
import type { Lead } from "@/db/schema";

function toCsv(rows: Lead[]): string {
  const headers = ["Name", "Email", "Phone", "Service", "Message", "Source page", "Received", "Read"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.name,
      r.email,
      r.phone ?? "",
      r.service ?? "",
      (r.message ?? "").replace(/\r?\n/g, " "),
      r.sourcePage ?? "",
      new Date(r.createdAt).toISOString(),
      r.isRead ? "Yes" : "No",
    ]
      .map((v) => escape(String(v)))
      .join(",")
  );
  return [headers.map(escape).join(","), ...lines].join("\r\n");
}

export default function LeadsManager({ initialRows }: { initialRows: Lead[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.phone, r.service, r.message].some((v) => v?.toLowerCase().includes(q))
    );
  }, [rows, query]);

  const unreadCount = rows.filter((r) => !r.isRead).length;

  async function toggleRead(lead: Lead) {
    const next = !lead.isRead;
    setRows((prev) => prev.map((r) => (r.id === lead.id ? { ...r, isRead: next } : r)));
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setRows((prev) => prev.map((r) => (r.id === lead.id ? { ...r, isRead: lead.isRead } : r)));
      toast("error", "Could not update lead");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const snapshot = rows;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    try {
      const res = await fetch(`/api/admin/leads?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("success", "Lead deleted");
      setDeleteTarget(null);
    } catch {
      setRows(snapshot);
      toast("error", "Could not delete lead");
    } finally {
      setDeleting(false);
    }
  }

  function exportCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Leads
          {unreadCount > 0 && (
            <span className="ml-3 rounded-pill bg-gold px-2.5 py-1 align-middle text-xs font-semibold text-[#0a0a0a]">
              {unreadCount} unread
            </span>
          )}
        </h1>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, message…"
            className="w-64 rounded-control border border-line bg-surface px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-pill border border-line px-4 py-2 text-sm font-medium hover:border-gold"
          >
            Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-card-sm border border-dashed border-line p-10 text-center text-muted">
          {rows.length === 0 ? "No leads yet." : "No leads match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card-sm border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th className="w-8 px-4 py-3" />
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => toggleRead(lead)}
                  className={`cursor-pointer border-b border-line last:border-0 hover:bg-surface/60 ${lead.isRead ? "" : "bg-gold/5"}`}
                >
                  <td className="px-4 py-3">
                    {!lead.isRead && <span className="block h-2 w-2 rounded-full bg-gold" aria-label="Unread" />}
                  </td>
                  <td className={`px-4 py-3 ${lead.isRead ? "" : "font-semibold"}`}>
                    {lead.name}
                    {lead.service && <div className="text-xs text-muted">{lead.service}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div>{lead.email}</div>
                    {lead.phone && <div className="text-xs text-muted">{lead.phone}</div>}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">{lead.message || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(lead);
                      }}
                      aria-label="Delete"
                      className="flex h-9 w-9 items-center justify-center rounded-control border border-line text-red-600 hover:border-red-400"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this lead?"
        description="This can't be undone."
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { PlusIcon, TrashIcon } from "@/components/site/Icons";
import type { FooterColumn, FooterLink } from "@/db/schema";

interface ColumnWithLinks extends FooterColumn {
  links: FooterLink[];
}

function groupLinks(columns: FooterColumn[], links: FooterLink[]): ColumnWithLinks[] {
  return columns.map((col) => ({
    ...col,
    links: links.filter((l) => l.columnId === col.id).sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

// Bespoke rather than ResourceManager-based: the footer is a two-level
// structure (columns containing links), and both levels drag-reorder
// independently, which the generic single-list manager doesn't model.
export default function FooterManager({
  initialColumns,
  initialLinks,
}: {
  initialColumns: FooterColumn[];
  initialLinks: FooterLink[];
}) {
  const [columns, setColumns] = useState<ColumnWithLinks[]>(groupLinks(initialColumns, initialLinks));
  const [deleteColumn, setDeleteColumn] = useState<ColumnWithLinks | null>(null);
  const [deleteLink, setDeleteLink] = useState<{ columnId: string; link: FooterLink } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  async function persistColumnOrder(next: ColumnWithLinks[]) {
    setColumns(next);
    try {
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource: "footer-columns", ids: next.map((c) => c.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast("error", "Could not save column order");
    }
  }

  async function persistLinkOrder(columnId: string, nextLinks: FooterLink[]) {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, links: nextLinks } : c)));
    try {
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource: "footer-links", ids: nextLinks.map((l) => l.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast("error", "Could not save link order");
    }
  }

  async function renameColumn(id: string, title: string) {
    try {
      const res = await fetch(`/api/admin/footer-columns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast("error", "Could not rename column");
    }
  }

  async function editLink(columnId: string, id: string, patch: Partial<Pick<FooterLink, "label" | "href">>) {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, links: c.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) } : c))
    );
    try {
      const res = await fetch(`/api/admin/footer-links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast("error", "Could not save link");
    }
  }

  async function addColumn() {
    try {
      const res = await fetch("/api/admin/footer-columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New column" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error();
      setColumns((prev) => [...prev, { ...json.row, links: [] }]);
      toast("success", "Column added");
    } catch {
      toast("error", "Could not add column");
    }
  }

  async function addLink(columnId: string) {
    try {
      const res = await fetch("/api/admin/footer-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, label: "New link", href: "/" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error();
      setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, links: [...c.links, json.row] } : c)));
    } catch {
      toast("error", "Could not add link");
    }
  }

  async function confirmDeleteColumn() {
    if (!deleteColumn) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/footer-columns?id=${deleteColumn.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setColumns((prev) => prev.filter((c) => c.id !== deleteColumn.id));
      toast("success", "Column deleted");
      setDeleteColumn(null);
    } catch {
      toast("error", "Could not delete column");
    } finally {
      setDeleting(false);
    }
  }

  async function confirmDeleteLink() {
    if (!deleteLink) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/footer-links?id=${deleteLink.link.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setColumns((prev) =>
        prev.map((c) =>
          c.id === deleteLink.columnId ? { ...c, links: c.links.filter((l) => l.id !== deleteLink.link.id) } : c
        )
      );
      toast("success", "Link deleted");
      setDeleteLink(null);
    } catch {
      toast("error", "Could not delete link");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Footer</h1>
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex items-center gap-2 rounded-pill bg-gold px-5 py-2.5 text-sm font-semibold text-[#0a0a0a]"
        >
          <PlusIcon />
          Add column
        </button>
      </div>

      <Reorder.Group
        axis="x"
        values={columns}
        onReorder={setColumns}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {columns.map((col) => (
          <Reorder.Item
            key={col.id}
            value={col}
            onDragEnd={() => persistColumnOrder(columns)}
            className="flex flex-col gap-3 rounded-card-sm border border-line bg-surface p-5"
          >
            <div className="flex items-center gap-2">
              <span className="cursor-grab text-muted active:cursor-grabbing">
                <GripVertical size={16} />
              </span>
              <input
                defaultValue={col.title}
                onBlur={(e) => renameColumn(col.id, e.target.value)}
                className="flex-1 rounded-control border border-transparent bg-transparent px-2 py-1 text-sm font-semibold hover:border-line focus:border-line focus:bg-bg"
              />
              <button
                type="button"
                onClick={() => setDeleteColumn(col)}
                aria-label="Delete column"
                className="flex h-8 w-8 items-center justify-center rounded-control text-red-600 hover:bg-bg"
              >
                <TrashIcon />
              </button>
            </div>

            <Reorder.Group
              axis="y"
              values={col.links}
              onReorder={(next) => setColumns((prev) => prev.map((c) => (c.id === col.id ? { ...c, links: next } : c)))}
              className="flex flex-col gap-1.5"
            >
              {col.links.map((link) => (
                <Reorder.Item
                  key={link.id}
                  value={link}
                  onDragEnd={() => persistLinkOrder(col.id, columns.find((c) => c.id === col.id)?.links ?? [])}
                  className="flex items-center gap-1.5 rounded-control border border-line bg-bg px-2 py-1.5"
                >
                  <span className="cursor-grab text-muted active:cursor-grabbing">
                    <GripVertical size={13} />
                  </span>
                  <input
                    defaultValue={link.label}
                    onBlur={(e) => editLink(col.id, link.id, { label: e.target.value })}
                    className="w-[38%] rounded border-0 bg-transparent px-1 py-0.5 text-xs font-medium focus:bg-surface"
                  />
                  <input
                    defaultValue={link.href}
                    onBlur={(e) => editLink(col.id, link.id, { href: e.target.value })}
                    className="flex-1 rounded border-0 bg-transparent px-1 py-0.5 text-xs text-muted focus:bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setDeleteLink({ columnId: col.id, link })}
                    aria-label="Delete link"
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-red-600 hover:bg-surface"
                  >
                    <TrashIcon />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <button
              type="button"
              onClick={() => addLink(col.id)}
              className="mt-1 flex items-center gap-1.5 self-start rounded-control px-2 py-1 text-xs font-medium text-gold-dark hover:bg-bg"
            >
              <PlusIcon />
              Add link
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <ConfirmDialog
        open={!!deleteColumn}
        title="Delete this column?"
        description="Its links will be deleted too. This can't be undone."
        busy={deleting}
        onConfirm={confirmDeleteColumn}
        onCancel={() => setDeleteColumn(null)}
      />
      <ConfirmDialog
        open={!!deleteLink}
        title="Delete this link?"
        busy={deleting}
        onConfirm={confirmDeleteLink}
        onCancel={() => setDeleteLink(null)}
      />
    </div>
  );
}

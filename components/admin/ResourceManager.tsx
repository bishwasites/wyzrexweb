"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Reorder } from "framer-motion";
import { Eye, EyeOff, GripVertical, Pencil } from "lucide-react";
import Drawer from "@/components/admin/Drawer";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import UploadField from "@/components/admin/UploadField";
import IconPicker from "@/components/admin/IconPicker";
import { useToast } from "@/components/admin/Toast";
import { PlusIcon, TrashIcon } from "@/components/site/Icons";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "upload" | "icon" | "checkbox";
  required?: boolean;
  options?: { value: string; label: string }[];
  accept?: string;
  placeholder?: string;
  /** Hint rendered under the field. */
  help?: string;
}

export interface ColumnConfig<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface ResourceRow {
  id: string;
  sortOrder?: number;
  isVisible?: boolean;
}

interface ResourceManagerProps<T extends ResourceRow> {
  resource: string;
  /** Plural display name, e.g. "Meta Ads". */
  title: string;
  /** Singular display name, e.g. "Meta Ad" — used for "Add {singular}". */
  singular: string;
  initialRows: T[];
  fields: FieldConfig[];
  columns: ColumnConfig<T>[];
  /** Set false for tables without a sort_order column. */
  reorderable?: boolean;
  /** Set false for tables without an is_visible column. */
  hasVisibility?: boolean;
  /** Values merged into every create, e.g. a parent foreign key. */
  fixedValues?: Record<string, unknown>;
  /** Hides the "Add" button for read-only lists such as Leads. */
  canCreate?: boolean;
}

export default function ResourceManager<T extends ResourceRow>({
  resource,
  title,
  singular,
  initialRows,
  fields,
  columns,
  reorderable = true,
  hasVisibility = true,
  fixedValues,
  canCreate = true,
}: ResourceManagerProps<T>) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  // Counts active uploads rather than a single boolean so a form with more
  // than one UploadField still blocks Save until all of them settle.
  const [uploadingCount, setUploadingCount] = useState(0);
  const isUploading = uploadingCount > 0;
  const toast = useToast();

  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // Server-rendered rows are the source of truth after a router refresh.
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const editingRow = editingId ? (rows.find((r) => r.id === editingId) ?? null) : null;
  const editingValues = editingRow as unknown as Record<string, unknown> | null;

  function openNew() {
    setError("");
    setUploadingCount(0);
    setEditingId(null);
    setDrawerOpen(true);
  }

  function openEdit(row: T) {
    setError("");
    setUploadingCount(0);
    setEditingId(row.id);
    setDrawerOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isUploading) return;
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = { ...fixedValues };
    for (const field of fields) {
      if (field.type === "checkbox") {
        payload[field.name] = form.get(field.name) === "on";
      } else {
        payload[field.name] = form.get(field.name) ?? "";
      }
    }

    try {
      const res = await fetch(`/api/admin/${resource}`, {
        method: editingRow ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRow ? { id: editingRow.id, ...payload } : payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");

      setRows((prev) =>
        editingRow ? prev.map((r) => (r.id === editingRow.id ? { ...r, ...json.row } : r)) : [...prev, json.row]
      );
      setDrawerOpen(false);
      toast("success", editingRow ? `${singular} updated` : `${singular} added`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast("error", message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    const snapshot = rows;
    // Optimistic: drop it immediately, restore if the request fails.
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    try {
      const res = await fetch(`/api/admin/${resource}?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast("success", `${singular} deleted`);
      setDeleteTarget(null);
    } catch {
      setRows(snapshot);
      toast("error", `Could not delete ${singular.toLowerCase()}`);
    } finally {
      setDeleting(false);
    }
  }

  async function toggleVisibility(row: T) {
    const next = !row.isVisible;
    const snapshot = rows;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isVisible: next } : r)));
    try {
      const res = await fetch(`/api/admin/${resource}/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: next }),
      });
      if (!res.ok) throw new Error();
      toast("success", next ? "Now visible" : "Hidden");
    } catch {
      setRows(snapshot);
      toast("error", "Could not change visibility");
    }
  }

  async function persistOrder() {
    const ids = rowsRef.current.map((r) => r.id);
    try {
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource, ids }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.map((row, index) => ({ ...row, sortOrder: index })));
      toast("success", "Order saved");
    } catch {
      toast("error", "Could not save order");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {canCreate && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-pill bg-gold px-5 py-2.5 text-sm font-semibold text-[#0a0a0a]"
          >
            <PlusIcon />
            Add
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-card-sm border border-dashed border-line p-10 text-center text-muted">Nothing here yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-card-sm border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                {reorderable && <th className="w-10 px-4 py-3" />}
                {columns.map((col) => (
                  <th key={col.header} className="whitespace-nowrap px-4 py-3 font-semibold">
                    {col.header}
                  </th>
                ))}
                <th className="w-32 px-4 py-3" />
              </tr>
            </thead>
            <Reorder.Group as="tbody" axis="y" values={rows} onReorder={reorderable ? setRows : () => {}}>
              {rows.map((row) => (
                <Reorder.Item
                  key={row.id}
                  value={row}
                  as="tr"
                  drag={reorderable ? "y" : false}
                  onDragEnd={reorderable ? persistOrder : undefined}
                  className="border-b border-line bg-bg last:border-0 hover:bg-surface/60"
                >
                  {reorderable && (
                    <td className="cursor-grab px-4 py-3 text-muted active:cursor-grabbing">
                      <GripVertical size={16} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`px-4 py-3 align-middle ${row.isVisible === false ? "opacity-45" : ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {hasVisibility && (
                        <button
                          type="button"
                          onClick={() => toggleVisibility(row)}
                          aria-label={row.isVisible === false ? "Show" : "Hide"}
                          title={row.isVisible === false ? "Hidden — click to show" : "Visible — click to hide"}
                          className="flex h-9 w-9 items-center justify-center rounded-control border border-line hover:border-gold"
                        >
                          {row.isVisible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        aria-label="Edit"
                        className="flex h-9 w-9 items-center justify-center rounded-control border border-line hover:border-gold"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        aria-label="Delete"
                        className="flex h-9 w-9 items-center justify-center rounded-control border border-line text-red-600 hover:border-red-400"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </table>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        title={editingRow ? `Edit ${singular}` : `Add ${singular}`}
        onClose={() => setDrawerOpen(false)}
      >
        <form key={editingId ?? "new"} onSubmit={handleSubmit} className="flex flex-col gap-5">
          {fields.map((field) => {
            const raw = editingValues?.[field.name];
            const currentValue = raw == null ? "" : String(raw);

            if (field.type === "upload") {
              return (
                <UploadField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  defaultValue={currentValue}
                  accept={field.accept}
                  onUploadingChange={(uploading) =>
                    setUploadingCount((count) => Math.max(0, count + (uploading ? 1 : -1)))
                  }
                />
              );
            }

            if (field.type === "icon") {
              return <IconPicker key={field.name} name={field.name} label={field.label} defaultValue={currentValue} />;
            }

            if (field.type === "checkbox") {
              const checked = raw === undefined ? true : Boolean(raw);
              return (
                <label key={field.name} className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    name={field.name}
                    defaultChecked={checked}
                    className="h-4 w-4 accent-[#ffc629]"
                  />
                  {field.label}
                </label>
              );
            }

            return (
              <div key={field.name} className="flex flex-col gap-2">
                <label className="text-sm font-medium">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    required={field.required}
                    defaultValue={currentValue}
                    rows={5}
                    placeholder={field.placeholder}
                    className="rounded-control border border-line bg-bg px-3 py-2 text-sm"
                  />
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    required={field.required}
                    defaultValue={currentValue || field.options?.[0]?.value}
                    className="rounded-control border border-line bg-bg px-3 py-2 text-sm"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    required={field.required}
                    defaultValue={currentValue}
                    placeholder={field.placeholder}
                    className="rounded-control border border-line bg-bg px-3 py-2 text-sm"
                  />
                )}
                {field.help && <p className="text-xs text-muted">{field.help}</p>}
              </div>
            );
          })}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving || isUploading}
            className="mt-2 w-fit rounded-pill bg-gold px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] disabled:opacity-60"
          >
            {isUploading ? "Waiting for upload…" : saving ? "Saving…" : editingRow ? "Save changes" : `Add ${singular}`}
          </button>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete this ${singular.toLowerCase()}?`}
        description="This can't be undone."
        busy={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

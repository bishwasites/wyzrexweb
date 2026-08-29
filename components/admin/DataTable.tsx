import clsx from "clsx";
import type { ReactNode } from "react";

interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string }>({ columns, rows, emptyMessage }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="rounded-card-sm border border-dashed border-line p-10 text-center text-muted">
        {emptyMessage ?? "Nothing here yet."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card-sm border border-line">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-surface">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-4 py-3 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line last:border-0 hover:bg-surface/60">
              {columns.map((col) => (
                <td key={col.header} className={clsx("px-4 py-3 align-middle", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

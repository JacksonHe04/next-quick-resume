import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export type DataTableColumn<TRow> = {
  key: string;
  header: ReactNode;
  className?: string;
  render(row: TRow): ReactNode;
};

export function DataTable<TRow>({
  columns,
  rows,
  rowKey,
  empty,
  className,
}: {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  rowKey(row: TRow): string;
  empty?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[18px] border border-[#dce5dd] bg-white",
        className,
      )}
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#f6f8f4] text-xs font-medium text-[#687269]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "border-b border-[#dce5dd] px-4 py-3",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-[#edf0ed] transition last:border-0 hover:bg-[#fbfcf9]"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn("px-4 py-3.5", column.className)}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <div className="grid min-h-36 place-items-center px-6 py-8 text-center text-sm text-[#687269]">
          {empty ?? "这里还没有数据"}
        </div>
      ) : null}
    </div>
  );
}

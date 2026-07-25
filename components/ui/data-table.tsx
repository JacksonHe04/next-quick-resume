import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
        "overflow-hidden rounded-lg border border-border bg-background",
        className,
      )}
    >
      <div className="divide-y divide-border sm:hidden">
        {rows.map((row) => (
          <article key={rowKey(row)} className="space-y-3 p-4">
            {columns.map((column) => (
              <div
                key={column.key}
                className={cn(
                  "flex items-start justify-between gap-4",
                  column.className,
                )}
              >
                <div className="shrink-0 pt-0.5 text-[11px] font-medium text-muted-foreground">
                  {column.header}
                </div>
                <div className="min-w-0 text-right">
                  {column.render(row)}
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
      <Table className="hidden sm:table">
        <TableHeader className="bg-muted/60">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn("px-4 text-xs", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              className="hover:bg-muted/45"
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn("px-4 py-3.5", column.className)}
                >
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 ? (
        <div className="grid min-h-36 place-items-center px-6 py-8 text-center text-sm text-muted-foreground">
          {empty ?? "这里还没有数据"}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { Check, LayoutGrid, List, LoaderCircle } from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type EditableCellType =
  | "text"
  | "textarea"
  | "date"
  | "datetime-local"
  | "number"
  | "select";

export type DataTableEditableColumn<TRow> = {
  label: string;
  value(row: TRow): string | number | null | undefined;
  type?: EditableCellType;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean | ((row: TRow) => boolean);
  readOnlyReason?: string;
  onSave(row: TRow, value: string): Promise<void>;
};

export type DataTableColumn<TRow> = {
  key: string;
  header: ReactNode;
  className?: string;
  render(row: TRow): ReactNode;
  editable?: DataTableEditableColumn<TRow>;
};

function EditableCell<TRow>({
  row,
  editable,
  children,
}: {
  row: TRow;
  editable: DataTableEditableColumn<TRow>;
  children: ReactNode;
}) {
  const sourceValue = String(editable.value(row) ?? "");
  const disabled =
    typeof editable.disabled === "function"
      ? editable.disabled(row)
      : Boolean(editable.disabled);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(sourceValue);
  const [state, setState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [error, setError] = useState<string>();
  const submitted = useRef(false);

  useEffect(() => {
    if (!editing) setValue(sourceValue);
  }, [editing, sourceValue]);

  async function save() {
    if (submitted.current || value === sourceValue) {
      setEditing(false);
      return;
    }
    submitted.current = true;
    setState("saving");
    setError(undefined);
    try {
      await editable.onSave(row, value);
      setEditing(false);
      setState("saved");
      window.setTimeout(() => setState("idle"), 1400);
    } catch (saveError) {
      setState("error");
      setError((saveError as Error).message);
    } finally {
      submitted.current = false;
    }
  }

  function cancel() {
    setValue(sourceValue);
    setEditing(false);
    setError(undefined);
    setState("idle");
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      void save();
    }
  }

  if (disabled) {
    return (
      <div title={editable.readOnlyReason} className="cursor-default">
        {children}
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="group/edit relative min-w-0">
        <button
          type="button"
          aria-label={`编辑${editable.label}：${sourceValue || "空"}`}
          onClick={() => {
            setEditing(true);
            setState("idle");
          }}
          className="-mx-2 -my-1.5 block min-h-8 w-[calc(100%+1rem)] rounded-md px-2 py-1.5 text-left outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {children}
        </button>
        {state === "saved" ? (
          <span className="absolute right-1 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded bg-background/90 px-1.5 text-[10px] font-medium text-[#3d8c5a] shadow-sm">
            <Check size={10} />
            已保存
          </span>
        ) : null}
      </div>
    );
  }

  const sharedProps = {
    "aria-label": editable.label,
    value,
    autoFocus: true,
    onChange: (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setValue(event.target.value),
  };

  return (
    <div className="min-w-40">
      {editable.type === "textarea" ? (
        <div className="space-y-2">
          <textarea
            {...sharedProps}
            rows={4}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancel();
            }}
            className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-2 text-sm leading-5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => void save()}>
              保存
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel}>
              取消
            </Button>
          </div>
        </div>
      ) : editable.type === "select" ? (
        <select
          {...sharedProps}
          onKeyDown={handleKeyDown}
          onBlur={() => void save()}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        >
          {editable.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          {...sharedProps}
          type={editable.type ?? "text"}
          onKeyDown={handleKeyDown}
          onBlur={() => void save()}
          className="h-9 min-w-40"
        />
      )}
      {state === "saving" ? (
        <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <LoaderCircle size={10} className="animate-spin" />
          保存中
        </span>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1 text-[10px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TableCellContent<TRow>({
  column,
  row,
}: {
  column: DataTableColumn<TRow>;
  row: TRow;
}) {
  const content = column.render(row);
  return column.editable ? (
    <EditableCell row={row} editable={column.editable}>
      {content}
    </EditableCell>
  ) : (
    content
  );
}

export function DataTable<TRow>({
  columns,
  rows,
  rowKey,
  empty,
  className,
  viewStorageKey,
  gridCard,
  view: controlledView,
  hideViewSwitch = false,
}: {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  rowKey(row: TRow): string;
  empty?: ReactNode;
  className?: string;
  viewStorageKey?: string;
  gridCard?: (row: TRow) => ReactNode;
  view?: "table" | "grid";
  hideViewSwitch?: boolean;
}) {
  const storageKey = viewStorageKey
    ? `sayless:view:${viewStorageKey}`
    : null;
  const [view, setView] = useState<"table" | "grid">("table");
  const resolvedView = controlledView ?? view;

  useEffect(() => {
    if (!storageKey || !gridCard) return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "grid") setView("grid");
  }, [gridCard, storageKey]);

  function changeView(next: "table" | "grid") {
    setView(next);
    if (storageKey) window.localStorage.setItem(storageKey, next);
  }

  return (
    <div className={className}>
      {gridCard && !hideViewSwitch ? (
        <div className="mb-3 flex justify-end">
          <div
            className="inline-flex rounded-md border border-border bg-background p-0.5"
            aria-label="视图"
          >
            <button
              type="button"
              aria-label="表格视图"
              aria-pressed={resolvedView === "table"}
              onClick={() => changeView("table")}
              className={cn(
                "grid size-8 place-items-center rounded-sm text-muted-foreground transition",
                resolvedView === "table" &&
                  "bg-foreground text-background shadow-sm",
              )}
            >
              <List size={15} />
            </button>
            <button
              type="button"
              aria-label="卡片视图"
              aria-pressed={resolvedView === "grid"}
              onClick={() => changeView("grid")}
              className={cn(
                "grid size-8 place-items-center rounded-sm text-muted-foreground transition",
                resolvedView === "grid" &&
                  "bg-foreground text-background shadow-sm",
              )}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      ) : null}

      {resolvedView === "grid" && gridCard ? (
        rows.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <div key={rowKey(row)}>{gridCard(row)}</div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-36 place-items-center rounded-lg border border-border bg-background px-6 py-8 text-center text-sm text-muted-foreground">
            {empty ?? "这里还没有数据"}
          </div>
        )
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "h-9 px-3 text-[11px] font-medium text-muted-foreground",
                      column.className,
                    )}
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
                  className="hover:bg-muted/35"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "h-12 px-3 py-2.5 align-middle",
                        column.className,
                      )}
                    >
                      <TableCellContent column={column} row={row} />
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
      )}
    </div>
  );
}

"use client";

import { LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type DataView = "table" | "grid";

export function useDataView(storageName: string): [DataView, (view: DataView) => void] {
  const storageKey = `sayless:view:${storageName}`;
  const [view, setView] = useState<DataView>("table");

  useEffect(() => {
    if (window.localStorage.getItem(storageKey) === "grid") {
      setView("grid");
    }
  }, [storageKey]);

  function changeView(next: DataView) {
    setView(next);
    window.localStorage.setItem(storageKey, next);
  }

  return [view, changeView];
}

export function DataViewSwitch({
  view,
  onChange,
  className,
}: {
  view: DataView;
  onChange: (view: DataView) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-lg border border-border bg-muted/60 p-0.5",
        className,
      )}
      aria-label="数据视图"
    >
      <button
        type="button"
        aria-label="表格视图"
        aria-pressed={view === "table"}
        onClick={() => onChange("table")}
        className={cn(
          "grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
          view === "table" && "bg-background text-foreground shadow-xs",
        )}
      >
        <List size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="卡片视图"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
          view === "grid" && "bg-background text-foreground shadow-xs",
        )}
      >
        <LayoutGrid size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

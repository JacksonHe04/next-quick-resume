"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const APP_TOPBAR_PORTAL_ID = "sayless-app-topbar";

export function AppTopbarPortal({
  children,
  className,
  fallbackLabel = "页面工具栏",
}: {
  children: ReactNode;
  className?: string;
  fallbackLabel?: string;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setContainer(window.document.getElementById(APP_TOPBAR_PORTAL_ID));
    setResolved(true);
  }, []);

  const content = (
    <div
      className={cn(
        "flex h-full min-w-max w-full items-center gap-2 px-3 sm:px-4",
        className,
      )}
    >
      {children}
    </div>
  );

  if (!resolved) return null;
  if (!container) {
    return (
      <header
        aria-label={fallbackLabel}
        className="flex h-16 shrink-0 items-center border-b border-border bg-background"
      >
        {content}
      </header>
    );
  }

  return createPortal(content, container);
}

export function AppTopbarDivider({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-0.5 h-6 w-px shrink-0 bg-border", className)}
    />
  );
}

export function TopbarFilterMenu({
  children,
  activeCount = 0,
  onClear,
  label = "筛选",
  contentClassName,
}: {
  children: ReactNode;
  activeCount?: number;
  onClear?: () => void;
  label?: string;
  contentClassName?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary">
          <SlidersHorizontal aria-hidden="true" />
          {label}
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className={cn("w-[min(22rem,calc(100vw-2rem))] gap-3 p-3", contentClassName)}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            缩小当前数据范围
          </p>
          {activeCount > 0 && onClear ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
            >
              <X aria-hidden="true" />
              清除
            </Button>
          ) : null}
        </div>
        <div className="grid gap-2">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

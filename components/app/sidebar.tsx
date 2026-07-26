"use client";

import {
  Building2,
  CalendarRange,
  FileText,
  HelpCircle,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Video,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import {
  Fragment,
  type ComponentType,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type SVGProps,
} from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const SIDEBAR_DEFAULT_WIDTH = 240;
export const SIDEBAR_MIN_WIDTH = 208;
export const SIDEBAR_MAX_WIDTH = 360;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

export const NAV_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: Icon;
}> = [
  { href: "/app", label: "SAYLESS", icon: LayoutDashboard },
  { href: "/app/resumes", label: "简历", icon: FileText },
  { href: "/app/submissions", label: "投递", icon: Send },
  { href: "/app/interviews", label: "面试", icon: Video },
  { href: "/app/questions", label: "题库", icon: HelpCircle },
  { href: "/app/companies", label: "公司", icon: Building2 },
  { href: "/app/batches", label: "批次", icon: CalendarRange },
];

function isActivePath(pathname: string, href: string): boolean {
  return href === "/app"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  account,
  className,
  collapsed = false,
  collapsible = false,
  onNavigate,
  onResizeStateChange,
  onToggleCollapsed,
  onWidthChange,
  pathname = "",
  width = SIDEBAR_DEFAULT_WIDTH,
}: {
  account: ReactNode;
  className?: string;
  collapsed?: boolean;
  collapsible?: boolean;
  onNavigate?: () => void;
  onResizeStateChange?: (resizing: boolean) => void;
  onToggleCollapsed?: () => void;
  onWidthChange?: (width: number) => void;
  pathname?: string;
  width?: number;
}) {
  function startResize(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    onResizeStateChange?.(true);
  }

  function resize(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    onWidthChange?.(
      Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, event.clientX)),
    );
  }

  function stopResize(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onResizeStateChange?.(false);
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 24 : 8;
    let nextWidth: number | undefined;
    if (event.key === "ArrowLeft") nextWidth = width - step;
    if (event.key === "ArrowRight") nextWidth = width + step;
    if (event.key === "Home") nextWidth = SIDEBAR_MIN_WIDTH;
    if (event.key === "End") nextWidth = SIDEBAR_MAX_WIDTH;
    if (nextWidth === undefined) return;
    event.preventDefault();
    onWidthChange?.(
      Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, nextWidth)),
    );
  }

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "group/sidebar relative flex h-full w-[240px] flex-col border-r border-border bg-background",
        collapsible && "w-full",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border px-3",
          collapsed && "justify-center",
        )}
      >
        {!collapsed ? (
          <Link
            href="/app"
            onClick={onNavigate}
            className="flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2"
            aria-label="SAYLESS 首页"
          >
            <BrandMark size="sm" className="rounded-md" />
            <span className="truncate text-sm font-semibold tracking-[-0.02em]">
              SAYLESS
            </span>
          </Link>
        ) : null}
        {collapsible ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "展开侧栏" : "折叠侧栏"}
            title={collapsed ? "展开侧栏" : "折叠侧栏"}
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed ? "mx-auto" : "ml-auto",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={18} aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      <TooltipProvider delayDuration={250}>
        <nav
          aria-label="主要导航"
          className="mt-3 flex flex-1 flex-col gap-0.5 px-3"
        >
          {NAV_ITEMS.map(({ href, label, icon: IconComponent }) => {
            const active = isActivePath(pathname, href);
            const link = (
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                className={cn(
                  "group flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0",
                  active && "bg-muted font-medium text-foreground",
                )}
              >
                <IconComponent
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span className={collapsed ? "sr-only" : "truncate"}>
                  {label}
                </span>
              </Link>
            );

            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Fragment key={href}>{link}</Fragment>
            );
          })}
        </nav>
      </TooltipProvider>

      <div
        className={cn("border-t border-border p-3", collapsed && "px-2")}
        onClick={onNavigate}
      >
        {account}
      </div>

      {collapsible && !collapsed ? (
        <div
          role="separator"
          aria-label="调整侧栏宽度"
          aria-orientation="vertical"
          aria-valuemin={SIDEBAR_MIN_WIDTH}
          aria-valuemax={SIDEBAR_MAX_WIDTH}
          aria-valuenow={Math.round(width)}
          tabIndex={0}
          onPointerDown={startResize}
          onPointerMove={resize}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
          onLostPointerCapture={() => onResizeStateChange?.(false)}
          onKeyDown={resizeWithKeyboard}
          className="absolute inset-y-0 right-0 z-10 w-1 cursor-col-resize touch-none outline-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-transparent after:transition-colors hover:after:bg-foreground/30 focus-visible:after:w-0.5 focus-visible:after:bg-foreground/45"
        />
      ) : null}
    </aside>
  );
}

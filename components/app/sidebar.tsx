"use client";

import {
  Building2,
  CalendarRange,
  FileText,
  HelpCircle,
  Send,
  Video,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import {
  Fragment,
  type ComponentType,
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

export const SIDEBAR_COLLAPSED_WIDTH = 64;

export const NAV_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: Icon;
}> = [
  { href: "/resumes", label: "简历", icon: FileText },
  { href: "/submissions", label: "投递", icon: Send },
  { href: "/interviews", label: "面试", icon: Video },
  { href: "/questions", label: "题库", icon: HelpCircle },
  { href: "/companies", label: "公司", icon: Building2 },
  { href: "/batches", label: "批次", icon: CalendarRange },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  account,
  className,
  collapsed = false,
  onNavigate,
  pathname = "",
}: {
  account: ReactNode;
  className?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  pathname?: string;
}) {
  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "group/sidebar relative flex h-full flex-col border-r border-border bg-background",
        collapsed ? "w-16" : "w-[240px]",
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
            href="/resumes"
            onClick={onNavigate}
            className="flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2"
            aria-label="SAYLESS 首页"
          >
            <BrandMark size="sm" className="rounded-md" />
            <span className="truncate text-sm font-semibold tracking-[-0.02em]">
              SAYLESS
            </span>
          </Link>
        ) : (
          <Link
            href="/resumes"
            onClick={onNavigate}
            className="grid size-9 place-items-center rounded-lg"
            aria-label="SAYLESS 首页"
          >
            <BrandMark size="sm" className="rounded-md" />
          </Link>
        )}
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
    </aside>
  );
}

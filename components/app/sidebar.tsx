"use client";

import {
  Building2,
  CalendarRange,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Send,
  Video,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

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
  onNavigate,
  pathname = "",
}: {
  account: ReactNode;
  className?: string;
  onNavigate?: () => void;
  pathname?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-[240px] flex-col border-r border-border bg-background",
        className,
      )}
    >
      <Link
        href="/app"
        onClick={onNavigate}
        className="mx-3 mt-3 flex h-12 items-center gap-2.5 rounded-lg px-2.5"
        aria-label="SAYLESS 首页"
      >
        <span className="grid size-7 place-items-center rounded-md bg-foreground text-xs font-semibold text-background">
          S
        </span>
        <span className="text-sm font-semibold tracking-[-0.02em]">
          SAYLESS
        </span>
      </Link>

      <nav
        aria-label="主要导航"
        className="mt-4 flex flex-1 flex-col gap-0.5 px-3"
      >
        {NAV_ITEMS.map(({ href, label, icon: IconComponent }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
                active &&
                  "bg-muted font-medium text-foreground",
              )}
            >
              <IconComponent
                size={18}
                strokeWidth={active ? 2.2 : 1.8}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3" onClick={onNavigate}>
        {account}
      </div>
    </aside>
  );
}

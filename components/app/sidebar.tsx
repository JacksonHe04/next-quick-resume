"use client";

import {
  Building2,
  CalendarRange,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Send,
  LogIn,
  Video,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

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
  user,
  className,
  onNavigate,
  pathname = "",
  onLogout,
}: {
  user: { name: string; email: string } | null;
  className?: string;
  onNavigate?: () => void;
  pathname?: string;
  onLogout?: () => void | Promise<void>;
}) {
  const initials = user?.name.trim().slice(0, 1).toUpperCase() || "S";

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

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-muted text-xs font-medium text-foreground">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name ?? "访客模式"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? "浏览演示数据"}
            </p>
          </div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1">
          {user ? (
            <>
              <Link
                href="/app/settings"
                onClick={onNavigate}
                className="flex h-8 items-center justify-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings size={14} />
                设置
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="flex h-8 items-center justify-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut size={14} />
                退出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={onNavigate}
              className="col-span-2 flex h-8 items-center justify-center gap-1.5 rounded-md bg-foreground text-xs font-medium text-background transition-opacity hover:opacity-85"
            >
              <LogIn size={14} />
              登录后开始记录
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

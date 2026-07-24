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
  Sparkles,
  Video,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/utils/cn";

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
  user: { name: string; email: string };
  className?: string;
  onNavigate?: () => void;
  pathname?: string;
  onLogout?: () => void | Promise<void>;
}) {
  const initials = user.name.trim().slice(0, 1).toUpperCase() || "S";

  return (
    <aside
      className={cn(
        "flex h-full w-[248px] flex-col border-r border-[#dce5dd] bg-[#f8faf6]",
        className,
      )}
    >
      <Link
        href="/app"
        onClick={onNavigate}
        className="mx-4 mt-4 flex h-14 items-center gap-3 rounded-2xl px-3"
        aria-label="SAYLESS 首页"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-[#27764b] text-white shadow-[0_9px_22px_rgb(39_118_75/0.18)]">
          <Sparkles size={17} strokeWidth={2.2} />
        </span>
        <span className="font-[var(--font-display)] text-[17px] font-semibold tracking-[-0.03em]">
          SAYLESS
        </span>
      </Link>

      <nav
        aria-label="主要导航"
        className="mt-5 flex flex-1 flex-col gap-1 px-3"
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
                "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#687269] transition",
                "hover:bg-[#eef4ee] hover:text-[#202620]",
                active &&
                  "bg-white text-[#27764b] shadow-[0_6px_22px_rgb(32_38_32/0.07)] ring-1 ring-[#dce5dd]",
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

      <div className="m-3 rounded-2xl border border-[#dce5dd] bg-white p-2 shadow-[0_8px_28px_rgb(32_38_32/0.05)]">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dff1e5] font-[var(--font-display)] text-sm font-semibold text-[#27764b]">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#202620]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[#879088]">{user.email}</p>
          </div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1 border-t border-[#edf0ed] pt-2">
          <Link
            href="/app/settings"
            onClick={onNavigate}
            className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg text-xs text-[#687269] transition hover:bg-[#eef4ee] hover:text-[#202620]"
          >
            <Settings size={14} />
            设置
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg text-xs text-[#687269] transition hover:bg-[#fbecef] hover:text-[#9d4450]"
          >
            <LogOut size={14} />
            退出
          </button>
        </div>
      </div>
    </aside>
  );
}

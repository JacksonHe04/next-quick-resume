"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";

export function SidebarAccountClient({
  user,
}: {
  user: { name: string; email: string } | null;
}) {
  const initials = user?.name.trim().slice(0, 1).toUpperCase() || "S";

  return (
    <Link
      href={user ? "/settings" : "/login"}
      aria-label={
        user ? `打开 ${user.name} 的个人设置` : "登录后开始记录"
      }
      title={user ? "个人设置" : "登录后开始记录"}
      className="flex min-w-0 items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-muted text-xs font-medium text-foreground">
        {user ? initials : <LogIn size={15} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1 group-data-[collapsed=true]/sidebar:sr-only">
        <span className="block truncate text-sm font-medium text-foreground">
          {user?.name ?? "访客模式"}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {user?.email ?? "登录后开始记录"}
        </span>
      </span>
    </Link>
  );
}

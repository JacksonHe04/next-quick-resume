"use client";

import { LogIn, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SidebarAccountClient({
  user,
}: {
  user: { name: string; email: string } | null;
}) {
  const initials = user?.name.trim().slice(0, 1).toUpperCase() || "S";
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
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
              className="flex h-8 items-center justify-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings size={14} aria-hidden="true" />
              设置
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex h-8 items-center justify-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={14} aria-hidden="true" />
              退出
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="col-span-2 flex h-8 items-center justify-center gap-1.5 rounded-md bg-foreground text-xs font-medium text-background transition-opacity hover:opacity-85"
          >
            <LogIn size={14} aria-hidden="true" />
            登录后开始记录
          </Link>
        )}
      </div>
    </>
  );
}

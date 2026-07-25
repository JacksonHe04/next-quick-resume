"use client";

import { Menu, UserRound, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Sidebar } from "@/components/app/sidebar";

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string } | null;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar user={user} pathname={pathname} onLogout={logout} />
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/15 backdrop-blur-[2px]"
            aria-label="关闭导航"
            onClick={() => setMenuOpen(false)}
          />
          <Sidebar
            user={user}
            pathname={pathname}
            onLogout={logout}
            className="relative z-10 shadow-2xl"
            onNavigate={() => setMenuOpen(false)}
          />
        </div>
      ) : null}

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            aria-label={menuOpen ? "关闭导航" : "打开导航"}
            onClick={() => setMenuOpen((value) => !value)}
            className="grid size-8 place-items-center rounded-md border border-border bg-background"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <span className="text-sm font-semibold tracking-[-0.02em]">
            SAYLESS
          </span>
          <span className="grid size-8 place-items-center rounded-full border border-border bg-muted text-foreground">
            <UserRound size={17} />
          </span>
        </header>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

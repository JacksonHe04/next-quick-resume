"use client";

import { Menu, UserRound, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Sidebar } from "@/components/app/sidebar";

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string };
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
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar user={user} pathname={pathname} onLogout={logout} />
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#202620]/20 backdrop-blur-[2px]"
            aria-label="关闭导航"
            onClick={() => setMenuOpen(false)}
          />
          <Sidebar
            user={user}
            pathname={pathname}
            onLogout={logout}
            className="relative z-10 shadow-[20px_0_60px_rgb(32_38_32/0.14)]"
            onNavigate={() => setMenuOpen(false)}
          />
        </div>
      ) : null}

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dce5dd]/80 bg-[#f6f7f2]/88 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            aria-label={menuOpen ? "关闭导航" : "打开导航"}
            onClick={() => setMenuOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-xl border border-[#dce5dd] bg-white"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <span className="font-[var(--font-display)] font-semibold tracking-[-0.03em]">
            SAYLESS
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-[#dff1e5] text-[#27764b]">
            <UserRound size={17} />
          </span>
        </header>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

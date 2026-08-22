"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import {
  APP_TOPBAR_PORTAL_ID,
} from "@/components/app/app-topbar";
import { BottomNav } from "@/components/app/bottom-nav";
import { SIDEBAR_COLLAPSED_WIDTH, Sidebar } from "@/components/app/sidebar";

export function AppShell({
  account,
  children,
}: {
  account: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      className="h-dvh overflow-hidden bg-background print:block print:h-auto print:overflow-visible lg:grid"
      style={{
        gridTemplateColumns: `${SIDEBAR_COLLAPSED_WIDTH}px minmax(0, 1fr)`,
      }}
    >
      {/* 桌面端左侧图标栏 */}
      <div className="fixed inset-y-0 left-0 z-40 hidden print:hidden lg:block" style={{ width: SIDEBAR_COLLAPSED_WIDTH }}>
        <Sidebar account={account} pathname={pathname} collapsed />
      </div>

      <div className="flex h-dvh min-w-0 flex-col overflow-hidden print:block print:h-auto print:overflow-visible lg:col-start-2">
        <header className="relative z-30 flex h-16 min-w-0 shrink-0 items-center border-b border-border bg-background/95 backdrop-blur-xl print:hidden">
          <div
            id={APP_TOPBAR_PORTAL_ID}
            className="h-full min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-none pb-20 print:overflow-visible lg:pb-0">
          {children}
        </main>
      </div>

      {/* 移动端底部导航 */}
      <BottomNav />
    </div>
  );
}

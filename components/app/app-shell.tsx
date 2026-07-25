"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  APP_TOPBAR_PORTAL_ID,
} from "@/components/app/app-topbar";
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  Sidebar,
} from "@/components/app/sidebar";

const SIDEBAR_WIDTH_KEY = "sayless:sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "sayless:sidebar-collapsed";

export function AppShell({
  account,
  children,
}: {
  account: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const storedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_KEY));
    if (
      Number.isFinite(storedWidth) &&
      storedWidth >= SIDEBAR_MIN_WIDTH &&
      storedWidth <= SIDEBAR_MAX_WIDTH
    ) {
      setSidebarWidth(storedWidth);
    }
    setSidebarCollapsed(
      window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true",
    );
  }, []);

  useEffect(() => {
    if (!resizingSidebar) return;
    const previousCursor = window.document.body.style.cursor;
    const previousUserSelect = window.document.body.style.userSelect;
    window.document.body.style.cursor = "col-resize";
    window.document.body.style.userSelect = "none";
    return () => {
      window.document.body.style.cursor = previousCursor;
      window.document.body.style.userSelect = previousUserSelect;
    };
  }, [resizingSidebar]);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  function updateSidebarWidth(width: number) {
    setSidebarWidth(width);
    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(Math.round(width)));
  }

  const renderedSidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : sidebarWidth;

  return (
    <div
      className={
        resizingSidebar
          ? "h-dvh overflow-hidden bg-background print:block print:h-auto print:overflow-visible lg:grid"
          : "h-dvh overflow-hidden bg-background transition-[grid-template-columns] duration-200 ease-out print:block print:h-auto print:overflow-visible lg:grid"
      }
      style={{
        gridTemplateColumns: `${renderedSidebarWidth}px minmax(0, 1fr)`,
      }}
    >
      <div
        className={
          resizingSidebar
            ? "fixed inset-y-0 left-0 z-40 hidden print:hidden lg:block"
            : "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 ease-out print:hidden lg:block"
        }
        style={{ width: renderedSidebarWidth }}
      >
        <Sidebar
          account={account}
          pathname={pathname}
          width={sidebarWidth}
          collapsed={sidebarCollapsed}
          collapsible
          onToggleCollapsed={toggleSidebar}
          onWidthChange={updateSidebarWidth}
          onResizeStateChange={setResizingSidebar}
        />
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
            account={account}
            pathname={pathname}
            collapsed={false}
            className="relative z-10 shadow-2xl"
            onNavigate={() => setMenuOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex h-dvh min-w-0 flex-col overflow-hidden print:block print:h-auto print:overflow-visible lg:col-start-2">
        <header className="relative z-30 flex h-16 min-w-0 shrink-0 items-center border-b border-border bg-background/95 backdrop-blur-xl print:hidden">
          <button
            type="button"
            aria-label={menuOpen ? "关闭导航" : "打开导航"}
            onClick={() => setMenuOpen((value) => !value)}
            className="ml-3 grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background lg:hidden"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <div
            id={APP_TOPBAR_PORTAL_ID}
            className="h-full min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-none print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}

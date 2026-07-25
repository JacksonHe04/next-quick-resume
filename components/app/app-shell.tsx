"use client";

import { Menu, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

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
          ? "min-h-screen bg-background print:block lg:grid"
          : "min-h-screen bg-background transition-[grid-template-columns] duration-200 ease-out print:block lg:grid"
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

      <div className="print:block lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl print:hidden lg:hidden">
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/components/app/sidebar";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="底部导航"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl print:hidden lg:hidden"
    >
      <ul className="flex items-center justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1.5">
        {NAV_ITEMS.map(({ href, label, icon: IconComponent }) => {
          const active = isActivePath(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] text-muted-foreground transition-colors",
                  "hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                <IconComponent
                  size={20}
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setPending(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [pathname]);

  useEffect(() => {
    function begin() {
      setPending(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPending(false), 12_000);
    }

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        isModifiedClick(event)
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      ) {
        return;
      }
      begin();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", begin);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", begin);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-pending={pending ? "true" : "false"}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
    >
      <span className="navigation-progress-bar block h-full bg-[#3e9b60]" />
    </div>
  );
}

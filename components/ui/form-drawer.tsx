"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function FormDrawer({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose(): void;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#202620]/18 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-drawer-title"
        className={cn(
          "flex h-full w-full max-w-[520px] flex-col border-l border-[#dce5dd] bg-white shadow-[-24px_0_70px_rgb(32_38_32/0.12)]",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-6 border-b border-[#e6ebe6] px-6 py-5">
          <div>
            <h2
              id="form-drawer-title"
              className="font-[var(--font-display)] text-xl font-semibold tracking-[-0.02em] text-[#202620]"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-[#687269]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full text-[#687269] transition hover:bg-[#eef4ee] hover:text-[#202620]"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
        {footer ? (
          <footer className="border-t border-[#e6ebe6] bg-[#fbfcf9] px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}

"use client";

import { Eye, Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import { renderSafeMarkdown } from "@/lib/markdown";
import { cn } from "@/utils/cn";

export function MarkdownEditor({
  value,
  onChange,
  label = "Markdown 内容",
  placeholder,
  minHeight = 260,
}: {
  value: string;
  onChange(value: string): void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const html = useMemo(() => renderSafeMarkdown(value), [value]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dce5dd] bg-white">
      <div className="flex items-center justify-between border-b border-[#edf0ed] bg-[#f8faf6] px-3 py-2">
        <span className="px-1 text-xs font-medium text-[#687269]">
          {label}
        </span>
        <div className="flex rounded-lg border border-[#dce5dd] bg-white p-0.5">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={cn(
              "inline-flex min-h-7 items-center gap-1.5 rounded-md px-2.5 text-xs text-[#687269]",
              mode === "write" && "bg-[#eef4ee] text-[#27764b]",
            )}
          >
            <Pencil size={12} />
            编辑
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "inline-flex min-h-7 items-center gap-1.5 rounded-md px-2.5 text-xs text-[#687269]",
              mode === "preview" && "bg-[#eef4ee] text-[#27764b]",
            )}
          >
            <Eye size={12} />
            预览
          </button>
        </div>
      </div>
      {mode === "write" ? (
        <textarea
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="block w-full resize-y border-0 bg-white px-4 py-4 font-[var(--font-data)] text-xs leading-6 text-[#202620] outline-none"
        />
      ) : (
        <div
          style={{ minHeight }}
          className="space-y-3 px-5 py-4 text-sm leading-7 text-[#4f5951] [&_a]:text-[#27764b] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#9fd1ae] [&_blockquote]:pl-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}

"use client";

import {
  ArrowLeft,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  FilePlus2,
  Menu,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type ResumeViewMode = "preview" | "edit";

function ModeToggle({
  mode,
  onChange,
}: {
  mode: ResumeViewMode;
  onChange: (mode: ResumeViewMode) => void;
}) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1">
      <button
        type="button"
        onClick={() => onChange("preview")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
          mode === "preview"
            ? "bg-white text-gray-800 shadow-sm"
            : "text-gray-500 hover:text-gray-700",
        )}
      >
        <Eye className="size-4" />
        形式
      </button>
      <button
        type="button"
        onClick={() => onChange("edit")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
          mode === "edit"
            ? "bg-white text-gray-800 shadow-sm"
            : "text-gray-500 hover:text-gray-700",
        )}
      >
        <Edit3 className="size-4" />
        内容
      </button>
    </div>
  );
}

export function ResumeTopbar({
  name,
  viewMode,
  syncState,
  showLeftSidebar,
  onNameChange,
  onViewModeChange,
  onRetry,
  onExportPdf,
  onExportMarkdown,
  onToggleLeftSidebar,
  onToggleRightSidebar,
}: {
  name: string;
  viewMode: ResumeViewMode;
  syncState: "saved" | "saving" | "error";
  showLeftSidebar: boolean;
  onNameChange: (name: string) => void;
  onViewModeChange: (mode: ResumeViewMode) => void;
  onRetry: () => void;
  onExportPdf: () => void;
  onExportMarkdown: () => void;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
}) {
  const [showExport, setShowExport] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) setDraftName(name);
  }, [editing, name]);

  useEffect(() => {
    function closeExport(event: MouseEvent) {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setShowExport(false);
      }
    }
    document.addEventListener("mousedown", closeExport);
    return () => document.removeEventListener("mousedown", closeExport);
  }, []);

  function saveName() {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    onNameChange(trimmed);
    setEditing(false);
  }

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") saveName();
    if (event.key === "Escape") {
      setDraftName(name);
      setEditing(false);
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-2 shadow-sm sm:px-4 print:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onToggleLeftSidebar}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
          aria-label="切换左侧边栏"
        >
          <Menu className="size-5 text-gray-600" />
        </button>

        <Link
          href="/app/resumes"
          aria-label="返回简历列表"
          className="hidden rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 sm:grid sm:place-items-center"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div
          className={cn(
            "shrink-0",
            showLeftSidebar ? "block" : "hidden lg:block",
          )}
        >
          <ModeToggle mode={viewMode} onChange={onViewModeChange} />
        </div>

        <div className="hidden h-8 w-px bg-gray-300 sm:block" />

        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          {editing ? (
            <>
              <input
                autoFocus
                aria-label="简历名称"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={handleNameKeyDown}
                className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setDraftName(name);
                  setEditing(false);
                }}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveName}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                确认
              </button>
            </>
          ) : (
            <button
              type="button"
              aria-label={`编辑简历名称：${name}`}
              onClick={() => setEditing(true)}
              className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 transition-all duration-200 hover:border-blue-400"
            >
              <span className="max-w-52 truncate text-sm font-medium text-gray-800">
                {name}
              </span>
              <Pencil className="size-4 shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />
            </button>
          )}

          <span
            role="status"
            className={cn(
              "text-xs",
              syncState === "error" ? "text-red-600" : "text-gray-500",
            )}
          >
            {syncState === "saved"
              ? "已保存"
              : syncState === "saving"
                ? "保存中…"
                : "保存失败，重试"}
          </span>
          {syncState === "error" ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-red-600 underline"
            >
              重试
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleRightSidebar}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
          aria-label="切换右侧边栏"
        >
          <Menu className="size-5 text-gray-600" />
        </button>

        <Link
          href="/app/resumes"
          className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 sm:flex"
        >
          <FilePlus2 className="size-4" />
          创建简历
        </Link>

        <div ref={exportRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setShowExport((value) => !value)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
          >
            <Download className="size-4" />
            导出
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                showExport && "rotate-180",
              )}
            />
          </button>
          {showExport ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  onExportPdf();
                  setShowExport(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                导出为 PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportMarkdown();
                  setShowExport(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                导出为 Markdown
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

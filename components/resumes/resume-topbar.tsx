"use client";

import {
  Check,
  Copy,
  Download,
  List,
  Menu,
  Pencil,
  Share2,
} from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";

import { AppTopbarPortal } from "@/components/app/app-topbar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ResumeTopbar({
  name,
  onNameChange,
  onExportPdf,
  onCopyMarkdown,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onClone,
  canClone = true,
  cloneBusy = false,
  canShare = true,
  isPublic,
  shareBusy = false,
  onToggleShare,
  shareUrl,
}: {
  name: string;
  onNameChange: (name: string) => void;
  onExportPdf: () => void;
  onCopyMarkdown: () => Promise<void>;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  onClone?: () => void;
  canClone?: boolean;
  cloneBusy?: boolean;
  canShare?: boolean;
  isPublic: boolean;
  shareBusy?: boolean;
  onToggleShare: () => void;
  shareUrl: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [markdownCopied, setMarkdownCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!editing) setDraftName(name);
  }, [editing, name]);

  useEffect(() => {
    if (!markdownCopied) return;
    const timer = window.setTimeout(() => setMarkdownCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [markdownCopied]);

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

  async function copyMarkdown() {
    try {
      await onCopyMarkdown();
      setMarkdownCopied(true);
    } catch {
      setMarkdownCopied(false);
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1400);
    } catch {
      // 剪贴板不可用时静默失败，链接本身仍展示在弹层里
    }
  }

  return (
    <AppTopbarPortal
      className="justify-between"
      fallbackLabel="简历编辑工具栏"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onToggleLeftSidebar}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="切换左侧栏"
        >
          <Menu className="size-4" />
        </button>
        <button
          type="button"
          onClick={onToggleRightSidebar}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="切换简历列表"
        >
          <List className="size-4" />
        </button>

        <div className="hidden h-7 w-px shrink-0 bg-border lg:block" />

        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          {editing ? (
            <>
              <input
                autoFocus
                aria-label="简历名称"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={handleNameKeyDown}
                className="h-8 w-44 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraftName(name);
                  setEditing(false);
                }}
              >
                取消
              </Button>
              <Button type="button" size="sm" onClick={saveName}>
                确认
              </Button>
            </>
          ) : (
            <button
              type="button"
              aria-label={`编辑简历名称：${name}`}
              onClick={() => setEditing(true)}
              className="group flex h-8 min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 transition-colors hover:bg-muted"
            >
              <span className="max-w-44 truncate text-sm font-medium text-foreground">
                {name}
              </span>
              <Pencil className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      <TooltipProvider delayDuration={250}>
        <div className="flex shrink-0 items-center gap-1.5">
          {canClone && onClone ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  loading={cloneBusy}
                  onClick={onClone}
                >
                  <Copy aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">克隆简历</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>
                克隆简历
              </TooltipContent>
            </Tooltip>
          ) : null}

          {canShare ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    isPublic &&
                      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700",
                  )}
                >
                  <Share2 aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">
                    {isPublic ? "公开分享中" : "公开分享"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-72 gap-3 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Share2 className="size-4" aria-hidden="true" />
                    公开分享
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-label={`${isPublic ? "停止" : "开启"}公开分享`}
                    aria-checked={isPublic}
                    disabled={shareBusy}
                    onClick={onToggleShare}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
                      isPublic ? "bg-[#4d9669]" : "bg-muted-foreground/25",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block size-3.5 rounded-full bg-white transition-transform",
                        isPublic ? "translate-x-[18px]" : "translate-x-1",
                      )}
                    />
                  </button>
                </div>
                {isPublic ? (
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      任何人可通过以下链接查看这份简历：
                    </p>
                    <div className="mt-1 flex items-center gap-1 rounded-md border border-border bg-muted/25 p-1 pl-2">
                      <span
                        title={shareUrl}
                        className="min-w-0 flex-1 truncate font-[var(--font-data)] text-[11px] text-muted-foreground"
                      >
                        {shareUrl}
                      </span>
                      <button
                        type="button"
                        aria-label="复制分享链接"
                        onClick={() => void copyShareLink()}
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-md transition-colors",
                          linkCopied
                            ? "bg-emerald-100 text-emerald-700"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {linkCopied ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </PopoverContent>
            </Popover>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                data-state={markdownCopied ? "copied" : "idle"}
                onClick={() => void copyMarkdown()}
                className={cn(
                  markdownCopied &&
                    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700",
                )}
              >
                {markdownCopied ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : (
                  <Copy aria-hidden="true" className="size-3.5" />
                )}
                <span className="sr-only">
                  {markdownCopied ? "已复制 Markdown" : "复制为 Markdown"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              {markdownCopied ? "已复制 Markdown" : "复制为 Markdown"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onExportPdf}
              >
                <Download aria-hidden="true" className="size-3.5" />
                <span className="sr-only">导出为 PDF</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              导出为 PDF
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </AppTopbarPortal>
  );
}

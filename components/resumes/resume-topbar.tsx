"use client";

import {
  ChevronDown,
  Download,
  Edit3,
  Eye,
  Menu,
  Pencil,
} from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";

import { AppTopbarPortal } from "@/components/app/app-topbar";
import { ResumeWorkspaceSwitch } from "@/components/resumes/resume-workspace-switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <div className="flex rounded-lg bg-muted p-0.5">
      <button
        type="button"
        onClick={() => onChange("preview")}
        className={cn(
          "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
          mode === "preview"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Eye className="size-4" />
        版式
      </button>
      <button
        type="button"
        onClick={() => onChange("edit")}
        className={cn(
          "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
          mode === "edit"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Edit3 className="size-4" />
        内容
      </button>
    </div>
  );
}

export function ResumeTopbar({
  editorHref,
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
  editorHref: string;
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
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);

  useEffect(() => {
    if (!editing) setDraftName(name);
  }, [editing, name]);

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
    <AppTopbarPortal
      className="justify-between"
      fallbackLabel="简历编辑工具栏"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onToggleLeftSidebar}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="切换左侧边栏"
        >
          <Menu className="size-4" />
        </button>

        <ResumeWorkspaceSwitch
          mode="edit"
          editorHref={editorHref}
          compact
        />

        <div
          className={cn(
            "h-7 w-px shrink-0 bg-border",
            showLeftSidebar ? "block" : "hidden lg:block",
          )}
        />

        <div className={showLeftSidebar ? "block" : "hidden lg:block"}>
          <ModeToggle mode={viewMode} onChange={onViewModeChange} />
        </div>

        <div className="hidden h-7 w-px shrink-0 bg-border xl:block" />

        <div className="hidden min-w-0 items-center gap-2 xl:flex">
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
              <Button
                type="button"
                size="sm"
                onClick={saveName}
              >
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

          <span
            role="status"
            className={cn(
              "text-xs",
              syncState === "error"
                ? "text-destructive"
                : syncState === "saved"
                  ? "text-[#3d8c5a]"
                  : "text-muted-foreground",
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
              className="text-xs text-destructive underline"
            >
              重试
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleRightSidebar}
          className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="切换右侧边栏"
        >
          <Menu className="size-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download aria-hidden="true" />
              <span className="hidden sm:inline">导出</span>
              <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={onExportPdf}>
              导出为 PDF
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onExportMarkdown}>
              导出为 Markdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </AppTopbarPortal>
  );
}

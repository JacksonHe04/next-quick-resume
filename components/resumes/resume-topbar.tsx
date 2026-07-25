"use client";

import {
  ChevronDown,
  Download,
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

export function ResumeTopbar({
  editorHref,
  name,
  onNameChange,
  onExportPdf,
  onExportMarkdown,
  onToggleLeftSidebar,
}: {
  editorHref: string;
  name: string;
  onNameChange: (name: string) => void;
  onExportPdf: () => void;
  onExportMarkdown: () => void;
  onToggleLeftSidebar: () => void;
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
        />

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

        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
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

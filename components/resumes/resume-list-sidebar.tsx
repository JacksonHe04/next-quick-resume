"use client";

import { Check, Link2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResumeRecord } from "@/modules/resumes/service";

export function ResumeListSidebar({
  currentId,
  resumes,
  onSelect,
  onCreate,
  onDelete,
  canCreate = true,
}: {
  currentId: string;
  resumes: ResumeRecord[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (resume: ResumeRecord) => void;
  canCreate?: boolean;
}) {
  const [activeMenuId, setActiveMenuId] = useState<string>();
  const sorted = [...resumes].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() -
      new Date(left.updatedAt).getTime(),
  );

  function requestDelete(resume: ResumeRecord) {
    setActiveMenuId(undefined);
    if (window.confirm(`确定要删除简历“${resume.name}”吗？此操作不可恢复。`)) {
      onDelete(resume);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="border-b border-border px-3 py-3">
        <Button
          type="button"
          className="w-full"
          onClick={onCreate}
          disabled={!canCreate}
          title={canCreate ? undefined : "访客模式不支持新建简历"}
        >
          <Plus aria-hidden="true" />
          新建简历
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain p-3">
        {sorted.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">
            还没有简历，先创建一份
          </p>
        ) : null}
        {sorted.map((resume) => {
          const active = resume.id === currentId;
          return (
            <div key={resume.id} className="group relative">
              <button
                type="button"
                aria-label={`切换到${resume.name}`}
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect(resume.id)}
                className={cn(
                  "block w-full cursor-pointer rounded-lg border bg-background p-3 text-left transition-colors",
                  active
                    ? "border-[#55a572]/45 bg-[#55a572]/8"
                    : "border-border hover:bg-muted/60",
                )}
              >
                {active ? (
                  <span className="absolute right-9 top-2.5 grid size-5 place-items-center rounded-full bg-[#4d9669] text-white">
                    <Check className="size-3" strokeWidth={2} />
                  </span>
                ) : null}
                <h3 className="mb-1 truncate pr-14 text-sm font-medium text-foreground">
                  {resume.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(resume.updatedAt).toLocaleString("zh-CN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {resume.isPublic ? (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#3d8c5a]">
                    <Link2 className="size-3" aria-hidden="true" />
                    已公开
                  </p>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveMenuId((current) =>
                    current === resume.id ? undefined : resume.id,
                  )
                }
                className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-md text-muted-foreground opacity-0 transition-colors hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100"
                aria-label={`更多操作：${resume.name}`}
              >
                <MoreVertical className="size-4" />
              </button>
              {activeMenuId === resume.id ? (
                <>
                  <button
                    type="button"
                    aria-label="关闭菜单"
                    onClick={() => setActiveMenuId(undefined)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-2 top-10 z-50 w-40 rounded-lg border border-border bg-popover p-1 shadow-md">
                    <button
                      type="button"
                      onClick={() => requestDelete(resume)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                      删除
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

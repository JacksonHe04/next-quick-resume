"use client";

import { Check, MoreVertical, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { IntentLink } from "@/components/app/intent-link";
import { appFetch } from "@/lib/app-fetch";
import { cn } from "@/lib/utils";
import type { ResumeRecord } from "@/modules/resumes/service";

export function ResumeListSidebar({
  currentId,
  resumes,
}: {
  currentId: string;
  resumes: ResumeRecord[];
}) {
  const router = useRouter();
  const [activeMenuId, setActiveMenuId] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const sorted = [...resumes].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() -
      new Date(left.updatedAt).getTime(),
  );

  async function removeResume(resume: ResumeRecord) {
    if (!window.confirm(`确定要删除简历“${resume.name}”吗？此操作不可恢复。`)) {
      return;
    }
    setDeletingId(resume.id);
    const response = await appFetch(`/api/resumes/${resume.id}`, {
      method: "DELETE",
    });
    setDeletingId(undefined);
    if (!response.ok) return;
    const fallback = sorted.find((item) => item.id !== resume.id);
    if (resume.id === currentId) {
      router.replace(
        fallback ? `/app/resumes/${fallback.id}` : "/app/resumes",
      );
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">所有简历</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            选择一份继续编辑
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="刷新简历列表"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {sorted.map((resume) => {
            const active = resume.id === currentId;
            return (
              <div key={resume.id} className="group relative">
                <IntentLink
                  href={`/app/resumes/${resume.id}`}
                  aria-label={`切换到${resume.name}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block cursor-pointer rounded-lg border bg-background p-3 transition-colors",
                    active
                      ? "border-[#55a572]/45 bg-[#55a572]/8"
                      : "border-border hover:bg-muted/60",
                  )}
                >
                  {active ? (
                    <span className="absolute right-9 top-2.5 grid size-5 place-items-center rounded-full bg-[#4d9669] text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : null}
                  <h3 className="mb-1 truncate pr-14 text-sm font-medium text-foreground">
                    {resume.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    更新于{" "}
                    {new Date(resume.updatedAt).toLocaleString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-2 truncate text-xs text-muted-foreground/75">
                    {resume.document.data.header.name || "未命名"}
                  </p>
                </IntentLink>
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
                  <div className="absolute right-2 top-10 z-50 w-32 rounded-lg border border-border bg-popover p-1 shadow-md">
                    <button
                      type="button"
                      disabled={deletingId === resume.id}
                      onClick={() => void removeResume(resume)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                      删除
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          共 {sorted.length} 份简历
        </p>
      </div>
    </div>
  );
}

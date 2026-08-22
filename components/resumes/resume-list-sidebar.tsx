"use client";

import {
  Check,
  Copy,
  Link2,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { IntentLink } from "@/components/app/intent-link";
import { Button } from "@/components/ui/button";
import { appFetch } from "@/lib/app-fetch";
import { cn } from "@/lib/utils";
import { createResume } from "@/modules/resumes/client-actions";
import type { ResumeRecord } from "@/modules/resumes/service";

function shareUrlFor(id: string) {
  return `${window.location.origin}/resumes/share/${id}`;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-[#4d9669]" : "bg-muted-foreground/25",
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 rounded-full bg-white transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-1",
        )}
      />
    </button>
  );
}

export function ResumeListSidebar({
  currentId,
  resumes,
}: {
  currentId: string;
  resumes: ResumeRecord[];
}) {
  const router = useRouter();
  const [activeMenuId, setActiveMenuId] = useState<string>();
  const [pendingId, setPendingId] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const [copiedId, setCopiedId] = useState<string>();
  const [error, setError] = useState<string>();
  const [creating, setCreating] = useState(false);
  const sorted = [...resumes].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() -
      new Date(left.updatedAt).getTime(),
  );

  async function createNew() {
    setCreating(true);
    setError(undefined);
    try {
      const resume = await createResume("我的简历");
      router.push(`/resumes/${resume.id}`);
    } catch (createError) {
      setError((createError as Error).message);
      setCreating(false);
    }
  }

  async function cloneResumeRecord(resume: ResumeRecord) {
    setPendingId(resume.id);
    setError(undefined);
    const response = await appFetch(`/api/resumes/${resume.id}/clone`, {
      method: "POST",
    });
    setPendingId(undefined);
    setActiveMenuId(undefined);
    if (!response.ok) {
      setError("克隆失败，请稍后重试");
      return;
    }
    router.refresh();
  }

  async function toggleShare(resume: ResumeRecord) {
    setPendingId(resume.id);
    setError(undefined);
    const response = await appFetch(`/api/resumes/${resume.id}/public`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isPublic: !resume.isPublic }),
    });
    setPendingId(undefined);
    if (!response.ok) {
      setError("公开状态更新失败，请稍后重试");
      return;
    }
    router.refresh();
  }

  async function copyShareLink(resume: ResumeRecord) {
    try {
      await navigator.clipboard.writeText(shareUrlFor(resume.id));
      setCopiedId(resume.id);
      window.setTimeout(() => setCopiedId(undefined), 1400);
    } catch {
      setError("复制链接失败");
    }
  }

  async function removeResume(resume: ResumeRecord) {
    if (!window.confirm(`确定要删除简历“${resume.name}”吗？此操作不可恢复。`)) {
      return;
    }
    setDeletingId(resume.id);
    const response = await appFetch(`/api/resumes/${resume.id}`, {
      method: "DELETE",
    });
    setDeletingId(undefined);
    setActiveMenuId(undefined);
    if (!response.ok) return;
    const fallback = sorted.find((item) => item.id !== resume.id);
    if (resume.id === currentId) {
      router.replace(
        fallback ? `/resumes/${fallback.id}` : "/resumes",
      );
    } else {
      router.refresh();
    }
  }

  return (
    <div className="min-h-full bg-background p-3">
      <Button
        type="button"
        className="mb-3 w-full"
        onClick={() => void createNew()}
        loading={creating}
      >
        <Plus aria-hidden="true" />
        新建简历
      </Button>

      <div className="space-y-2">
        {sorted.map((resume) => {
          const active = resume.id === currentId;
          return (
            <div key={resume.id} className="group relative">
              <IntentLink
                href={`/resumes/${resume.id}`}
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
                <>
                  <button
                    type="button"
                    aria-label="关闭菜单"
                    onClick={() => setActiveMenuId(undefined)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-2 top-10 z-50 w-64 rounded-lg border border-border bg-popover p-1 shadow-md">
                    <button
                      type="button"
                      disabled={pendingId === resume.id}
                      onClick={() => void cloneResumeRecord(resume)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      <Copy className="size-4" />
                      克隆简历
                    </button>

                    <div className="my-1 h-px bg-border" />

                    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                      <span className="flex items-center gap-2 text-sm text-foreground">
                        <Link2 className="size-4" />
                        公开分享
                      </span>
                      <Toggle
                        label={`${resume.isPublic ? "停止" : "开启"}公开分享`}
                        checked={resume.isPublic}
                        onChange={() => void toggleShare(resume)}
                      />
                    </div>
                    {resume.isPublic ? (
                      <div className="px-2 pb-1.5">
                        <p className="text-[11px] text-muted-foreground">
                          任何人可通过以下链接查看：
                        </p>
                        <div className="mt-1 flex items-center gap-1 rounded-md border border-border bg-muted/25 p-1 pl-2">
                          <span
                            title={shareUrlFor(resume.id)}
                            className="min-w-0 flex-1 truncate font-[var(--font-data)] text-[11px] text-muted-foreground"
                          >
                            {shareUrlFor(resume.id)}
                          </span>
                          <button
                            type="button"
                            aria-label="复制分享链接"
                            onClick={() => void copyShareLink(resume)}
                            className={cn(
                              "grid size-6 shrink-0 place-items-center rounded-md transition-colors",
                              copiedId === resume.id
                                ? "bg-emerald-100 text-emerald-700"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {copiedId === resume.id ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="my-1 h-px bg-border" />

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
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-3 px-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

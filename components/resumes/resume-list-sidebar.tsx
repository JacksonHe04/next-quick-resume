"use client";

import { Check, MoreVertical, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
        <h2 className="text-lg font-semibold text-gray-800">简历列表</h2>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-full p-2 transition-colors hover:bg-gray-200"
          aria-label="刷新简历列表"
        >
          <RefreshCw className="size-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {sorted.map((resume) => {
            const active = resume.id === currentId;
            return (
              <div key={resume.id} className="group relative">
                <Link
                  href={`/app/resumes/${resume.id}`}
                  aria-label={`切换到${resume.name}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block cursor-pointer rounded-lg border-2 bg-white p-4 transition-all duration-200",
                    active
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
                  )}
                >
                  {active ? (
                    <span className="absolute right-10 top-2 rounded-full bg-blue-500 p-1 text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : null}
                  <h3 className="mb-1 truncate pr-16 font-medium text-gray-800">
                    {resume.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    更新于{" "}
                    {new Date(resume.updatedAt).toLocaleString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-2 truncate text-xs text-gray-400">
                    {resume.document.data.header.name || "未命名"}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuId((current) =>
                      current === resume.id ? undefined : resume.id,
                    )
                  }
                  className="absolute right-2 top-2 rounded-full p-1.5 text-gray-500 opacity-0 transition-colors hover:bg-gray-200 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`更多操作：${resume.name}`}
                >
                  <MoreVertical className="size-5" />
                </button>
                {activeMenuId === resume.id ? (
                  <div className="absolute right-2 top-10 z-50 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      disabled={deletingId === resume.id}
                      onClick={() => void removeResume(resume)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
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

      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <p className="text-center text-xs text-gray-500">
          共 {sorted.length} 份简历
        </p>
      </div>
    </div>
  );
}

"use client";

import { Copy, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button, Card, Input } from "@/components/ui";
import { createDefaultResumeDocument } from "@/modules/resumes/defaults";
import type { ResumeRecord } from "@/modules/resumes/service";

export function ResumeManager() {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [newName, setNewName] = useState("我的简历");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const response = await fetch("/api/resumes", { cache: "no-store" });
    if (!response.ok) throw new Error("简历列表加载失败");
    const payload = (await response.json()) as {
      resumes: ResumeRecord[];
    };
    setResumes(payload.resumes);
  }, []);

  useEffect(() => {
    load()
      .catch((loadError) => setError((loadError as Error).message))
      .finally(() => setLoading(false));
  }, [load]);

  async function create() {
    setPending(true);
    setError(undefined);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: newName,
          document: createDefaultResumeDocument(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        resume?: ResumeRecord;
        error?: { message?: string };
      };
      if (!response.ok || !payload.resume) {
        throw new Error(payload.error?.message ?? "创建失败");
      }
      window.location.href = `/app/resumes/${payload.resume.id}`;
    } catch (createError) {
      setError((createError as Error).message);
      setPending(false);
    }
  }

  async function mutate(id: string, action: "clone" | "delete") {
    const response = await fetch(
      `/api/resumes/${id}${action === "clone" ? "/clone" : ""}`,
      { method: action === "clone" ? "POST" : "DELETE" },
    );
    if (!response.ok) {
      setError(action === "clone" ? "克隆失败" : "删除失败");
      return;
    }
    await load();
  }

  return (
    <>
      <Card className="mt-7 p-5 shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-2 block text-sm font-medium">新简历名称</span>
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              maxLength={120}
            />
          </label>
          <Button
            onClick={create}
            loading={pending}
            disabled={!newName.trim()}
          >
            <Plus size={16} />
            新建简历
          </Button>
        </div>
      </Card>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-4 py-3 text-sm text-[#9d4450]"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-[18px] border border-[#dce5dd] bg-white/60"
              />
            ))
          : resumes.map((resume) => (
              <Card key={resume.id} className="p-5 shadow-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <FileText size={19} className="text-[#55a572]" />
                    <Link
                      href={`/app/resumes/${resume.id}`}
                      className="mt-4 block font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em] hover:text-[#27764b]"
                    >
                      {resume.name}
                    </Link>
                    <p className="mt-2 text-xs text-[#879088]">
                      {resume.document.data.header.name || "未填写姓名"} · v
                      {resume.version}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="克隆简历"
                      onClick={() => mutate(resume.id, "clone")}
                      className="grid size-8 place-items-center rounded-lg text-[#879088] hover:bg-[#eef4ee] hover:text-[#27764b]"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="删除简历"
                      onClick={() => mutate(resume.id, "delete")}
                      className="grid size-8 place-items-center rounded-lg text-[#879088] hover:bg-[#fbecef] hover:text-[#9d4450]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
      </div>

      {!loading && resumes.length === 0 ? (
        <Card className="mt-5 grid min-h-60 place-items-center p-8 text-center shadow-none">
          <div>
            <FileText size={24} className="mx-auto text-[#55a572]" />
            <p className="mt-4 text-sm font-medium">还没有简历</p>
            <p className="mt-1 text-xs text-[#879088]">
              创建第一份简历后，内容会安全保存在个人空间中。
            </p>
          </div>
        </Card>
      ) : null}
    </>
  );
}

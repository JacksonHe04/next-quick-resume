"use client";

import { Copy, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  DataTable,
  Input,
  type DataTableColumn,
} from "@/components/ui";
import { appFetch, patchJson } from "@/lib/app-fetch";
import { createDefaultResumeDocument } from "@/modules/resumes/defaults";
import type { ResumeRecord } from "@/modules/resumes/service";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function ResumeManager() {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [newName, setNewName] = useState("我的简历");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const response = await appFetch("/api/resumes", { cache: "no-store" });
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
      const response = await appFetch("/api/resumes", {
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

  async function rename(resume: ResumeRecord, value: string) {
    await patchJson(`/api/resumes/${resume.id}`, {
      id: resume.id,
      version: resume.version,
      name: value,
      document: resume.document,
    });
    await load();
  }

  async function mutate(id: string, action: "clone" | "delete") {
    const response = await appFetch(
      `/api/resumes/${id}${action === "clone" ? "/clone" : ""}`,
      { method: action === "clone" ? "POST" : "DELETE" },
    );
    if (!response.ok) {
      setError(action === "clone" ? "克隆失败" : "删除失败");
      return;
    }
    await load();
  }

  const columns: DataTableColumn<ResumeRecord>[] = [
    {
      key: "name",
      header: "简历名称",
      className: "min-w-56",
      render: (resume) => (
        <span className="inline-flex items-center gap-2 font-medium">
          <FileText size={14} className="text-[#55a572]" />
          {resume.name}
        </span>
      ),
      editable: {
        label: "简历名称",
        value: (resume) => resume.name,
        onSave: rename,
      },
    },
    {
      key: "person",
      header: "姓名",
      render: (resume) => (
        <span>{resume.document.data.header.name || "未填写"}</span>
      ),
    },
    {
      key: "direction",
      header: "求职方向",
      render: (resume) => (
        <span className="text-muted-foreground">
          {resume.document.data.header.jobInfo.position || "未填写"}
        </span>
      ),
    },
    {
      key: "version",
      header: "版本",
      render: (resume) => (
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          v{resume.version}
        </span>
      ),
    },
    {
      key: "updated",
      header: "更新时间",
      render: (resume) => (
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          {formatDate(resume.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">操作</span>,
      className: "w-24 text-right",
      render: (resume) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/app/resumes/${resume.id}`}
            aria-label="打开简历编辑器"
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <FileText size={14} />
          </Link>
          <button
            type="button"
            aria-label="克隆简历"
            onClick={() => void mutate(resume.id, "clone")}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            aria-label="删除简历"
            onClick={() => void mutate(resume.id, "delete")}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="w-full max-w-sm">
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

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        {loading ? (
          <div className="h-72 animate-pulse rounded-lg border border-border bg-muted/40" />
        ) : (
          <DataTable
            columns={columns}
            rows={resumes}
            rowKey={(resume) => resume.id}
            viewStorageKey="resumes"
            empty="还没有简历，先创建第一份结构化简历"
            gridCard={(resume) => (
              <Card className="h-full p-5 shadow-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <FileText size={18} className="text-[#55a572]" />
                    <Link
                      href={`/app/resumes/${resume.id}`}
                      className="mt-4 block truncate text-base font-semibold"
                    >
                      {resume.name}
                    </Link>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {resume.document.data.header.name || "未填写姓名"} · v
                      {resume.version}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="克隆简历"
                      onClick={() => void mutate(resume.id, "clone")}
                      className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="删除简历"
                      onClick={() => void mutate(resume.id, "delete")}
                      className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            )}
          />
        )}
      </div>
    </>
  );
}

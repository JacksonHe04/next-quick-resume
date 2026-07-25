"use client";

import { Copy, FileText, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { IntentLink } from "@/components/app/intent-link";
import { AppTopbarPortal } from "@/components/app/app-topbar";
import { ResumeWorkspaceSwitch } from "@/components/resumes/resume-workspace-switch";
import {
  Button,
  Card,
  DataTable,
  DataViewSwitch,
  FormDrawer,
  Input,
  useDataView,
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

export function ResumeManager({
  initialResumes,
  editorHref,
}: {
  initialResumes: ResumeRecord[];
  editorHref?: string;
}) {
  const router = useRouter();
  const [resumes, setResumes] =
    useState<ResumeRecord[]>(initialResumes);
  const [newName, setNewName] = useState("我的简历");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [view, setView] = useDataView("resumes");

  const load = useCallback(async () => {
    const response = await appFetch("/api/resumes", { cache: "no-store" });
    if (!response.ok) throw new Error("简历列表加载失败");
    const payload = (await response.json()) as {
      resumes: ResumeRecord[];
    };
    setResumes(payload.resumes);
  }, []);

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
      router.push(`/app/resumes/${payload.resume.id}`);
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
          <IntentLink
            href={`/app/resumes/${resume.id}`}
            aria-label="打开简历编辑器"
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <FileText size={14} />
          </IntentLink>
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
      <AppTopbarPortal>
        <ResumeWorkspaceSwitch mode="manage" editorHref={editorHref} />
        <div className="ml-auto flex items-center gap-2">
          <DataViewSwitch view={view} onChange={setView} />
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus aria-hidden="true" />
            新建简历
          </Button>
        </div>
      </AppTopbarPortal>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className={error ? "mt-5" : undefined}>
        <DataTable
          columns={columns}
          rows={resumes}
          rowKey={(resume) => resume.id}
          viewStorageKey="resumes"
          view={view}
          hideViewSwitch
          empty="还没有简历，先创建第一份结构化简历"
          gridCard={(resume) => (
            <Card className="h-full p-5 shadow-none">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <FileText size={18} className="text-[#55a572]" />
                  <IntentLink
                    href={`/app/resumes/${resume.id}`}
                    className="mt-4 block truncate text-base font-semibold"
                  >
                    {resume.name}
                  </IntentLink>
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
      </div>

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="新建简历"
        description="创建后会直接进入简历编辑器。"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDrawerOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={() => void create()}
              loading={pending}
              disabled={!newName.trim()}
            >
              创建并编辑
            </Button>
          </div>
        }
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium">简历名称</span>
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            maxLength={120}
            autoFocus
          />
        </label>
      </FormDrawer>
    </>
  );
}

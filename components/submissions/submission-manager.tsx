"use client";

import {
  ExternalLink,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SubmissionForm } from "@/components/submissions/submission-form";
import {
  Button,
  DataTable,
  FormDrawer,
  Input,
  PresentationBadge,
  type DataTableColumn,
} from "@/components/ui";
import { displaySubmissionStatus } from "@/modules/submissions/status";
import type {
  DirectSubmissionStatus,
  InterviewStatus,
} from "@/modules/submissions/service";

type SubmissionView = {
  id: string;
  batchId: string;
  batchName: string;
  companyName: string;
  positionConcept: string;
  positionName: string;
  jdUrl: string | null;
  location: string | null;
  channel: string | null;
  appliedAt: string;
  statusSource: "direct" | "interview";
  directStatus: DirectSubmissionStatus;
  currentInterviewId: string | null;
  stageName: string | null;
  interviewStatus: InterviewStatus | null;
};

type BatchOption = {
  id: string;
  name: string;
  archivedAt: string | null;
};

export function SubmissionManager() {
  const [submissions, setSubmissions] = useState<SubmissionView[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const [submissionResponse, batchResponse] = await Promise.all([
      fetch("/api/submissions", { cache: "no-store" }),
      fetch("/api/batches", { cache: "no-store" }),
    ]);
    if (!submissionResponse.ok || !batchResponse.ok) {
      throw new Error("投递数据加载失败");
    }
    const submissionPayload = (await submissionResponse.json()) as {
      submissions: SubmissionView[];
    };
    const batchPayload = (await batchResponse.json()) as {
      batches: BatchOption[];
      currentBatchId: string | null;
    };
    setSubmissions(submissionPayload.submissions);
    setBatches(
      batchPayload.batches.filter((batch) => !batch.archivedAt),
    );
    setCurrentBatchId(batchPayload.currentBatchId);
  }, []);

  useEffect(() => {
    load()
      .catch((loadError) => setError((loadError as Error).message))
      .finally(() => setLoading(false));
  }, [load]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    if (!normalized) return submissions;
    return submissions.filter((submission) =>
      [
        submission.companyName,
        submission.positionConcept,
        submission.positionName,
        submission.batchName,
      ].some((value) =>
        value.toLocaleLowerCase("zh-CN").includes(normalized),
      ),
    );
  }, [query, submissions]);

  async function remove(id: string) {
    setError(undefined);
    const response = await fetch(`/api/submissions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      setError(payload.error?.message ?? "投递删除失败");
      return;
    }
    await load();
  }

  const columns: DataTableColumn<SubmissionView>[] = [
    {
      key: "company",
      header: "公司与岗位",
      render: (submission) => (
        <div className="min-w-52">
          <Link
            href={`/app/submissions/${submission.id}`}
            className="font-medium text-[#202620] hover:text-[#27764b]"
          >
            {submission.companyName}
          </Link>
          <p className="mt-1 text-xs text-[#687269]">
            {submission.positionName}
          </p>
          <p className="mt-1 text-[10px] text-[#98a099]">
            岗位：{submission.positionConcept}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "当前状态",
      render: (submission) => {
        const status = displaySubmissionStatus({
          statusSource: submission.statusSource,
          directStatus: submission.directStatus,
          currentInterview:
            submission.stageName && submission.interviewStatus
              ? {
                  stageName: submission.stageName,
                  status: submission.interviewStatus,
                }
              : null,
        });
        return (
          <PresentationBadge
            label={status.label}
            tone={status.tone}
          />
        );
      },
    },
    {
      key: "batch",
      header: "批次",
      render: (submission) => (
        <span className="text-[#687269]">{submission.batchName}</span>
      ),
    },
    {
      key: "date",
      header: "投递日期",
      render: (submission) => (
        <span className="font-[var(--font-data)] text-xs text-[#687269]">
          {new Intl.DateTimeFormat("zh-CN", {
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(submission.appliedAt))}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">操作</span>,
      className: "w-24 text-right",
      render: (submission) => (
        <div className="flex justify-end gap-1">
          {submission.jdUrl ? (
            <a
              href={submission.jdUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="打开职位链接"
              className="grid size-8 place-items-center rounded-lg text-[#687269] hover:bg-[#eef4ee] hover:text-[#27764b]"
            >
              <ExternalLink size={14} />
            </a>
          ) : null}
          <button
            type="button"
            aria-label="删除投递"
            onClick={() => remove(submission.id)}
            className="grid size-8 place-items-center rounded-lg text-[#879088] hover:bg-[#fbecef] hover:text-[#9d4450]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a099]"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索公司、岗位或批次"
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setDrawerOpen(true)}
          disabled={batches.length === 0}
        >
          <Plus size={16} />
          记录投递
        </Button>
      </div>
      {batches.length === 0 && !loading ? (
        <p className="mt-3 text-sm text-[#9a6a2c]">
          新建投递前，需要先在{" "}
          <Link
            href="/app/batches"
            className="font-medium text-[#27764b] underline"
          >
            批次
          </Link>{" "}
          中建立一个分组。
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-4 py-3 text-sm text-[#9d4450]"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        {loading ? (
          <div className="h-72 animate-pulse rounded-[18px] border border-[#dce5dd] bg-white/60" />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(row) => row.id}
            empty={
              query
                ? "没有符合当前搜索的投递"
                : "还没有投递记录，记录第一条已发生的投递"
            }
          />
        )}
      </div>

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="记录投递"
        description="这里只记录已经真实发生的投递。"
      >
        <SubmissionForm
          batches={batches}
          currentBatchId={currentBatchId}
          onCreated={async () => {
            setDrawerOpen(false);
            await load();
          }}
        />
      </FormDrawer>
    </>
  );
}

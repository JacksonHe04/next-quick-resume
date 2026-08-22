"use client";

import {
  ExternalLink,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  useCallback,
  useMemo,
  useState,
} from "react";

import { IntentLink } from "@/components/app/intent-link";
import {
  AppTopbarPortal,
  TopbarFilterMenu,
} from "@/components/app/app-topbar";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { CompanyResourceLink } from "@/components/catalog/company-resource-link";
import {
  Button,
  Card,
  DataTable,
  DataViewSwitch,
  FilterSelect,
  FormDrawer,
  Input,
  PresentationBadge,
  useDataView,
  type DataTableColumn,
} from "@/components/ui";
import { appFetch, patchJson } from "@/lib/app-fetch";
import {
  filterSubmissions,
  submissionStatusLabel,
} from "@/modules/submissions/filter";
import { displaySubmissionStatus } from "@/modules/submissions/status";
import type {
  DirectSubmissionStatus,
  InterviewStatus,
} from "@/modules/submissions/service";

export type SubmissionView = {
  id: string;
  batchId: string;
  batchName: string;
  companyName: string;
  companyCareersUrl: string | null;
  companyProcessUrl: string | null;
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

export type BatchOption = {
  id: string;
  name: string;
  archivedAt: string | Date | null;
};

const DIRECT_STATUS_OPTIONS: Array<{
  value: DirectSubmissionStatus;
  label: string;
}> = [
  { value: "submitted", label: "已投递" },
  { value: "screening", label: "筛选中" },
  { value: "resume_passed", label: "简历通过" },
  { value: "resume_failed", label: "简历未通过" },
  { value: "offer", label: "Offer" },
  { value: "cancelled", label: "已取消" },
  { value: "closed", label: "已结束" },
  { value: "expired", label: "已过期" },
];

export function SubmissionManager({
  initialSubmissions,
  initialBatches,
  initialCurrentBatchId,
}: {
  initialSubmissions: SubmissionView[];
  initialBatches: BatchOption[];
  initialCurrentBatchId: string | null;
}) {
  const [submissions, setSubmissions] =
    useState<SubmissionView[]>(initialSubmissions);
  const [batches, setBatches] =
    useState<BatchOption[]>(initialBatches);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(
    initialCurrentBatchId,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useQueryState("q", {
    defaultValue: "",
    history: "replace",
  });
  const [batchId, setBatchId] = useQueryState("batch", {
    defaultValue: "",
    history: "replace",
  });
  const [companyName, setCompanyName] = useQueryState("company", {
    defaultValue: "",
    history: "replace",
  });
  const [positionConcept, setPositionConcept] = useQueryState(
    "position",
    { defaultValue: "", history: "replace" },
  );
  const [status, setStatus] = useQueryState("status", {
    defaultValue: "",
    history: "replace",
  });
  const [from, setFrom] = useQueryState("from", {
    defaultValue: "",
    history: "replace",
  });
  const [to, setTo] = useQueryState("to", {
    defaultValue: "",
    history: "replace",
  });
  const [error, setError] = useState<string>();
  const [view, setView] = useDataView("submissions");

  const load = useCallback(async () => {
    const [submissionResponse, batchResponse] = await Promise.all([
      appFetch("/api/submissions", { cache: "no-store" }),
      appFetch("/api/batches", { cache: "no-store" }),
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

  const filtered = useMemo(() => {
    return filterSubmissions(submissions, {
      query,
      batchId,
      companyName,
      positionConcept,
      status,
      from,
      to,
    });
  }, [
    batchId,
    companyName,
    from,
    positionConcept,
    query,
    status,
    submissions,
    to,
  ]);

  const filterOptions = useMemo(
    () => ({
      companies: Array.from(
        new Set(submissions.map((item) => item.companyName)),
      )
        .sort((a, b) => a.localeCompare(b, "zh-CN"))
        .map((value) => ({ value, label: value })),
      positions: Array.from(
        new Set(submissions.map((item) => item.positionConcept)),
      )
        .sort((a, b) => a.localeCompare(b, "zh-CN"))
        .map((value) => ({ value, label: value })),
      statuses: Array.from(
        new Set(submissions.map(submissionStatusLabel)),
      )
        .sort((a, b) => a.localeCompare(b, "zh-CN"))
        .map((value) => ({ value, label: value })),
    }),
    [submissions],
  );

  const hasFilters = Boolean(
    query ||
      batchId ||
      companyName ||
      positionConcept ||
      status ||
      from ||
      to,
  );
  const activeFilterCount = [
    batchId,
    companyName,
    positionConcept,
    status,
    from,
    to,
  ].filter(Boolean).length;

  async function remove(id: string) {
    setError(undefined);
    const response = await appFetch(`/api/submissions/${id}`, {
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

  async function update(id: string, changes: Record<string, unknown>) {
    await patchJson(`/api/submissions/${id}`, changes);
    await load();
  }

  const columns: DataTableColumn<SubmissionView>[] = [
    {
      key: "company",
      header: "公司",
      render: (submission) => (
        <IntentLink
          href={`/submissions/${submission.id}`}
          className="font-medium"
        >
          {submission.companyName}
        </IntentLink>
      ),
    },
    {
      key: "positionConcept",
      header: "岗位",
      render: (submission) => (
        <span className="text-muted-foreground">
          {submission.positionConcept}
        </span>
      ),
    },
    {
      key: "positionName",
      header: "岗位名称",
      className: "min-w-48",
      render: (submission) => submission.positionName,
      editable: {
        label: "岗位名称",
        value: (submission) => submission.positionName,
        onSave: (submission, value) =>
          update(submission.id, { positionName: value }),
      },
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
      editable: {
        label: "当前状态",
        type: "select",
        value: (submission) => submission.directStatus,
        options: DIRECT_STATUS_OPTIONS,
        onSave: (submission, value) =>
          update(submission.id, { directStatus: value }),
      },
    },
    {
      key: "batch",
      header: "批次",
      render: (submission) => (
        <span className="text-muted-foreground">{submission.batchName}</span>
      ),
      editable: {
        label: "批次",
        type: "select",
        value: (submission) => submission.batchId,
        options: batches.map((batch) => ({
          value: batch.id,
          label: batch.name,
        })),
        onSave: (submission, value) =>
          update(submission.id, { batchId: value }),
      },
    },
    {
      key: "location",
      header: "地点",
      render: (submission) => (
        <span className="text-muted-foreground">
          {submission.location || "未填写"}
        </span>
      ),
      editable: {
        label: "地点",
        value: (submission) => submission.location,
        onSave: (submission, value) =>
          update(submission.id, { location: value || null }),
      },
    },
    {
      key: "channel",
      header: "渠道",
      render: (submission) => (
        <span className="text-muted-foreground">
          {submission.channel || "未填写"}
        </span>
      ),
      editable: {
        label: "渠道",
        value: (submission) => submission.channel,
        onSave: (submission, value) =>
          update(submission.id, { channel: value || null }),
      },
    },
    {
      key: "date",
      header: "投递日期",
      render: (submission) => (
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("zh-CN", {
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(submission.appliedAt))}
        </span>
      ),
      editable: {
        label: "投递日期",
        type: "date",
        value: (submission) => submission.appliedAt.slice(0, 10),
        onSave: (submission, value) =>
          update(submission.id, { appliedAt: value }),
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">操作</span>,
      className: "w-24 text-right",
      render: (submission) => (
        <div className="flex justify-end gap-1">
          {submission.companyProcessUrl ? (
            <CompanyResourceLink
              companyName={submission.companyName}
              href={submission.companyProcessUrl}
              resource="process"
              className="grid size-8 place-items-center gap-0 rounded-lg hover:bg-muted [&>svg]:size-3.5"
            >
              <span className="sr-only">投递进度</span>
            </CompanyResourceLink>
          ) : null}
          {submission.jdUrl ? (
            <a
              href={submission.jdUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="打开职位链接"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink size={14} />
            </a>
          ) : null}
          <button
            type="button"
            aria-label="删除投递"
            onClick={() => remove(submission.id)}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-[#fbecef] hover:text-[#9d4450]"
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
        <div className="relative w-52 sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(event) => void setQuery(event.target.value)}
            placeholder="搜索投递"
            aria-label="搜索公司、岗位或批次"
            className="pl-10"
          />
        </div>
        <TopbarFilterMenu
          activeCount={activeFilterCount}
          onClear={() => {
            void Promise.all([
              setBatchId(null),
              setCompanyName(null),
              setPositionConcept(null),
              setStatus(null),
              setFrom(null),
              setTo(null),
            ]);
          }}
        >
          <FilterSelect
            label="按批次筛选"
            value={batchId}
            onChange={(value) => void setBatchId(value)}
            allLabel="全部批次"
            options={batches.map((batch) => ({
              value: batch.id,
              label: batch.name,
            }))}
          />
          <FilterSelect
            label="按公司筛选"
            value={companyName}
            onChange={(value) => void setCompanyName(value)}
            allLabel="全部公司"
            options={filterOptions.companies}
          />
          <FilterSelect
            label="按岗位筛选"
            value={positionConcept}
            onChange={(value) => void setPositionConcept(value)}
            allLabel="全部岗位"
            options={filterOptions.positions}
          />
          <FilterSelect
            label="按状态筛选"
            value={status}
            onChange={(value) => void setStatus(value)}
            allLabel="全部状态"
            options={filterOptions.statuses}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              aria-label="投递开始日期"
              type="date"
              value={from}
              onChange={(event) => void setFrom(event.target.value)}
            />
            <Input
              aria-label="投递结束日期"
              type="date"
              value={to}
              onChange={(event) => void setTo(event.target.value)}
            />
          </div>
        </TopbarFilterMenu>
        <div className="ml-auto flex items-center gap-2">
          <DataViewSwitch view={view} onChange={setView} />
          <Button
            onClick={() => setDrawerOpen(true)}
            disabled={batches.length === 0}
          >
            <Plus aria-hidden="true" />
            记录投递
          </Button>
        </div>
      </AppTopbarPortal>

      {batches.length === 0 ? (
        <p className="text-sm text-[#9a6a2c]">
          新建投递前，需要先在{" "}
          <Link
            href="/batches"
            className="font-medium text-foreground underline"
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

      <div className={batches.length === 0 || error ? "mt-5" : undefined}>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          viewStorageKey="submissions"
          view={view}
          hideViewSwitch
          empty={
            hasFilters
              ? "没有符合当前搜索的投递"
              : "还没有投递记录，记录第一条已发生的投递"
          }
          gridCard={(submission) => {
            const presentation = displaySubmissionStatus({
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
              <Card className="h-full p-5 shadow-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <IntentLink
                      href={`/submissions/${submission.id}`}
                      className="block truncate text-base font-semibold"
                    >
                      {submission.companyName}
                    </IntentLink>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {submission.positionName}
                    </p>
                  </div>
                  <PresentationBadge
                    label={presentation.label}
                    tone={presentation.tone}
                  />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span>{submission.batchName}</span>
                  <span className="text-right">
                    {new Intl.DateTimeFormat("zh-CN").format(
                      new Date(submission.appliedAt),
                    )}
                  </span>
                </div>
              </Card>
            );
          }}
        />
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

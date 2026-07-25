"use client";

import {
  CalendarClock,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { useQueryState } from "nuqs";

import { IntentLink } from "@/components/app/intent-link";
import { InterviewForm } from "@/components/interviews/interview-form";
import {
  AppTopbarPortal,
  TopbarFilterMenu,
} from "@/components/app/app-topbar";
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
  filterInterviews,
} from "@/modules/interviews/filter";
import type { InterviewStatus } from "@/modules/submissions/service";

export type InterviewView = {
  id: string;
  submissionId: string;
  companyName: string;
  positionName: string;
  stageId: string;
  stageName: string;
  name: string;
  scheduledAt: string | null;
  durationMinutes: number | null;
  meetingUrl: string | null;
  status: InterviewStatus;
  reviewMarkdown: string | null;
};

const STATUS = {
  pending_interview: { label: "待进行", tone: "neutral" },
  pending_result: { label: "待结果", tone: "warning" },
  passed: { label: "已通过", tone: "positive" },
  failed: { label: "未通过", tone: "negative" },
} as const;

function formatSchedule(value: string | null) {
  if (!value) return "时间待定";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateTimeInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function InterviewCard({
  interview,
  onRemove,
}: {
  interview: InterviewView;
  onRemove: (id: string) => void;
}) {
  const status = STATUS[interview.status];

  return (
    <Card className="p-5 shadow-none transition hover:border-[#b7cbb9]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <IntentLink
              href={`/app/interviews/${interview.id}`}
              className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em] hover:text-foreground"
            >
              {interview.name}
            </IntentLink>
            <PresentationBadge
              label={status.label}
              tone={status.tone}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {interview.companyName} · {interview.positionName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {interview.stageName}
          </p>
        </div>
        <CalendarClock
          size={18}
          className="shrink-0 text-[#55a572]"
        />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <p className="font-[var(--font-data)] text-[10px] text-muted-foreground">
          {formatSchedule(interview.scheduledAt)}
          {interview.durationMinutes
            ? ` · ${interview.durationMinutes} 分钟`
            : ""}
        </p>
        <div className="flex gap-1">
          {interview.meetingUrl ? (
            <a
              href={interview.meetingUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="打开会议链接"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink size={14} />
            </a>
          ) : null}
          <button
            type="button"
            aria-label="删除选拔事件"
            onClick={() => onRemove(interview.id)}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-[#fbecef] hover:text-[#9d4450]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}

export type InterviewSubmissionOption = {
  id: string;
  label: string;
};

export type InterviewStageOption = {
  id: string;
  name: string;
};

export function InterviewManager({
  initialInterviews,
  initialSubmissions,
  initialStages,
}: {
  initialInterviews: InterviewView[];
  initialSubmissions: InterviewSubmissionOption[];
  initialStages: InterviewStageOption[];
}) {
  const [interviews, setInterviews] =
    useState<InterviewView[]>(initialInterviews);
  const [submissions, setSubmissions] = useState<
    InterviewSubmissionOption[]
  >(initialSubmissions);
  const [stages, setStages] = useState<
    InterviewStageOption[]
  >(initialStages);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stageId, setStageId] = useQueryState("stage", {
    defaultValue: "",
    history: "replace",
  });
  const [status, setStatus] = useQueryState("status", {
    defaultValue: "",
    history: "replace",
  });
  const [companyName, setCompanyName] = useQueryState("company", {
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
  const [view, setView] = useDataView("interviews");

  const load = useCallback(async () => {
    const [interviewResponse, submissionResponse, stageResponse] =
      await Promise.all([
        appFetch("/api/interviews", { cache: "no-store" }),
        appFetch("/api/submissions", { cache: "no-store" }),
        appFetch("/api/stages", { cache: "no-store" }),
      ]);
    if (
      !interviewResponse.ok ||
      !submissionResponse.ok ||
      !stageResponse.ok
    ) {
      throw new Error("面试数据加载失败");
    }
    const interviewPayload = (await interviewResponse.json()) as {
      interviews: InterviewView[];
    };
    const submissionPayload = (await submissionResponse.json()) as {
      submissions: Array<{
        id: string;
        companyName: string;
        positionName: string;
      }>;
    };
    const stagePayload = (await stageResponse.json()) as {
      stages: Array<{ id: string; name: string }>;
    };
    setInterviews(interviewPayload.interviews);
    setSubmissions(
      submissionPayload.submissions.map((submission) => ({
        id: submission.id,
        label: `${submission.companyName} · ${submission.positionName}`,
      })),
    );
    setStages(stagePayload.stages);
  }, []);

  const filtered = useMemo(
    () =>
      filterInterviews(interviews, {
        stageId,
        status: status as InterviewStatus | "",
        companyName,
        from,
        to,
      }),
    [companyName, from, interviews, stageId, status, to],
  );
  const companies = useMemo(
    () =>
      Array.from(
        new Set(interviews.map((interview) => interview.companyName)),
      )
        .sort((a, b) => a.localeCompare(b, "zh-CN"))
        .map((value) => ({ value, label: value })),
    [interviews],
  );
  const hasFilters = Boolean(
    stageId || status || companyName || from || to,
  );
  const activeFilterCount = [
    stageId,
    status,
    companyName,
    from,
    to,
  ].filter(Boolean).length;

  async function remove(id: string) {
    const response = await appFetch(`/api/interviews/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      setError(payload.error?.message ?? "删除失败");
      return;
    }
    await load();
  }

  async function update(id: string, changes: Record<string, unknown>) {
    await patchJson(`/api/interviews/${id}`, changes);
    await load();
  }

  const columns: DataTableColumn<InterviewView>[] = [
    {
      key: "name",
      header: "选拔名称",
      className: "min-w-48",
      render: (interview) => (
        <span className="font-medium">{interview.name}</span>
      ),
      editable: {
        label: "选拔名称",
        value: (interview) => interview.name,
        onSave: (interview, value) =>
          update(interview.id, { name: value }),
      },
    },
    {
      key: "company",
      header: "公司与岗位",
      render: (interview) => (
        <span className="text-muted-foreground">
          {interview.companyName} · {interview.positionName}
        </span>
      ),
    },
    {
      key: "stage",
      header: "阶段",
      render: (interview) => interview.stageName,
      editable: {
        label: "阶段",
        type: "select",
        value: (interview) => interview.stageId,
        options: stages.map((stage) => ({
          value: stage.id,
          label: stage.name,
        })),
        onSave: (interview, value) =>
          update(interview.id, { stageId: value }),
      },
    },
    {
      key: "status",
      header: "状态",
      render: (interview) => {
        const presentation = STATUS[interview.status];
        return (
          <PresentationBadge
            label={presentation.label}
            tone={presentation.tone}
          />
        );
      },
      editable: {
        label: "状态",
        type: "select",
        value: (interview) => interview.status,
        options: Object.entries(STATUS).map(([value, item]) => ({
          value,
          label: item.label,
        })),
        onSave: (interview, value) =>
          update(interview.id, { status: value }),
      },
    },
    {
      key: "scheduledAt",
      header: "时间",
      className: "min-w-52",
      render: (interview) => (
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          {formatSchedule(interview.scheduledAt)}
        </span>
      ),
      editable: {
        label: "面试时间",
        type: "datetime-local",
        value: (interview) => toDateTimeInput(interview.scheduledAt),
        onSave: (interview, value) =>
          update(interview.id, {
            scheduledAt: value ? new Date(value).toISOString() : null,
          }),
      },
    },
    {
      key: "duration",
      header: "时长",
      render: (interview) => (
        <span className="text-muted-foreground">
          {interview.durationMinutes
            ? `${interview.durationMinutes} 分钟`
            : "未填写"}
        </span>
      ),
      editable: {
        label: "时长（分钟）",
        type: "number",
        value: (interview) => interview.durationMinutes,
        onSave: (interview, value) =>
          update(interview.id, {
            durationMinutes: value ? Number(value) : null,
          }),
      },
    },
    {
      key: "meetingUrl",
      header: "会议链接",
      className: "min-w-44",
      render: (interview) => (
        <span className="block max-w-52 truncate text-muted-foreground">
          {interview.meetingUrl || "未填写"}
        </span>
      ),
      editable: {
        label: "会议链接",
        value: (interview) => interview.meetingUrl,
        onSave: (interview, value) =>
          update(interview.id, { meetingUrl: value || null }),
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">操作</span>,
      className: "w-24 text-right",
      render: (interview) => (
        <div className="flex justify-end gap-1">
          <IntentLink
            href={`/app/interviews/${interview.id}`}
            aria-label="打开选拔详情"
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CalendarClock size={14} />
          </IntentLink>
          {interview.meetingUrl ? (
            <a
              href={interview.meetingUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="打开会议链接"
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink size={14} />
            </a>
          ) : null}
          <button
            type="button"
            aria-label="删除选拔事件"
            onClick={() => void remove(interview.id)}
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
        <TopbarFilterMenu
          activeCount={activeFilterCount}
          onClear={() => {
            void Promise.all([
              setStageId(null),
              setStatus(null),
              setCompanyName(null),
              setFrom(null),
              setTo(null),
            ]);
          }}
        >
          <FilterSelect
            label="按选拔阶段筛选"
            value={stageId}
            onChange={(value) => void setStageId(value)}
            allLabel="全部阶段"
            options={stages.map((stage) => ({
              value: stage.id,
              label: stage.name,
            }))}
          />
          <FilterSelect
            label="按选拔状态筛选"
            value={status}
            onChange={(value) => void setStatus(value)}
            allLabel="全部状态"
            options={Object.entries(STATUS).map(
              ([value, presentation]) => ({
                value,
                label: presentation.label,
              }),
            )}
          />
          <FilterSelect
            label="按公司筛选"
            value={companyName}
            onChange={(value) => void setCompanyName(value)}
            allLabel="全部公司"
            options={companies}
          />
          <Input
            aria-label="选拔开始日期"
            type="date"
            value={from}
            onChange={(event) => void setFrom(event.target.value)}
          />
          <Input
            aria-label="选拔结束日期"
            type="date"
            value={to}
            onChange={(event) => void setTo(event.target.value)}
          />
        </TopbarFilterMenu>
        <div className="ml-auto flex items-center gap-2">
          <DataViewSwitch view={view} onChange={setView} />
          <Button
            onClick={() => setDrawerOpen(true)}
            disabled={submissions.length === 0 || stages.length === 0}
          >
            <Plus aria-hidden="true" />
            添加选拔
          </Button>
        </div>
      </AppTopbarPortal>
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-4 py-3 text-sm text-[#9d4450]"
        >
          {error}
        </p>
      ) : null}
      {submissions.length === 0 ? (
        <p className={error ? "mt-3 text-sm text-[#9a6a2c]" : "text-sm text-[#9a6a2c]"}>
          需要先{" "}
          <Link
            href="/app/submissions"
            className="font-medium text-foreground underline"
          >
            记录投递
          </Link>
          ，才能添加选拔事件。
        </p>
      ) : null}

      <div className={error || submissions.length === 0 ? "mt-5" : undefined}>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(interview) => interview.id}
          viewStorageKey="interviews"
          view={view}
          hideViewSwitch
          empty={
            hasFilters
              ? "没有符合当前筛选条件的选拔事件"
              : "还没有选拔事件"
          }
          gridCard={(interview) => (
            <InterviewCard
              interview={interview}
              onRemove={(id) => void remove(id)}
            />
          )}
        />
      </div>

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="添加选拔事件"
        description="更新状态后，对应投递会自动推进。"
      >
        <InterviewForm
          submissions={submissions}
          stages={stages}
          onCreated={async () => {
            setDrawerOpen(false);
            await load();
          }}
        />
      </FormDrawer>
    </>
  );
}

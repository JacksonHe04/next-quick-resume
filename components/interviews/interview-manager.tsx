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
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryState } from "nuqs";

import { InterviewForm } from "@/components/interviews/interview-form";
import {
  Button,
  Card,
  FilterSelect,
  FormDrawer,
  Input,
  PresentationBadge,
} from "@/components/ui";
import {
  filterInterviews,
  groupInterviews,
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
            <Link
              href={`/app/interviews/${interview.id}`}
              className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em] hover:text-[#27764b]"
            >
              {interview.name}
            </Link>
            <PresentationBadge
              label={status.label}
              tone={status.tone}
            />
          </div>
          <p className="mt-2 text-sm text-[#687269]">
            {interview.companyName} · {interview.positionName}
          </p>
          <p className="mt-1 text-xs text-[#879088]">
            {interview.stageName}
          </p>
        </div>
        <CalendarClock
          size={18}
          className="shrink-0 text-[#55a572]"
        />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#edf0ed] pt-4">
        <p className="font-[var(--font-data)] text-[10px] text-[#687269]">
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
              className="grid size-8 place-items-center rounded-lg text-[#687269] hover:bg-[#eef4ee] hover:text-[#27764b]"
            >
              <ExternalLink size={14} />
            </a>
          ) : null}
          <button
            type="button"
            aria-label="删除选拔事件"
            onClick={() => onRemove(interview.id)}
            className="grid size-8 place-items-center rounded-lg text-[#879088] hover:bg-[#fbecef] hover:text-[#9d4450]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}

export function InterviewManager() {
  const [interviews, setInterviews] = useState<InterviewView[]>([]);
  const [submissions, setSubmissions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [stages, setStages] = useState<
    Array<{ id: string; name: string }>
  >([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const [interviewResponse, submissionResponse, stageResponse] =
      await Promise.all([
        fetch("/api/interviews", { cache: "no-store" }),
        fetch("/api/submissions", { cache: "no-store" }),
        fetch("/api/stages", { cache: "no-store" }),
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

  useEffect(() => {
    load()
      .catch((loadError) => setError((loadError as Error).message))
      .finally(() => setLoading(false));
  }, [load]);

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
  const grouped = useMemo(
    () => groupInterviews(filtered),
    [filtered],
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

  async function remove(id: string) {
    const response = await fetch(`/api/interviews/${id}`, {
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

  return (
    <>
      <div className="mt-7 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
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
            className="w-auto min-w-36"
          />
          <Input
            aria-label="选拔结束日期"
            type="date"
            value={to}
            onChange={(event) => void setTo(event.target.value)}
            className="w-auto min-w-36"
          />
          {hasFilters ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void Promise.all([
                  setStageId(null),
                  setStatus(null),
                  setCompanyName(null),
                  setFrom(null),
                  setTo(null),
                ]);
              }}
            >
              清除筛选
            </Button>
          ) : null}
        </div>
        <Button
          onClick={() => setDrawerOpen(true)}
          disabled={submissions.length === 0 || stages.length === 0}
        >
          <Plus size={16} />
          添加选拔
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-4 py-3 text-sm text-[#9d4450]"
        >
          {error}
        </p>
      ) : null}
      {submissions.length === 0 && !loading ? (
        <p className="mt-3 text-sm text-[#9a6a2c]">
          需要先{" "}
          <Link
            href="/app/submissions"
            className="font-medium text-[#27764b] underline"
          >
            记录投递
          </Link>
          ，才能添加选拔事件。
        </p>
      ) : null}

      {loading ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-[18px] border border-[#dce5dd] bg-white/60"
            />
          ))}
        </div>
      ) : (
        [
          {
            key: "upcoming",
            title: "近期",
            description: "已经排期、等待进行的选拔",
            records: grouped.upcoming,
          },
          {
            key: "pending-result",
            title: "待结果",
            description: "已经结束、等待公司反馈的选拔",
            records: grouped.pendingResult,
          },
          {
            key: "history",
            title: "历史",
            description: "已经通过或未通过的选拔",
            records: grouped.history,
          },
        ].map((section) =>
          section.records.length > 0 ? (
            <section key={section.key} className="mt-7">
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-xs text-[#879088]">
                    {section.description}
                  </p>
                </div>
                <span className="font-[var(--font-data)] text-xs text-[#687269]">
                  {section.records.length}
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {section.records.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onRemove={(id) => void remove(id)}
                  />
                ))}
              </div>
            </section>
          ) : null,
        )
      )}
      {!loading && filtered.length === 0 ? (
        <Card className="mt-5 grid min-h-60 place-items-center p-8 text-center shadow-none">
          <div>
            <CalendarClock
              size={24}
              className="mx-auto text-[#55a572]"
            />
            <p className="mt-4 text-sm font-medium">还没有选拔事件</p>
            <p className="mt-1 text-xs text-[#879088]">
              {hasFilters
                ? "没有符合当前筛选条件的选拔事件。"
                : "从测评、笔试到 HR 面，都可以按实际发生顺序添加。"}
            </p>
          </div>
        </Card>
      ) : null}

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

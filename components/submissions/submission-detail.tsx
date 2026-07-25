"use client";

import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  PresentationBadge,
} from "@/components/ui";
import { appFetch } from "@/lib/app-fetch";
import {
  DIRECT_SUBMISSION_STATUS_OPTIONS,
  displaySubmissionStatus,
} from "@/modules/submissions/status";
import type {
  DirectSubmissionStatus,
  InterviewStatus,
} from "@/modules/submissions/service";

type Detail = {
  id: string;
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
  stageName: string | null;
  interviewStatus: InterviewStatus | null;
};

export function SubmissionDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail>();
  const [manualStatus, setManualStatus] =
    useState<DirectSubmissionStatus>("submitted");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  }>();
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const response = await appFetch("/api/submissions", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("投递加载失败");
    const payload = (await response.json()) as {
      submissions: Detail[];
    };
    const item = payload.submissions.find(
      (submission) => submission.id === id,
    );
    if (!item) throw new Error("投递记录不存在");
    setDetail(item);
    setManualStatus(item.directStatus);
  }, [id]);

  useEffect(() => {
    load()
      .catch((loadError) => setError((loadError as Error).message));
  }, [load]);

  async function saveManualStatus() {
    setPending(true);
    setMessage(undefined);
    try {
      const response = await appFetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ directStatus: manualStatus }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(payload.error?.message ?? "投递状态更新失败");
      }
      await load();
      setMessage({ text: "投递状态已手动更新" });
    } catch (saveError) {
      setMessage({
        text: (saveError as Error).message,
        error: true,
      });
    } finally {
      setPending(false);
    }
  }

  if (error) {
    return (
      <p className="rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-4 py-3 text-sm text-[#9d4450]">
        {error}
      </p>
    );
  }
  if (!detail) {
    return (
      <div className="h-72 animate-pulse rounded-[18px] border border-border bg-white/60" />
    );
  }

  const status = displaySubmissionStatus({
    statusSource: detail.statusSource,
    directStatus: detail.directStatus,
    currentInterview:
      detail.stageName && detail.interviewStatus
        ? {
            stageName: detail.stageName,
            status: detail.interviewStatus,
          }
        : null,
  });

  return (
    <>
      <Link
        href="/app/submissions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={15} />
        返回投递
      </Link>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{detail.companyName}</p>
          <h1 className="mt-1 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
            {detail.positionName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            岗位概念：{detail.positionConcept}
          </p>
        </div>
        <PresentationBadge label={status.label} tone={status.tone} />
      </div>
      <Card className="mt-7 grid gap-px overflow-hidden bg-[#dce5dd] p-0 shadow-none sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["所属批次", detail.batchName],
          [
            "投递日期",
            new Intl.DateTimeFormat("zh-CN", {
              dateStyle: "medium",
            }).format(new Date(detail.appliedAt)),
          ],
          ["投递渠道", detail.channel ?? "未填写"],
          ["工作地点", detail.location ?? "未填写"],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-sm font-medium">{value}</p>
          </div>
        ))}
      </Card>
      <Card className="mt-5 p-5 shadow-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="w-full sm:max-w-xs">
            <span className="mb-2 block text-xs text-muted-foreground">
              手动投递状态
            </span>
            <select
              aria-label="手动投递状态"
              value={manualStatus}
              onChange={(event) =>
                setManualStatus(
                  event.target.value as DirectSubmissionStatus,
                )
              }
              className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
            >
              {DIRECT_SUBMISSION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={saveManualStatus} loading={pending}>
            <Save size={15} />
            更新投递状态
          </Button>
        </div>
        <div className="mt-3 min-h-5">
          {message ? (
            <p
              role={message.error ? "alert" : "status"}
              className={
                message.error
                  ? "text-xs text-[#9d4450]"
                  : "text-xs text-muted-foreground"
              }
            >
              {message.text}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              手动更新会以所选状态覆盖当前由面试推进的状态。
            </p>
          )}
        </div>
      </Card>
      {detail.jdUrl ? (
        <a
          href={detail.jdUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
        >
          打开职位页面
          <ExternalLink size={14} />
        </a>
      ) : null}
      <Card className="mt-5 min-h-44 p-5 shadow-none">
        <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
          选拔进程
        </h2>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          还没有选拔事件。后续可在这里添加测评、笔试和每一轮面试。
        </p>
      </Card>
    </>
  );
}

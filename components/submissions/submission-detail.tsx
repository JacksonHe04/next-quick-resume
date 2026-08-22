"use client";

import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { useCallback, useState } from "react";

import {
  AppTopbarDivider,
  AppTopbarPortal,
} from "@/components/app/app-topbar";
import { IntentLink } from "@/components/app/intent-link";
import {
  Button,
  Card,
  PresentationBadge,
} from "@/components/ui";
import { CompanyResourceLink } from "@/components/catalog/company-resource-link";
import { appFetch } from "@/lib/app-fetch";
import {
  DIRECT_SUBMISSION_STATUS_OPTIONS,
  displaySubmissionStatus,
} from "@/modules/submissions/status";
import type {
  DirectSubmissionStatus,
  InterviewStatus,
} from "@/modules/submissions/service";

export type SubmissionDetailView = {
  id: string;
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
  stageName: string | null;
  interviewStatus: InterviewStatus | null;
};

export function SubmissionDetail({
  id,
  initialDetail,
}: {
  id: string;
  initialDetail: SubmissionDetailView;
}) {
  const [detail, setDetail] =
    useState<SubmissionDetailView>(initialDetail);
  const [manualStatus, setManualStatus] =
    useState<DirectSubmissionStatus>(initialDetail.directStatus);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  }>();

  const load = useCallback(async () => {
    const response = await appFetch("/api/submissions", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("投递加载失败");
    const payload = (await response.json()) as {
      submissions: SubmissionDetailView[];
    };
    const item = payload.submissions.find(
      (submission) => submission.id === id,
    );
    if (!item) throw new Error("投递记录不存在");
    setDetail(item);
    setManualStatus(item.directStatus);
  }, [id]);

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
      <AppTopbarPortal>
        <IntentLink
          href="/submissions"
          aria-label="返回投递"
          className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
        </IntentLink>
        <AppTopbarDivider />
        <div className="min-w-0">
          <p className="max-w-56 truncate text-sm font-medium">
            {detail.companyName} · {detail.positionName}
          </p>
          <p className="max-w-56 truncate text-[11px] text-muted-foreground">
            {detail.positionConcept}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <PresentationBadge label={status.label} tone={status.tone} />
          <select
            aria-label="手动投递状态"
            value={manualStatus}
            onChange={(event) =>
              setManualStatus(
                event.target.value as DirectSubmissionStatus,
              )
            }
            className="h-9 min-w-32 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
          >
            {DIRECT_SUBMISSION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button onClick={saveManualStatus} loading={pending}>
            <Save aria-hidden="true" />
            更新状态
          </Button>
        </div>
      </AppTopbarPortal>

      <Card className="grid gap-px overflow-hidden bg-[#dce5dd] p-0 shadow-none sm:grid-cols-2 lg:grid-cols-4">
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
      {message ? (
        <p
          role={message.error ? "alert" : "status"}
          className={
            message.error
              ? "mt-4 text-sm text-[#9d4450]"
              : "mt-4 text-sm text-muted-foreground"
          }
        >
          {message.text}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {detail.companyCareersUrl ? (
          <CompanyResourceLink
            companyName={detail.companyName}
            href={detail.companyCareersUrl}
            resource="careers"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
          >
            公司招聘网站
          </CompanyResourceLink>
        ) : null}
        {detail.companyProcessUrl ? (
          <CompanyResourceLink
            companyName={detail.companyName}
            href={detail.companyProcessUrl}
            resource="process"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
          >
            查询投递进度
          </CompanyResourceLink>
        ) : null}
        {detail.jdUrl ? (
          <a
            href={detail.jdUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
          >
            打开职位页面
            <ExternalLink size={14} />
          </a>
        ) : null}
      </div>
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

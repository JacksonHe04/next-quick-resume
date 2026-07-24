"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Card,
  PresentationBadge,
} from "@/components/ui";
import { displaySubmissionStatus } from "@/modules/submissions/status";
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
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch("/api/submissions", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("投递加载失败");
        const payload = (await response.json()) as {
          submissions: Detail[];
        };
        const item = payload.submissions.find(
          (submission) => submission.id === id,
        );
        if (!item) throw new Error("投递记录不存在");
        setDetail(item);
      })
      .catch((loadError) => setError((loadError as Error).message));
  }, [id]);

  if (error) {
    return (
      <p className="rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-4 py-3 text-sm text-[#9d4450]">
        {error}
      </p>
    );
  }
  if (!detail) {
    return (
      <div className="h-72 animate-pulse rounded-[18px] border border-[#dce5dd] bg-white/60" />
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
        className="inline-flex items-center gap-2 text-sm text-[#687269] hover:text-[#27764b]"
      >
        <ArrowLeft size={15} />
        返回投递
      </Link>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#687269]">{detail.companyName}</p>
          <h1 className="mt-1 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
            {detail.positionName}
          </h1>
          <p className="mt-2 text-sm text-[#879088]">
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
            <p className="text-xs text-[#879088]">{label}</p>
            <p className="mt-2 text-sm font-medium">{value}</p>
          </div>
        ))}
      </Card>
      {detail.jdUrl ? (
        <a
          href={detail.jdUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#27764b] hover:underline"
        >
          打开职位页面
          <ExternalLink size={14} />
        </a>
      ) : null}
      <Card className="mt-5 min-h-44 p-5 shadow-none">
        <h2 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em]">
          选拔进程
        </h2>
        <p className="mt-8 text-center text-sm text-[#879088]">
          还没有选拔事件。后续可在这里添加测评、笔试和每一轮面试。
        </p>
      </Card>
    </>
  );
}

"use client";

import {
  ArrowLeft,
  ExternalLink,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { IntentLink } from "@/components/app/intent-link";
import type { InterviewView } from "@/components/interviews/interview-manager";
import { InterviewQuestionCreator } from "@/components/questions/interview-question-creator";
import {
  Button,
  Card,
  MarkdownEditor,
} from "@/components/ui";
import { appFetch } from "@/lib/app-fetch";
import type { InterviewStatus } from "@/modules/submissions/service";

export function InterviewDetail({
  id,
  initialInterview,
}: {
  id: string;
  initialInterview: InterviewView;
}) {
  const [interview, setInterview] =
    useState<InterviewView>(initialInterview);
  const [status, setStatus] =
    useState<InterviewStatus>(initialInterview.status);
  const [review, setReview] = useState(
    initialInterview.reviewMarkdown ?? "",
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  }>();

  const load = useCallback(async () => {
    const response = await appFetch("/api/interviews", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("选拔事件加载失败");
    const payload = (await response.json()) as {
      interviews: InterviewView[];
    };
    const item = payload.interviews.find((entry) => entry.id === id);
    if (!item) throw new Error("选拔事件不存在");
    setInterview(item);
    setStatus(item.status);
    setReview(item.reviewMarkdown ?? "");
  }, [id]);

  async function save() {
    setPending(true);
    setMessage(undefined);
    try {
      const response = await appFetch(`/api/interviews/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          reviewMarkdown: review || null,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(payload.error?.message ?? "保存失败");
      }
      setMessage({ text: "面试状态与复盘已保存" });
      await load();
    } catch (error) {
      setMessage({ text: (error as Error).message, error: true });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Link
        href="/app/interviews"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={15} />
        返回面试
      </Link>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {interview.companyName} · {interview.positionName}
          </p>
          <h1 className="mt-1 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
            {interview.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            官方阶段：{interview.stageName}
          </p>
        </div>
        <IntentLink
          href={`/app/submissions/${interview.submissionId}`}
          className="text-sm font-medium text-foreground hover:underline"
        >
          查看对应投递
        </IntentLink>
      </div>

      <Card className="mt-7 p-5 shadow-none">
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-2 block text-xs text-muted-foreground">
              当前状态
            </span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as InterviewStatus)
              }
              className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
            >
              <option value="pending_interview">待进行</option>
              <option value="pending_result">待结果</option>
              <option value="passed">已通过</option>
              <option value="failed">未通过</option>
            </select>
          </label>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">时间</p>
            <p className="min-h-11 py-2.5 text-sm">
              {interview.scheduledAt
                ? new Intl.DateTimeFormat("zh-CN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(interview.scheduledAt))
                : "待定"}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">会议</p>
            {interview.meetingUrl ? (
              <a
                href={interview.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 py-2.5 text-sm font-medium text-foreground hover:underline"
              >
                打开会议链接
                <ExternalLink size={14} />
              </a>
            ) : (
              <p className="min-h-11 py-2.5 text-sm">未填写</p>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-5">
        <MarkdownEditor
          label="面试复盘"
          value={review}
          onChange={setReview}
          placeholder={"## 整体感受\n\n## 关键问题\n\n## 下次改进"}
          minHeight={360}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        {message ? (
          <p
            role={message.error ? "alert" : "status"}
            className={
              message.error
                ? "text-sm text-[#9d4450]"
                : "text-sm text-foreground"
            }
          >
            {message.text}
          </p>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <InterviewQuestionCreator interviewId={id} />
          <Button onClick={save} loading={pending}>
            <Save size={15} />
            保存状态与复盘
          </Button>
        </div>
      </div>
    </>
  );
}

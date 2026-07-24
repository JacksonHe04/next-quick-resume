"use client";

import { type FormEvent, useState } from "react";

import { Button, Input } from "@/components/ui";

export function InterviewForm({
  submissions,
  stages,
  defaultSubmissionId,
  onCreated,
}: {
  submissions: Array<{ id: string; label: string }>;
  stages: Array<{ id: string; name: string }>;
  defaultSubmissionId?: string;
  onCreated(): void | Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(event.currentTarget);
    const duration = String(data.get("durationMinutes") ?? "");
    const scheduledAt = String(data.get("scheduledAt") ?? "");
    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submissionId: String(data.get("submissionId")),
          stageId: String(data.get("stageId")),
          name: String(data.get("name")),
          scheduledAt: scheduledAt || null,
          durationMinutes: duration ? Number(duration) : null,
          meetingUrl: String(data.get("meetingUrl") ?? "") || null,
          status: String(data.get("status")),
          reviewMarkdown:
            String(data.get("reviewMarkdown") ?? "") || null,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(payload.error?.message ?? "选拔事件保存失败");
      }
      await onCreated();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form id="interview-form" onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">对应投递</span>
        <select
          name="submissionId"
          defaultValue={defaultSubmissionId ?? submissions[0]?.id ?? ""}
          required
          className="min-h-11 w-full rounded-xl border border-[#dce5dd] bg-white px-3.5 text-sm outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
        >
          {submissions.map((submission) => (
            <option key={submission.id} value={submission.id}>
              {submission.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium">选拔阶段</span>
          <select
            name="stageId"
            required
            className="min-h-11 w-full rounded-xl border border-[#dce5dd] bg-white px-3.5 text-sm outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium">状态</span>
          <select
            aria-label="状态"
            name="status"
            defaultValue="pending_interview"
            className="min-h-11 w-full rounded-xl border border-[#dce5dd] bg-white px-3.5 text-sm outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
          >
            <option value="pending_interview">待进行</option>
            <option value="pending_result">待结果</option>
            <option value="passed">已通过</option>
            <option value="failed">未通过</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">选拔名称</span>
        <Input name="name" placeholder="例如：产品一面" required />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium">时间</span>
          <Input name="scheduledAt" type="datetime-local" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium">时长（分钟）</span>
          <Input
            name="durationMinutes"
            type="number"
            min={1}
            max={1440}
            placeholder="60"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">会议链接</span>
        <Input name="meetingUrl" type="url" placeholder="https://" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">初始复盘</span>
        <textarea
          name="reviewMarkdown"
          rows={6}
          className="w-full rounded-xl border border-[#dce5dd] bg-white px-3.5 py-3 font-[var(--font-data)] text-xs leading-6 outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
          placeholder="可以在面试后继续补充 Markdown 复盘"
        />
      </label>
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-3 py-2.5 text-sm text-[#9d4450]"
        >
          {error}
        </p>
      ) : null}
      <Button type="submit" block loading={pending}>
        保存选拔事件
      </Button>
    </form>
  );
}

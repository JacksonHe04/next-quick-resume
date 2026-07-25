"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  EntityPicker,
  type EntityPickerOption,
} from "@/components/app/entity-picker";
import { Button, Input } from "@/components/ui";
import { appFetch } from "@/lib/app-fetch";

type BatchOption = { id: string; name: string };

export function SubmissionForm({
  batches,
  currentBatchId,
  onCreated,
}: {
  batches: BatchOption[];
  currentBatchId: string | null;
  onCreated(): void | Promise<void>;
}) {
  const [company, setCompany] = useState<EntityPickerOption | null>(
    null,
  );
  const [position, setPosition] =
    useState<EntityPickerOption | null>(null);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const positionName = String(values.get("positionName") ?? "").trim();
    const batchId = String(values.get("batchId") ?? "");
    const nextErrors: Record<string, string> = {};
    if (!company) nextErrors.company = "请选择公司";
    if (!position) nextErrors.position = "请选择岗位";
    if (!positionName) nextErrors.positionName = "请输入岗位名称";
    if (!batchId) nextErrors.batchId = "请选择批次";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    setRequestError(undefined);
    try {
      const response = await appFetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientMutationId: crypto.randomUUID(),
          batchId,
          company,
          position,
          positionName,
          appliedAt: String(values.get("appliedAt")),
          channel: String(values.get("channel") ?? "") || undefined,
          location: String(values.get("location") ?? "") || undefined,
          jdUrl: String(values.get("jdUrl") ?? "") || undefined,
          notesMarkdown:
            String(values.get("notesMarkdown") ?? "") || undefined,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(payload.error?.message ?? "投递保存失败");
      }
      await onCreated();
    } catch (error) {
      setRequestError((error as Error).message);
    } finally {
      setPending(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form id="submission-form" onSubmit={submit} className="space-y-5">
      <EntityPicker
        entity="company"
        label="公司"
        placeholder="搜索公司，找不到可自定义"
        value={company}
        onChange={setCompany}
        error={errors.company}
      />
      <EntityPicker
        entity="position"
        label="岗位"
        placeholder="搜索岗位概念，例如产品经理"
        value={position}
        onChange={setPosition}
        error={errors.position}
      />
      <label className="block">
        <span className="mb-2 block text-sm font-medium">岗位名称</span>
        <Input
          name="positionName"
          placeholder="招聘页面上的实际岗位名称"
          error={Boolean(errors.positionName)}
        />
        {errors.positionName ? (
          <p className="mt-1.5 text-xs text-[#9d4450]">
            {errors.positionName}
          </p>
        ) : null}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium">批次</span>
          <select
            name="batchId"
            defaultValue={currentBatchId ?? ""}
            className="min-h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
          >
            <option value="">选择批次</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
          {errors.batchId ? (
            <p className="mt-1.5 text-xs text-[#9d4450]">
              {errors.batchId}
            </p>
          ) : null}
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium">投递日期</span>
          <Input name="appliedAt" type="date" defaultValue={today} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium">投递渠道</span>
          <Input name="channel" placeholder="官网、内推、招聘平台" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium">地点</span>
          <Input name="location" placeholder="上海 / 远程" />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">职位链接</span>
        <Input name="jdUrl" type="url" placeholder="https://" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">备注</span>
        <textarea
          name="notesMarkdown"
          rows={5}
          className="w-full rounded-xl border border-border bg-white px-3.5 py-3 text-sm outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
          placeholder="记录 JD 重点、联系人或后续事项"
        />
      </label>
      {requestError ? (
        <p
          role="alert"
          className="rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-3 py-2.5 text-sm text-[#9d4450]"
        >
          {requestError}
        </p>
      ) : null}
      <Button type="submit" block loading={pending}>
        保存投递
      </Button>
    </form>
  );
}

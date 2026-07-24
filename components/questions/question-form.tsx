"use client";

import { type FormEvent, useState } from "react";

import { Button, Input, MarkdownEditor } from "@/components/ui";

export function QuestionForm({
  interviewId,
  onCreated,
}: {
  interviewId?: string;
  onCreated(questionId: string): void | Promise<void>;
}) {
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionText: String(data.get("questionText")),
          category: String(data.get("category") ?? "") || null,
          answerMarkdown: answer,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        question?: { id: string };
        error?: { message?: string };
      };
      if (!response.ok || !payload.question) {
        throw new Error(payload.error?.message ?? "问题保存失败");
      }

      if (interviewId) {
        const linkResponse = await fetch(
          `/api/questions/${payload.question.id}/links`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ interviewId }),
          },
        );
        if (!linkResponse.ok) {
          throw new Error("问题已创建，但关联当前面试失败");
        }
      }

      await onCreated(payload.question.id);
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">问题</span>
        <Input
          name="questionText"
          required
          maxLength={2_000}
          placeholder="例如：为什么选择产品经理？"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          分类（可选）
        </span>
        <Input name="category" maxLength={80} placeholder="动机 / 项目 / 行为" />
      </label>
      <MarkdownEditor
        label="标准答案"
        value={answer}
        onChange={setAnswer}
        placeholder="这是一份持续迭代的标准答案，支持 Markdown。"
        minHeight={240}
      />
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-[#ebc3c8] bg-[#fbecef] px-3 py-2.5 text-sm text-[#9d4450]"
        >
          {error}
        </p>
      ) : null}
      <Button type="submit" block loading={pending}>
        {interviewId ? "创建并关联当前面试" : "保存问题"}
      </Button>
    </form>
  );
}

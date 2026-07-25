"use client";

import { ArrowLeft, Link2, Save, Unlink } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { InterviewView } from "@/components/interviews/interview-manager";
import { Button, Card, Input, MarkdownEditor } from "@/components/ui";
import { appFetch } from "@/lib/app-fetch";

type Question = {
  id: string;
  questionText: string;
  answerMarkdown: string;
  category: string | null;
};

type QuestionInterview = {
  id: string;
  name: string;
  stageName: string;
  positionName: string;
  status: string;
  scheduledAt: string | null;
};

export function QuestionDetail({ id }: { id: string }) {
  const [question, setQuestion] = useState<Question>();
  const [questionText, setQuestionText] = useState("");
  const [category, setCategory] = useState("");
  const [answer, setAnswer] = useState("");
  const [links, setLinks] = useState<QuestionInterview[]>([]);
  const [interviews, setInterviews] = useState<InterviewView[]>([]);
  const [selectedInterview, setSelectedInterview] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  }>();

  const load = useCallback(async () => {
    const [questionResponse, interviewResponse] = await Promise.all([
      appFetch(`/api/questions/${id}`, { cache: "no-store" }),
      appFetch("/api/interviews", { cache: "no-store" }),
    ]);
    if (!questionResponse.ok) throw new Error("问题不存在");
    if (!interviewResponse.ok) throw new Error("选拔事件加载失败");
    const questionPayload = (await questionResponse.json()) as {
      question: Question;
      interviews: QuestionInterview[];
    };
    const interviewPayload = (await interviewResponse.json()) as {
      interviews: InterviewView[];
    };
    setQuestion(questionPayload.question);
    setQuestionText(questionPayload.question.questionText);
    setCategory(questionPayload.question.category ?? "");
    setAnswer(questionPayload.question.answerMarkdown);
    setLinks(questionPayload.interviews);
    setInterviews(interviewPayload.interviews);
  }, [id]);

  useEffect(() => {
    load().catch((error) =>
      setMessage({ text: (error as Error).message, error: true }),
    );
  }, [load]);

  const availableInterviews = useMemo(() => {
    const linked = new Set(links.map((item) => item.id));
    return interviews.filter((item) => !linked.has(item.id));
  }, [interviews, links]);

  useEffect(() => {
    if (
      availableInterviews.length > 0 &&
      !availableInterviews.some((item) => item.id === selectedInterview)
    ) {
      setSelectedInterview(availableInterviews[0].id);
    }
  }, [availableInterviews, selectedInterview]);

  async function save() {
    setPending(true);
    setMessage(undefined);
    try {
      const response = await appFetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionText,
          category: category || null,
          answerMarkdown: answer,
        }),
      });
      if (!response.ok) throw new Error("保存失败");
      setMessage({ text: "标准答案已保存" });
      await load();
    } catch (error) {
      setMessage({ text: (error as Error).message, error: true });
    } finally {
      setPending(false);
    }
  }

  async function changeLink(interviewId: string, method: "POST" | "DELETE") {
    const response = await appFetch(`/api/questions/${id}/links`, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ interviewId }),
    });
    if (!response.ok) {
      setMessage({ text: "关联更新失败", error: true });
      return;
    }
    setMessage({ text: method === "POST" ? "已关联选拔" : "已取消关联" });
    await load();
  }

  if (!question) {
    return (
      <div className="h-72 animate-pulse rounded-[18px] border border-border bg-white/60" />
    );
  }

  return (
    <>
      <Link
        href="/app/questions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={15} />
        返回题库
      </Link>
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">持续迭代标准答案</p>
        <h1 className="mt-1 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
          {question.questionText}
        </h1>
      </div>

      <Card className="mt-7 grid gap-4 p-5 shadow-none sm:grid-cols-[1fr_220px]">
        <label>
          <span className="mb-2 block text-xs text-muted-foreground">问题</span>
          <Input
            value={questionText}
            onChange={(event) => setQuestionText(event.target.value)}
          />
        </label>
        <label>
          <span className="mb-2 block text-xs text-muted-foreground">分类</span>
          <Input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="可选"
          />
        </label>
      </Card>

      <div className="mt-5">
        <MarkdownEditor
          label="标准答案"
          value={answer}
          onChange={setAnswer}
          placeholder="用 Markdown 维护你的标准答案"
          minHeight={420}
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
        <Button onClick={save} loading={pending}>
          <Save size={15} />
          保存答案
        </Button>
      </div>

      <Card className="mt-8 p-5 shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[var(--font-display)] text-lg font-semibold">
              关联选拔
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              同一个问题可以出现在多场测评或面试中。
            </p>
          </div>
          {availableInterviews.length > 0 ? (
            <div className="flex gap-2">
              <select
                aria-label="选择选拔事件"
                value={selectedInterview}
                onChange={(event) => setSelectedInterview(event.target.value)}
                className="min-h-10 max-w-72 rounded-xl border border-border bg-white px-3 text-sm outline-none"
              >
                {availableInterviews.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.companyName} · {item.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                onClick={() => changeLink(selectedInterview, "POST")}
              >
                <Link2 size={14} />
                关联
              </Button>
            </div>
          ) : null}
        </div>
        <div className="mt-5 divide-y divide-[#edf0ed]">
          {links.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <Link
                  href={`/app/interviews/${item.id}`}
                  className="text-sm font-medium hover:text-foreground"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.positionName} · {item.stageName}
                </p>
              </div>
              <button
                type="button"
                aria-label="取消关联"
                onClick={() => changeLink(item.id, "DELETE")}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-[#fbecef] hover:text-[#9d4450]"
              >
                <Unlink size={14} />
              </button>
            </div>
          ))}
          {links.length === 0 ? (
            <p className="py-5 text-sm text-muted-foreground">
              暂未关联任何选拔事件。
            </p>
          ) : null}
        </div>
      </Card>
    </>
  );
}

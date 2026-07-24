"use client";

import { BookOpenText, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { QuestionForm } from "@/components/questions/question-form";
import { Button, Card, FormDrawer, Input } from "@/components/ui";

type QuestionView = {
  id: string;
  questionText: string;
  answerMarkdown: string;
  category: string | null;
  updatedAt: string;
  interviewCount: number;
};

export function QuestionManager() {
  const [questions, setQuestions] = useState<QuestionView[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    const response = await fetch("/api/questions", { cache: "no-store" });
    if (!response.ok) throw new Error("题库加载失败");
    const payload = (await response.json()) as {
      questions: QuestionView[];
    };
    setQuestions(payload.questions);
  }, []);

  useEffect(() => {
    load()
      .catch((loadError) => setError((loadError as Error).message))
      .finally(() => setLoading(false));
  }, [load]);

  const categories = useMemo(
    () => [
      "全部",
      ...Array.from(
        new Set(
          questions
            .map((question) => question.category)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    ],
    [questions],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return questions.filter(
      (question) =>
        (category === "全部" || question.category === category) &&
        (!normalized ||
          question.questionText.toLowerCase().includes(normalized) ||
          question.answerMarkdown.toLowerCase().includes(normalized)),
    );
  }, [category, query, questions]);

  async function remove(id: string) {
    const response = await fetch(`/api/questions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("删除失败");
      return;
    }
    await load();
  }

  return (
    <>
      <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="relative max-w-md flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-3.5 text-[#879088]"
            />
            <Input
              aria-label="搜索题库"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索问题或答案"
              className="pl-10"
            />
          </label>
          <select
            aria-label="按分类筛选"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-11 rounded-xl border border-[#dce5dd] bg-white px-3.5 text-sm outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus size={16} />
          新建问题
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

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {loading
          ? [0, 1].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-[18px] border border-[#dce5dd] bg-white/60"
              />
            ))
          : filtered.map((question) => (
              <Card key={question.id} className="p-5 shadow-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {question.category ? (
                        <span className="rounded-full bg-[#eef4ee] px-2.5 py-1 text-[11px] font-medium text-[#27764b]">
                          {question.category}
                        </span>
                      ) : null}
                      <span className="text-[11px] text-[#879088]">
                        关联 {question.interviewCount} 场选拔
                      </span>
                    </div>
                    <Link
                      href={`/app/questions/${question.id}`}
                      className="mt-3 block font-[var(--font-display)] text-lg font-semibold tracking-[-0.03em] hover:text-[#27764b]"
                    >
                      {question.questionText}
                    </Link>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#687269]">
                      {question.answerMarkdown || "还没有标准答案"}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="删除问题"
                    onClick={() => remove(question.id)}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-[#879088] hover:bg-[#fbecef] hover:text-[#9d4450]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
      </div>

      {!loading && filtered.length === 0 ? (
        <Card className="mt-5 grid min-h-60 place-items-center p-8 text-center shadow-none">
          <div>
            <BookOpenText
              size={24}
              className="mx-auto text-[#55a572]"
            />
            <p className="mt-4 text-sm font-medium">
              {questions.length === 0 ? "还没有问题" : "没有匹配的问题"}
            </p>
            <p className="mt-1 text-xs text-[#879088]">
              提前准备高频问题，也可以从具体面试中沉淀。
            </p>
          </div>
        </Card>
      ) : null}

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="新建问题"
        description="每个问题始终维护一份持续迭代的标准答案。"
      >
        <QuestionForm
          onCreated={async () => {
            setDrawerOpen(false);
            await load();
          }}
        />
      </FormDrawer>
    </>
  );
}

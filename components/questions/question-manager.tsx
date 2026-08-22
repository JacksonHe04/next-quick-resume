"use client";

import { BookOpenText, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { IntentLink } from "@/components/app/intent-link";
import { AppTopbarPortal } from "@/components/app/app-topbar";
import { QuestionForm } from "@/components/questions/question-form";
import {
  Button,
  Card,
  DataTable,
  DataViewSwitch,
  FormDrawer,
  Input,
  useDataView,
  type DataTableColumn,
} from "@/components/ui";
import { appFetch, patchJson } from "@/lib/app-fetch";

export type QuestionView = {
  id: string;
  questionText: string;
  answerMarkdown: string;
  category: string | null;
  updatedAt: string | Date;
  interviewCount: number;
};

export function QuestionManager({
  initialQuestions,
}: {
  initialQuestions: QuestionView[];
}) {
  const [questions, setQuestions] =
    useState<QuestionView[]>(initialQuestions);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [view, setView] = useDataView("questions");

  const load = useCallback(async () => {
    const response = await appFetch("/api/questions", { cache: "no-store" });
    if (!response.ok) throw new Error("题库加载失败");
    const payload = (await response.json()) as {
      questions: QuestionView[];
    };
    setQuestions(payload.questions);
  }, []);

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

  async function update(id: string, changes: Record<string, unknown>) {
    await patchJson(`/api/questions/${id}`, changes);
    await load();
  }

  async function remove(id: string) {
    const response = await appFetch(`/api/questions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("删除失败");
      return;
    }
    await load();
  }

  const columns: DataTableColumn<QuestionView>[] = [
    {
      key: "question",
      header: "问题",
      className: "min-w-72 whitespace-normal",
      render: (question) => (
        <span className="font-medium">{question.questionText}</span>
      ),
      editable: {
        label: "问题",
        value: (question) => question.questionText,
        onSave: (question, value) =>
          update(question.id, { questionText: value }),
      },
    },
    {
      key: "category",
      header: "分类",
      className: "min-w-36",
      render: (question) => (
        <span className="text-muted-foreground">
          {question.category || "未分类"}
        </span>
      ),
      editable: {
        label: "分类",
        value: (question) => question.category,
        onSave: (question, value) =>
          update(question.id, { category: value || null }),
      },
    },
    {
      key: "answer",
      header: "标准答案",
      className: "min-w-96 whitespace-normal",
      render: (question) => (
        <span className="line-clamp-2 max-w-xl text-sm leading-5 text-muted-foreground">
          {question.answerMarkdown || "还没有标准答案"}
        </span>
      ),
      editable: {
        label: "标准答案",
        type: "textarea",
        value: (question) => question.answerMarkdown,
        onSave: (question, value) =>
          update(question.id, { answerMarkdown: value }),
      },
    },
    {
      key: "links",
      header: "关联面试",
      render: (question) => (
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          {question.interviewCount}
        </span>
      ),
    },
    {
      key: "updated",
      header: "更新时间",
      render: (question) => (
        <span className="font-[var(--font-data)] text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("zh-CN").format(
            new Date(question.updatedAt),
          )}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">操作</span>,
      className: "w-24 text-right",
      render: (question) => (
        <div className="flex justify-end gap-1">
          <IntentLink
            href={`/questions/${question.id}`}
            aria-label="打开问题详情"
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <BookOpenText size={14} />
          </IntentLink>
          <button
            type="button"
            aria-label="删除问题"
            onClick={() => void remove(question.id)}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AppTopbarPortal>
        <label className="relative w-52 sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
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
          className="h-9 min-w-32 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <DataViewSwitch view={view} onChange={setView} />
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus aria-hidden="true" />
            新建问题
          </Button>
        </div>
      </AppTopbarPortal>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className={error ? "mt-5" : undefined}>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(question) => question.id}
          viewStorageKey="questions"
          view={view}
          hideViewSwitch
          empty={
            questions.length === 0
              ? "还没有问题"
              : "没有匹配的问题"
          }
          gridCard={(question) => (
            <Card className="h-full p-5 shadow-none">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground">
                    {question.category || "未分类"} · 关联{" "}
                    {question.interviewCount} 场
                  </span>
                  <IntentLink
                    href={`/questions/${question.id}`}
                    className="mt-3 block line-clamp-2 text-base font-semibold"
                  >
                    {question.questionText}
                  </IntentLink>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {question.answerMarkdown || "还没有标准答案"}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="删除问题"
                  onClick={() => void remove(question.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          )}
        />
      </div>

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

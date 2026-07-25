import { QuestionManager } from "@/components/questions/question-manager";

export default function QuestionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        题库
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        沉淀问题，并为每个问题维护一份持续迭代的标准答案。
      </p>
      <QuestionManager />
    </div>
  );
}

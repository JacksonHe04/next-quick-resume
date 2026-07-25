import { QuestionManager } from "@/components/questions/question-manager";
import { getAppReadContext } from "@/modules/app/read-context";
import { listQuestionViews } from "@/modules/questions/repository";

export default async function QuestionsPage() {
  const { database, userId } = await getAppReadContext();
  const questions = await listQuestionViews(database, userId);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        题库
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        沉淀问题，并为每个问题维护一份持续迭代的标准答案。
      </p>
      <QuestionManager initialQuestions={questions} />
    </div>
  );
}

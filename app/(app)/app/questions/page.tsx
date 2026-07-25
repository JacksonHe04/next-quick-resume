import { QuestionManager } from "@/components/questions/question-manager";
import { getAppReadContext } from "@/modules/app/read-context";
import { listQuestionViews } from "@/modules/questions/repository";

export default async function QuestionsPage() {
  const { database, userId } = await getAppReadContext();
  const questions = await listQuestionViews(database, userId);

  return (
    <div className="mx-auto max-w-7xl px-5 py-7 lg:py-9">
      <QuestionManager initialQuestions={questions} />
    </div>
  );
}

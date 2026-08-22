import { notFound } from "next/navigation";

import { QuestionDetail } from "@/components/questions/question-detail";
import { getAppReadContext } from "@/modules/app/read-context";
import { listInterviewViews } from "@/modules/interviews/repository";
import {
  createQuestionRepository,
  listQuestionInterviewLinks,
} from "@/modules/questions/repository";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { database, userId } = await getAppReadContext();
  const questionRepository = createQuestionRepository(database);
  const [question, links, interviews] = await Promise.all([
    questionRepository.findQuestion(userId, id),
    listQuestionInterviewLinks(database, userId, id),
    listInterviewViews(database, userId),
  ]);
  if (!question) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 lg:py-9">
      <QuestionDetail
        id={id}
        initialQuestion={question}
        initialLinks={links}
        initialInterviews={interviews}
      />
    </div>
  );
}

import { QuestionDetail } from "@/components/questions/question-detail";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <QuestionDetail id={(await params).id} />
    </div>
  );
}

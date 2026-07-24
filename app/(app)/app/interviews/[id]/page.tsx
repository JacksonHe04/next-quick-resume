import { InterviewDetail } from "@/components/interviews/interview-detail";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <InterviewDetail id={(await params).id} />
    </div>
  );
}

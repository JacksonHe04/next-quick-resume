import { SubmissionDetail } from "@/components/submissions/submission-detail";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SubmissionDetail id={(await params).id} />
    </div>
  );
}

import { notFound } from "next/navigation";

import { SubmissionDetail } from "@/components/submissions/submission-detail";
import { getAppReadContext } from "@/modules/app/read-context";
import { findSubmissionView } from "@/modules/submissions/repository";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { database, userId } = await getAppReadContext();
  const submission = await findSubmissionView(database, userId, id);
  if (!submission) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SubmissionDetail id={id} initialDetail={submission} />
    </div>
  );
}

import { notFound } from "next/navigation";

import { InterviewDetail } from "@/components/interviews/interview-detail";
import { getAppReadContext } from "@/modules/app/read-context";
import { findInterviewView } from "@/modules/interviews/repository";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { database, userId } = await getAppReadContext();
  const interview = await findInterviewView(database, userId, id);
  if (!interview) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <InterviewDetail id={id} initialInterview={interview} />
    </div>
  );
}

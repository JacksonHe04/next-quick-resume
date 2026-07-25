import { InterviewManager } from "@/components/interviews/interview-manager";
import { getAppReadContext } from "@/modules/app/read-context";
import {
  listActiveStages,
  listInterviewViews,
} from "@/modules/interviews/repository";
import { listSubmissionViews } from "@/modules/submissions/repository";

export default async function InterviewsPage() {
  const { database, userId } = await getAppReadContext();
  const [interviews, submissions, stages] = await Promise.all([
    listInterviewViews(database, userId),
    listSubmissionViews(database, userId),
    listActiveStages(database),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em]">
        面试
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        管理测评、笔试和每一轮面试安排。
      </p>
      <InterviewManager
        initialInterviews={interviews}
        initialSubmissions={submissions.map((submission) => ({
          id: submission.id,
          label: `${submission.companyName} · ${submission.positionName}`,
        }))}
        initialStages={stages}
      />
    </div>
  );
}

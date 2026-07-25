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
    <div className="mx-auto max-w-7xl px-5 py-7 lg:py-9">
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

import type {
  DirectSubmissionStatus,
  InterviewStatus,
} from "@/modules/submissions/service";

export type DashboardSubmission = {
  id: string;
  batchId: string;
  directStatus: DirectSubmissionStatus;
  statusSource: "direct" | "interview";
  currentInterviewStatus: InterviewStatus | null;
  hasInterview: boolean;
};

export type DashboardInterview = {
  id: string;
  companyName: string;
  positionName: string;
  name: string;
  stageName: string;
  status: InterviewStatus;
  scheduledAt: Date | null;
};

export interface DashboardRepository {
  getCurrentBatchName(userId: string): Promise<string | null>;
  getBatchCounts(
    userId: string,
  ): Promise<{ active: number; archived: number }>;
  listSubmissions(userId: string): Promise<DashboardSubmission[]>;
  listInterviews(userId: string): Promise<DashboardInterview[]>;
}

const TERMINAL_DIRECT_STATUSES = new Set<DirectSubmissionStatus>([
  "resume_failed",
  "offer",
  "cancelled",
  "closed",
  "expired",
]);

function percent(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

export async function getDashboard(
  repository: DashboardRepository,
  userId: string,
  filters: { batchId?: string },
  now = new Date(),
) {
  const [
    currentBatchName,
    batchCounts,
    allSubmissions,
    interviews,
  ] =
    await Promise.all([
      repository.getCurrentBatchName(userId),
      repository.getBatchCounts(userId),
      repository.listSubmissions(userId),
      repository.listInterviews(userId),
    ]);
  const submissions = filters.batchId
    ? allSubmissions.filter(
        (submission) => submission.batchId === filters.batchId,
      )
    : allSubmissions;
  const totalSubmissions = submissions.length;
  const activeSubmissions = submissions.filter((submission) => {
    if (submission.statusSource === "interview") {
      return (
        submission.currentInterviewStatus === "pending_interview" ||
        submission.currentInterviewStatus === "pending_result" ||
        submission.currentInterviewStatus === "passed"
      );
    }
    return !TERMINAL_DIRECT_STATUSES.has(submission.directStatus);
  }).length;
  const successfulSubmissions = submissions.filter(
    (submission) =>
      submission.directStatus === "offer" ||
      (submission.statusSource === "interview" &&
        submission.currentInterviewStatus === "passed"),
  ).length;
  const futureLimit = new Date(now.getTime() + 7 * 24 * 3_600_000);
  const futureInterviews = interviews
    .filter(
      (interview) =>
        interview.status === "pending_interview" &&
        interview.scheduledAt &&
        interview.scheduledAt >= now,
    )
    .sort(
      (a, b) =>
        a.scheduledAt!.getTime() - b.scheduledAt!.getTime(),
    );
  const upcomingInterviews = futureInterviews.slice(0, 3);
  const interviewsNextSevenDays = futureInterviews.filter(
    (interview) => interview.scheduledAt! <= futureLimit,
  ).length;
  const resumePassed = submissions.filter(
    (submission) =>
      submission.directStatus === "resume_passed" ||
      submission.directStatus === "offer" ||
      submission.hasInterview,
  ).length;
  const enteredInterview = submissions.filter(
    (submission) => submission.hasInterview,
  ).length;
  const finalPassed = submissions.filter(
    (submission) => submission.directStatus === "offer",
  ).length;

  const stageDistribution = Object.entries(
    interviews.reduce<Record<string, number>>((counts, interview) => {
      counts[interview.stageName] =
        (counts[interview.stageName] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return {
    currentBatchName,
    batchCounts,
    totalSubmissions,
    activeSubmissions,
    successfulSubmissions,
    interviewsNextSevenDays,
    upcomingInterviews,
    stageDistribution,
    conversion: {
      submitted: totalSubmissions,
      resumePassed,
      enteredInterview,
      finalPassed,
      rates: {
        submitted: percent(totalSubmissions, totalSubmissions),
        resumePassed: percent(resumePassed, totalSubmissions),
        enteredInterview: percent(enteredInterview, totalSubmissions),
        finalPassed: percent(finalPassed, totalSubmissions),
      },
    },
  };
}

export type DashboardViewModel = Awaited<
  ReturnType<typeof getDashboard>
>;

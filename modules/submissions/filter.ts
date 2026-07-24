import { isWithinDateRange } from "@/modules/filters/date-range";
import type {
  DirectSubmissionStatus,
  InterviewStatus,
} from "@/modules/submissions/service";
import { displaySubmissionStatus } from "@/modules/submissions/status";

export type FilterableSubmission = {
  id: string;
  batchId: string;
  batchName: string;
  companyName: string;
  positionConcept: string;
  positionName: string;
  appliedAt: string;
  statusSource: "direct" | "interview";
  directStatus: DirectSubmissionStatus;
  stageName: string | null;
  interviewStatus: InterviewStatus | null;
};

export type SubmissionFilters = {
  query?: string;
  batchId?: string;
  companyName?: string;
  positionConcept?: string;
  status?: string;
  from?: string;
  to?: string;
};

export function submissionStatusLabel(
  submission: FilterableSubmission,
) {
  return displaySubmissionStatus({
    statusSource: submission.statusSource,
    directStatus: submission.directStatus,
    currentInterview:
      submission.stageName && submission.interviewStatus
        ? {
            stageName: submission.stageName,
            status: submission.interviewStatus,
          }
        : null,
  }).label;
}

export function filterSubmissions<T extends FilterableSubmission>(
  submissions: T[],
  filters: SubmissionFilters,
) {
  const query = filters.query?.trim().toLocaleLowerCase("zh-CN");

  return submissions.filter((submission) => {
    const matchesQuery =
      !query ||
      [
        submission.companyName,
        submission.positionConcept,
        submission.positionName,
        submission.batchName,
      ].some((value) =>
        value.toLocaleLowerCase("zh-CN").includes(query),
      );

    return (
      matchesQuery &&
      (!filters.batchId ||
        submission.batchId === filters.batchId) &&
      (!filters.companyName ||
        submission.companyName === filters.companyName) &&
      (!filters.positionConcept ||
        submission.positionConcept === filters.positionConcept) &&
      (!filters.status ||
        submissionStatusLabel(submission) === filters.status) &&
      isWithinDateRange(submission.appliedAt, filters)
    );
  });
}

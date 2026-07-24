import { isWithinDateRange } from "@/modules/filters/date-range";
import type { InterviewStatus } from "@/modules/submissions/service";

export type FilterableInterview = {
  id: string;
  companyName: string;
  stageId: string;
  status: InterviewStatus;
  scheduledAt: string | null;
};

export type InterviewFilters = {
  stageId?: string;
  status?: InterviewStatus | "";
  companyName?: string;
  from?: string;
  to?: string;
};

export function filterInterviews<T extends FilterableInterview>(
  interviews: T[],
  filters: InterviewFilters,
) {
  return interviews.filter(
    (interview) =>
      (!filters.stageId ||
        interview.stageId === filters.stageId) &&
      (!filters.status || interview.status === filters.status) &&
      (!filters.companyName ||
        interview.companyName === filters.companyName) &&
      isWithinDateRange(interview.scheduledAt, filters),
  );
}

export function groupInterviews<T extends FilterableInterview>(
  interviews: T[],
) {
  return {
    upcoming: interviews.filter(
      (interview) => interview.status === "pending_interview",
    ),
    pendingResult: interviews.filter(
      (interview) => interview.status === "pending_result",
    ),
    history: interviews.filter((interview) =>
      ["passed", "failed"].includes(interview.status),
    ),
  };
}

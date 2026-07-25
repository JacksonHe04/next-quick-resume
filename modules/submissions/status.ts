import type { StatusTone } from "@/components/ui/status-badge";
import type {
  DirectSubmissionStatus,
  InterviewStatus,
} from "@/modules/submissions/service";

export const DIRECT_SUBMISSION_STATUS_OPTIONS = [
  { value: "submitted", label: "已投递", tone: "neutral" },
  { value: "screening", label: "筛选中", tone: "info" },
  { value: "resume_passed", label: "简历通过", tone: "positive" },
  { value: "resume_failed", label: "简历未通过", tone: "negative" },
  { value: "offer", label: "Offer", tone: "positive" },
  { value: "cancelled", label: "已取消", tone: "neutral" },
  { value: "closed", label: "已关闭", tone: "negative" },
  { value: "expired", label: "已过期", tone: "neutral" },
] as const satisfies ReadonlyArray<{
  value: DirectSubmissionStatus;
  label: string;
  tone: StatusTone;
}>;

const DIRECT_PRESENTATION = Object.fromEntries(
  DIRECT_SUBMISSION_STATUS_OPTIONS.map(({ value, label, tone }) => [
    value,
    { label, tone },
  ]),
) as Record<
  DirectSubmissionStatus,
  { label: string; tone: StatusTone }
>;

const INTERVIEW_SUFFIX: Record<
  InterviewStatus,
  { suffix: string; tone: StatusTone }
> = {
  pending_interview: { suffix: "待进行", tone: "neutral" },
  pending_result: { suffix: "待结果", tone: "warning" },
  passed: { suffix: "过", tone: "positive" },
  failed: { suffix: "挂", tone: "negative" },
};

export function displaySubmissionStatus(input: {
  statusSource: "direct" | "interview";
  directStatus: DirectSubmissionStatus;
  currentInterview: {
    stageName: string;
    status: InterviewStatus;
  } | null;
}): { label: string; tone: StatusTone } {
  if (input.statusSource === "interview" && input.currentInterview) {
    const presentation =
      INTERVIEW_SUFFIX[input.currentInterview.status];
    return {
      label: `${input.currentInterview.stageName}${presentation.suffix}`,
      tone: presentation.tone,
    };
  }
  return DIRECT_PRESENTATION[input.directStatus];
}

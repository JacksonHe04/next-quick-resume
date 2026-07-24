import type { DirectSubmissionStatus } from "@/modules/submissions/service";

const TERMINAL_DIRECT_STATUSES = new Set<DirectSubmissionStatus>([
  "offer",
  "cancelled",
  "closed",
  "expired",
]);

export function isTerminalDirectStatus(
  status: DirectSubmissionStatus,
): boolean {
  return TERMINAL_DIRECT_STATUSES.has(status);
}

export function shouldAdvanceSubmission(
  directStatus: DirectSubmissionStatus,
): boolean {
  return !isTerminalDirectStatus(directStatus);
}

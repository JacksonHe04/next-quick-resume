import { describe, expect, it } from "vitest";

import {
  isTerminalDirectStatus,
  shouldAdvanceSubmission,
} from "@/modules/interviews/status";

describe("interview submission advancement rules", () => {
  it("preserves direct terminal statuses", () => {
    expect(isTerminalDirectStatus("offer")).toBe(true);
    expect(isTerminalDirectStatus("cancelled")).toBe(true);
    expect(isTerminalDirectStatus("closed")).toBe(true);
    expect(isTerminalDirectStatus("expired")).toBe(true);
    expect(shouldAdvanceSubmission("offer")).toBe(false);
  });

  it("advances active direct statuses", () => {
    expect(shouldAdvanceSubmission("submitted")).toBe(true);
    expect(shouldAdvanceSubmission("screening")).toBe(true);
    expect(shouldAdvanceSubmission("resume_passed")).toBe(true);
    expect(shouldAdvanceSubmission("resume_failed")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { displaySubmissionStatus } from "@/modules/submissions/status";

describe("submission status presentation", () => {
  it("maps direct statuses to approved Chinese copy", () => {
    expect(
      displaySubmissionStatus({
        statusSource: "direct",
        directStatus: "resume_failed",
        currentInterview: null,
      }),
    ).toEqual({ label: "简历未通过", tone: "negative" });
  });

  it("combines the official stage name with the current interview status", () => {
    expect(
      displaySubmissionStatus({
        statusSource: "interview",
        directStatus: "submitted",
        currentInterview: {
          stageName: "二面",
          status: "pending_result",
        },
      }),
    ).toEqual({ label: "二面待结果", tone: "warning" });
    expect(
      displaySubmissionStatus({
        statusSource: "interview",
        directStatus: "submitted",
        currentInterview: {
          stageName: "二面",
          status: "passed",
        },
      }),
    ).toEqual({ label: "二面过", tone: "positive" });
  });

  it("falls back to direct status when an interview reference is unavailable", () => {
    expect(
      displaySubmissionStatus({
        statusSource: "interview",
        directStatus: "screening",
        currentInterview: null,
      }),
    ).toMatchObject({ label: "筛选中" });
  });
});

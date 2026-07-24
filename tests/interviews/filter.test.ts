import { describe, expect, it } from "vitest";

import {
  filterInterviews,
  groupInterviews,
  type FilterableInterview,
} from "@/modules/interviews/filter";

const records: FilterableInterview[] = [
  {
    id: "upcoming",
    companyName: "OpenAI",
    stageId: "stage-ai",
    status: "pending_interview",
    scheduledAt: "2026-08-03T08:00:00.000Z",
  },
  {
    id: "waiting",
    companyName: "腾讯",
    stageId: "stage-first",
    status: "pending_result",
    scheduledAt: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "history",
    companyName: "OpenAI",
    stageId: "stage-written",
    status: "passed",
    scheduledAt: "2026-07-10T08:00:00.000Z",
  },
];

describe("interview filters and sections", () => {
  it("filters by stage, status, company, and date", () => {
    expect(
      filterInterviews(records, {
        stageId: "stage-ai",
        status: "pending_interview",
        companyName: "OpenAI",
        from: "2026-08-01",
        to: "2026-08-31",
      }).map((record) => record.id),
    ).toEqual(["upcoming"]);
  });

  it("organizes the list into upcoming, pending result, and history", () => {
    expect(groupInterviews(records)).toEqual({
      upcoming: [records[0]],
      pendingResult: [records[1]],
      history: [records[2]],
    });
  });
});

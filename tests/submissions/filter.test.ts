import { describe, expect, it } from "vitest";

import {
  filterSubmissions,
  type FilterableSubmission,
} from "@/modules/submissions/filter";

const records: FilterableSubmission[] = [
  {
    id: "submission-a",
    batchId: "batch-a",
    batchName: "夏季探索",
    companyName: "OpenAI",
    positionConcept: "产品经理",
    positionName: "AI 产品经理",
    appliedAt: "2026-07-10T08:00:00.000Z",
    statusSource: "direct",
    directStatus: "screening",
    stageName: null,
    interviewStatus: null,
  },
  {
    id: "submission-b",
    batchId: "batch-b",
    batchName: "秋季冲刺",
    companyName: "腾讯",
    positionConcept: "市场营销",
    positionName: "国际市场培训生",
    appliedAt: "2026-08-02T08:00:00.000Z",
    statusSource: "interview",
    directStatus: "submitted",
    stageName: "一面",
    interviewStatus: "passed",
  },
];

describe("submission filters", () => {
  it("combines URL-backed catalog and date filters without hiding all batches by default", () => {
    expect(filterSubmissions(records, {})).toHaveLength(2);
    expect(
      filterSubmissions(records, {
        batchId: "batch-b",
        companyName: "腾讯",
        positionConcept: "市场营销",
        status: "一面过",
        from: "2026-08-01",
        to: "2026-08-31",
      }).map((record) => record.id),
    ).toEqual(["submission-b"]);
  });

  it("searches the company, position, submitted title, and batch", () => {
    expect(
      filterSubmissions(records, { query: "夏季" }).map(
        (record) => record.id,
      ),
    ).toEqual(["submission-a"]);
    expect(
      filterSubmissions(records, { query: "国际市场" }).map(
        (record) => record.id,
      ),
    ).toEqual(["submission-b"]);
  });
});

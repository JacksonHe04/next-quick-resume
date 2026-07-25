import { describe, expect, it } from "vitest";

import {
  mapBatch,
  mapCompany,
  mapInterview,
  mapQuestion,
  mapResume,
  mapSubmission,
  stableWikiId,
  type WikiPage,
} from "@/modules/import/wiki-mapper";

const submission: WikiPage = {
  notionId: "11111111-1111-4111-8111-111111111111",
  title: "示例公司 2026-07-01 平台产品",
  body: "# 投递记录\n\n关注平台能力。",
  createdTime: "2026-07-01T02:00:00.000Z",
  lastEditedTime: "2026-07-02T02:00:00.000Z",
  properties: {
    Time: "2026-07-01T10:00:00.000+08:00",
    Company: ["company-source"],
    Position: ["position-source"],
    Batch: ["batch-source"],
    City: ["city-source"],
    Type: ["channel-source"],
    Status: "已结束",
    Result: "简历挂",
    JD: "https://example.com/jobs/1",
  },
};

const relations = new Map([
  ["company-source", "示例公司"],
  ["position-source", "平台产品"],
  ["batch-source", "夏季探索"],
  ["city-source", "上海"],
  ["channel-source", "官网"],
  ["stage-source", "一面"],
  ["category-source", "产品设计"],
]);

describe("Wiki import mappings", () => {
  it("creates stable namespaced IDs from Notion IDs", () => {
    expect(stableWikiId("submission", submission.notionId)).toBe(
      "wiki-submission-11111111-1111-4111-8111-111111111111",
    );
  });

  it("maps a Notion submission to the SAYLESS schema", () => {
    expect(mapSubmission(submission, relations)).toMatchObject({
      id: "wiki-submission-11111111-1111-4111-8111-111111111111",
      companyName: "示例公司",
      positionName: "平台产品",
      batchSourceId: "batch-source",
      appliedAt: "2026-07-01T02:00:00.000Z",
      directStatus: "resume_failed",
      jdUrl: "https://example.com/jobs/1",
      location: "上海",
      channel: "官网",
    });
  });

  it("maps the complete Notion company record and its city relations", () => {
    const company = mapCompany(
      {
        notionId: "company-source",
        title: "示例公司",
        body: "",
        createdTime: "2026-07-01T02:00:00.000Z",
        lastEditedTime: "2026-07-02T02:00:00.000Z",
        properties: {
          Link: "https://jobs.example.com",
          Process: "https://jobs.example.com/process",
          Priority: "Top",
          City: ["city-source", "city-source-2"],
          "PM Submission": [submission.notionId],
        },
      },
      new Map([
        ...relations,
        ["city-source-2", "北京"],
      ]),
    );

    expect(company).toMatchObject({
      id: "wiki-company-company-source",
      sourceId: "company-source",
      name: "示例公司",
      careersUrl: "https://jobs.example.com",
      processUrl: "https://jobs.example.com/process",
      priority: "Top",
      cities: [
        { sourceId: "city-source", name: "上海" },
        { sourceId: "city-source-2", name: "北京" },
      ],
      submissionSourceIds: [submission.notionId],
    });
  });

  it("keeps an untitled source row for audit without publishing it", () => {
    expect(
      mapCompany(
        {
          notionId: "untitled-source",
          title: "untitled",
          body: "",
          properties: {},
        },
        relations,
      ),
    ).toMatchObject({
      name: "未命名公司",
      isActive: false,
    });
  });

  it("maps an interview review into one interview record", () => {
    const page: WikiPage = {
      notionId: "22222222-2222-4222-8222-222222222222",
      title: "示例公司：一面",
      body: "## 复盘\n\n需要加强结构化表达。",
      createdTime: "2026-07-03T01:00:00.000Z",
      lastEditedTime: "2026-07-03T03:00:00.000Z",
      properties: {
        Submission: [submission.notionId],
        Stage: ["stage-source"],
        Status: "Success",
        Time: "2026-07-03T15:00:00.000+08:00",
        Duration: 45,
      },
    };

    expect(mapInterview(page, relations)).toMatchObject({
      submissionSourceId: submission.notionId,
      stageName: "一面",
      status: "passed",
      durationMinutes: 45,
      reviewMarkdown: "## 复盘\n\n需要加强结构化表达。",
    });
  });

  it("maps batches, questions, and resumes without inventing relations", () => {
    const batch = mapBatch({
      notionId: "33333333-3333-4333-8333-333333333333",
      title: "夏季探索",
      body: "集中验证平台产品方向。",
      properties: {},
    });
    const question = mapQuestion(
      {
        notionId: "44444444-4444-4444-8444-444444444444",
        title: "如何判断需求优先级？",
        body: "先判断用户价值，再看战略和成本。",
        properties: { Category: ["category-source"] },
      },
      relations,
    );
    const resume = mapResume({
      notionId: "55555555-5555-4555-8555-555555555555",
      title: "平台产品简历",
      body: "## 经历\n\n负责平台能力建设。",
      properties: { Date: "2026-07-01" },
    });

    expect(batch).toMatchObject({ name: "夏季探索" });
    expect(question).toMatchObject({
      questionText: "如何判断需求优先级？",
      answerMarkdown: "先判断用户价值，再看战略和成本。",
      category: "产品设计",
    });
    expect(resume).toMatchObject({
      name: "平台产品简历",
      markdownBody: "## 经历\n\n负责平台能力建设。",
    });
  });
});

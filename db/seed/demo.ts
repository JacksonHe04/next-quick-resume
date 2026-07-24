import { and, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  batches,
  interviewQuestions,
  interviews,
  questions,
  resumes,
  submissions,
  userPreferences,
  users,
} from "@/db/schema";
import { createDefaultResumeDocument } from "@/modules/resumes/defaults";

type Database = DrizzleD1Database<typeof schema>;

export const DEMO_USER_ID = "demo-user";

export async function seedDemoUserData(
  database: Database,
  input: {
    email: string;
    passwordHash: string;
    now?: Date;
  },
) {
  const now = input.now ?? new Date();
  const day = 24 * 3_600_000;
  await database
    .insert(users)
    .values({
      id: DEMO_USER_ID,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      name: "SAYLESS Demo",
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        name: "SAYLESS Demo",
        updatedAt: now,
      },
    })
    .run();

  const demoBatches = [
    {
      id: "demo-batch-current",
      name: "2026 夏季冲刺",
      description: "聚焦 AI 与互联网产品岗位",
      startDate: new Date(now.getTime() - 20 * day),
    },
    {
      id: "demo-batch-archive",
      name: "探索期",
      description: "验证求职方向与简历叙事",
      startDate: new Date(now.getTime() - 70 * day),
      endDate: new Date(now.getTime() - 30 * day),
      archivedAt: new Date(now.getTime() - 30 * day),
    },
  ];
  for (const batch of demoBatches) {
    await database
      .insert(batches)
      .values({
        ...batch,
        userId: DEMO_USER_ID,
        strategyMarkdown: "## 策略\n\n优先高匹配度岗位，集中复盘。",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: batches.id,
        set: { ...batch, updatedAt: now },
      })
      .run();
  }
  await database
    .insert(userPreferences)
    .values({
      userId: DEMO_USER_ID,
      currentBatchId: "demo-batch-current",
      timezone: "Asia/Singapore",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        currentBatchId: "demo-batch-current",
        updatedAt: now,
      },
    })
    .run();

  const demoSubmissions = [
    {
      id: "demo-submission-openai",
      companyId: "company-openai",
      positionId: "position-ai-pm",
      positionName: "AI 产品经理",
      batchId: "demo-batch-current",
      directStatus: "resume_passed" as const,
      appliedAt: new Date(now.getTime() - 9 * day),
    },
    {
      id: "demo-submission-bytedance",
      companyId: "company-bytedance",
      positionId: "position-pm",
      positionName: "商业产品经理",
      batchId: "demo-batch-current",
      directStatus: "resume_passed" as const,
      appliedAt: new Date(now.getTime() - 7 * day),
    },
    {
      id: "demo-submission-xhs",
      companyId: "company-xiaohongshu",
      positionId: "position-growth-pm",
      positionName: "增长产品经理",
      batchId: "demo-batch-current",
      directStatus: "submitted" as const,
      appliedAt: new Date(now.getTime() - 3 * day),
    },
    {
      id: "demo-submission-tencent",
      companyId: "company-tencent",
      positionId: "position-pm",
      positionName: "产品策划",
      batchId: "demo-batch-current",
      directStatus: "offer" as const,
      appliedAt: new Date(now.getTime() - 18 * day),
    },
    {
      id: "demo-submission-shopee",
      companyId: "company-shopee",
      positionId: "position-ba",
      positionName: "商业分析师",
      batchId: "demo-batch-archive",
      directStatus: "resume_failed" as const,
      appliedAt: new Date(now.getTime() - 45 * day),
    },
  ];
  for (const submission of demoSubmissions) {
    await database
      .insert(submissions)
      .values({
        id: submission.id,
        userId: DEMO_USER_ID,
        clientMutationId: `seed-${submission.id}`,
        batchId: submission.batchId,
        officialCompanyId: submission.companyId,
        privateCompanyId: null,
        officialPositionId: submission.positionId,
        privatePositionId: null,
        positionName: submission.positionName,
        appliedAt: submission.appliedAt,
        statusSource: "direct",
        directStatus: submission.directStatus,
        currentInterviewId: null,
        statusUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: submissions.id,
        set: {
          positionName: submission.positionName,
          directStatus: submission.directStatus,
          appliedAt: submission.appliedAt,
          updatedAt: now,
        },
      })
      .run();
  }

  const demoInterviews = [
    {
      id: "demo-interview-openai",
      submissionId: "demo-submission-openai",
      stageId: "stage-first",
      name: "产品案例一面",
      status: "pending_interview" as const,
      scheduledAt: new Date(now.getTime() + 2 * day),
    },
    {
      id: "demo-interview-bytedance",
      submissionId: "demo-submission-bytedance",
      stageId: "stage-second",
      name: "业务二面",
      status: "pending_interview" as const,
      scheduledAt: new Date(now.getTime() + 4 * day),
    },
    {
      id: "demo-interview-tencent-first",
      submissionId: "demo-submission-tencent",
      stageId: "stage-first",
      name: "产品一面",
      status: "passed" as const,
      scheduledAt: new Date(now.getTime() - 12 * day),
    },
    {
      id: "demo-interview-tencent-hr",
      submissionId: "demo-submission-tencent",
      stageId: "stage-hr",
      name: "HR 面",
      status: "passed" as const,
      scheduledAt: new Date(now.getTime() - 5 * day),
    },
  ];
  for (const interview of demoInterviews) {
    await database
      .insert(interviews)
      .values({
        ...interview,
        userId: DEMO_USER_ID,
        durationMinutes: 60,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: interviews.id,
        set: { ...interview, updatedAt: now },
      })
      .run();
  }
  for (const [submissionId, currentInterviewId] of [
    ["demo-submission-openai", "demo-interview-openai"],
    ["demo-submission-bytedance", "demo-interview-bytedance"],
  ] as const) {
    await database
      .update(submissions)
      .set({
        statusSource: "interview",
        currentInterviewId,
        updatedAt: now,
      })
      .where(
        and(
          eq(submissions.userId, DEMO_USER_ID),
          eq(submissions.id, submissionId),
        ),
      )
      .run();
  }

  const demoQuestions = [
    [
      "demo-question-intro",
      "请做一个简短的自我介绍",
      "自我介绍",
      "从当前定位、关键证据和岗位匹配三个部分展开。",
    ],
    [
      "demo-question-project",
      "介绍一个最有挑战的项目",
      "项目经历",
      "使用 STAR 结构，重点说明判断、取舍和结果。",
    ],
    [
      "demo-question-motivation",
      "为什么选择产品经理？",
      "求职动机",
      "连接过往经历、能力优势与长期方向。",
    ],
  ] as const;
  for (const [id, questionText, category, answerMarkdown] of
    demoQuestions) {
    await database
      .insert(questions)
      .values({
        id,
        userId: DEMO_USER_ID,
        questionText,
        category,
        answerMarkdown,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: questions.id,
        set: { questionText, category, answerMarkdown, updatedAt: now },
      })
      .run();
  }
  await database
    .insert(interviewQuestions)
    .values([
      {
        userId: DEMO_USER_ID,
        interviewId: "demo-interview-openai",
        questionId: "demo-question-project",
        createdAt: now,
      },
      {
        userId: DEMO_USER_ID,
        interviewId: "demo-interview-bytedance",
        questionId: "demo-question-intro",
        createdAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();

  const document = createDefaultResumeDocument();
  await database
    .insert(resumes)
    .values({
      id: "demo-resume",
      userId: DEMO_USER_ID,
      name: "AI 产品经理简历",
      dataJson: JSON.stringify(document.data),
      displayConfigJson: JSON.stringify(document.displayConfig),
      version: 1,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();
}

import { describe, expect, it } from "vitest";

import {
  getDashboard,
  type DashboardRepository,
} from "@/modules/dashboard/service";

const now = new Date("2026-07-25T00:00:00.000Z");

describe("dashboard service", () => {
  it("counts submissions across every batch by default", async () => {
    const repository: DashboardRepository = {
      async getCurrentBatchName() {
        return "2026 夏季";
      },
      async getBatchCounts() {
        return { active: 2, archived: 1 };
      },
      async listSubmissions() {
        return [
          {
            id: "a",
            batchId: "batch-a",
            directStatus: "submitted",
            statusSource: "direct",
            currentInterviewStatus: null,
            hasInterview: false,
          },
          {
            id: "b",
            batchId: "batch-b",
            directStatus: "resume_passed",
            statusSource: "interview",
            currentInterviewStatus: "pending_interview",
            hasInterview: true,
          },
          {
            id: "c",
            batchId: "batch-b",
            directStatus: "offer",
            statusSource: "direct",
            currentInterviewStatus: null,
            hasInterview: true,
          },
        ];
      },
      async listInterviews() {
        return Array.from({ length: 6 }, (_, index) => ({
          id: `interview-${index}`,
          companyName: `公司 ${index}`,
          positionName: "产品经理",
          name: `第 ${index + 1} 轮`,
          stageName: "面试",
          status: "pending_interview" as const,
          scheduledAt: new Date(now.getTime() + (index + 1) * 3_600_000),
        }));
      },
    };

    const dashboard = await getDashboard(
      repository,
      "user-a",
      {},
      now,
    );

    expect(dashboard.totalSubmissions).toBe(3);
    expect(dashboard.upcomingInterviews).toHaveLength(3);
    expect(dashboard.upcomingInterviews[0].id).toBe("interview-0");
    expect(dashboard.interviewsNextSevenDays).toBe(6);
    expect(dashboard.batchCounts).toEqual({ active: 2, archived: 1 });
    expect(dashboard.conversion).toMatchObject({
      submitted: 3,
      resumePassed: 2,
      enteredInterview: 2,
      finalPassed: 1,
    });
  });

  it("only applies a batch filter when it is explicitly provided", async () => {
    const repository: DashboardRepository = {
      async getCurrentBatchName() {
        return null;
      },
      async getBatchCounts() {
        return { active: 0, archived: 0 };
      },
      async listSubmissions() {
        return [
          {
            id: "a",
            batchId: "batch-a",
            directStatus: "submitted",
            statusSource: "direct",
            currentInterviewStatus: null,
            hasInterview: false,
          },
          {
            id: "b",
            batchId: "batch-b",
            directStatus: "submitted",
            statusSource: "direct",
            currentInterviewStatus: null,
            hasInterview: false,
          },
        ];
      },
      async listInterviews() {
        return [];
      },
    };

    const dashboard = await getDashboard(
      repository,
      "user-a",
      { batchId: "batch-a" },
      now,
    );

    expect(dashboard.totalSubmissions).toBe(1);
  });
});

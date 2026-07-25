import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SubmissionDetail } from "@/components/submissions/submission-detail";

describe("SubmissionDetail", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("exposes the company recruitment and application progress links", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            submissions: [
              {
                id: "submission-a",
                batchName: "夏季探索",
                companyName: "OpenAI",
                companyCareersUrl: "https://openai.com/careers",
                companyProcessUrl:
                  "https://openai.com/careers/applications",
                positionConcept: "产品经理",
                positionName: "平台产品经理",
                jdUrl: "https://openai.com/careers/job-a",
                location: "San Francisco",
                channel: "官网",
                appliedAt: "2026-07-25T00:00:00.000Z",
                statusSource: "direct",
                directStatus: "submitted",
                stageName: null,
                interviewStatus: null,
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    render(
      <SubmissionDetail
        id="submission-a"
        initialDetail={{
          id: "submission-a",
          batchName: "夏季探索",
          companyName: "OpenAI",
          companyCareersUrl: "https://openai.com/careers",
          companyProcessUrl:
            "https://openai.com/careers/applications",
          positionConcept: "产品经理",
          positionName: "平台产品经理",
          jdUrl: "https://openai.com/careers/job-a",
          location: "San Francisco",
          channel: "官网",
          appliedAt: "2026-07-25T00:00:00.000Z",
          statusSource: "direct",
          directStatus: "submitted",
          stageName: null,
          interviewStatus: null,
        }}
      />,
    );

    expect(
      await screen.findByRole("link", {
        name: "打开 OpenAI 招聘网站",
      }),
    ).toHaveAttribute("href", "https://openai.com/careers");
    expect(
      screen.getByRole("link", {
        name: "查看 OpenAI 投递进度",
      }),
    ).toHaveAttribute(
      "href",
      "https://openai.com/careers/applications",
    );
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InterviewForm } from "@/components/interviews/interview-form";

describe("InterviewForm", () => {
  it("offers only the four approved interview statuses", () => {
    render(
      <InterviewForm
        submissions={[
          {
            id: "submission-a",
            label: "OpenAI · 产品经理",
          },
        ]}
        stages={[
          { id: "stage-a", name: "一面" },
        ]}
        onCreated={vi.fn()}
      />,
    );

    const status = screen.getByRole("combobox", {
      name: "状态",
    });
    expect(
      Array.from(status.querySelectorAll("option")).map(
        (option) => option.textContent,
      ),
    ).toEqual(["待进行", "待结果", "已通过", "未通过"]);
  });
});

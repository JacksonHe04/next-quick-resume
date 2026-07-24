import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SubmissionForm } from "@/components/submissions/submission-form";

describe("SubmissionForm", () => {
  it("requires both a position concept and a submitted position name", async () => {
    const user = userEvent.setup();
    render(
      <SubmissionForm
        batches={[
          {
            id: "batch-a",
            name: "2026 夏季产品岗",
          },
        ]}
        currentBatchId="batch-a"
        onCreated={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "保存投递" }),
    );

    expect(screen.getByText("请选择公司")).toBeVisible();
    expect(screen.getByText("请选择岗位")).toBeVisible();
    expect(screen.getByText("请输入岗位名称")).toBeVisible();
  });
});

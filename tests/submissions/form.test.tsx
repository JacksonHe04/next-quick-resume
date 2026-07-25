import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { SubmissionForm } from "@/components/submissions/submission-form";

describe("SubmissionForm", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

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

  it("shows official company recruitment and process links without a custom-company fallback", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            options: [
              {
                source: "official",
                id: "company-openai",
                name: "OpenAI",
                careersUrl: "https://openai.com/careers",
                processUrl:
                  "https://openai.com/careers/applications",
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
      <SubmissionForm
        batches={[{ id: "batch-a", name: "夏季探索" }]}
        currentBatchId="batch-a"
        onCreated={vi.fn()}
      />,
    );

    const companyPicker = screen.getByRole("combobox", {
      name: "公司",
    });
    await user.type(companyPicker, "OpenAI");
    await user.click(
      await screen.findByRole("option", { name: /OpenAI/ }),
    );

    expect(
      screen.getByRole("link", { name: "打开 OpenAI 招聘网站" }),
    ).toHaveAttribute("href", "https://openai.com/careers");
    expect(
      screen.getByRole("link", { name: "查看 OpenAI 投递进度" }),
    ).toHaveAttribute(
      "href",
      "https://openai.com/careers/applications",
    );
    expect(
      screen.queryByRole("button", { name: /没找到/ }),
    ).not.toBeInTheDocument();
  });
});

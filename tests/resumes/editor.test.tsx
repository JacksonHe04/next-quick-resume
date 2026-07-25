import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ResumeEditor } from "@/components/resumes/resume-editor";
import type { ResumeRecord } from "@/modules/resumes/service";

const initial: ResumeRecord = {
  id: "resume-a",
  userId: "user-a",
  name: "产品简历",
  version: 1,
  createdAt: new Date("2026-07-25T00:00:00.000Z"),
  updatedAt: new Date("2026-07-25T00:00:00.000Z"),
  document: {
    schemaVersion: 1,
    data: {
      header: {
        name: "Jackson",
        contact: { phone: "", email: "jackson@example.com" },
        jobInfo: {},
      },
    },
    displayConfig: {
      sections: [
        { key: "header", label: "个人信息", visible: true },
      ],
      sectionOrder: ["header"],
      headerAlignment: "left",
      photo: { showPhoto: false },
    },
  },
};

afterEach(cleanup);

describe("resume editor", () => {
  it("restores the configuration, preview, and resume switcher columns", () => {
    render(
      <ResumeEditor
        initial={initial}
        availableResumes={[
          initial,
          {
            ...initial,
            id: "resume-b",
            name: "市场简历",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("complementary", { name: "简历配置" }),
    ).toBeVisible();
    expect(screen.getByRole("main", { name: "简历预览" })).toBeVisible();
    expect(
      screen.getByRole("complementary", { name: "切换简历" }),
    ).toBeVisible();
    expect(screen.getByLabelText("上传头像")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "切换到市场简历" }),
    ).toHaveAttribute("href", "/app/resumes/resume-b");
  });

  it("keeps the local draft and offers retry after a save failure", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockRejectedValue(new Error("offline"));
    render(<ResumeEditor initial={initial} save={save} autosaveDelay={10} />);

    await user.type(screen.getByLabelText("姓名"), "何");

    expect(await screen.findByText("保存失败，重试")).toBeVisible();
    expect(screen.getByLabelText("姓名")).toHaveValue("Jackson何");
  });

  it("does not save an unchanged resume when Strict Mode replays effects", async () => {
    const save = vi.fn().mockResolvedValue({ version: 2 });

    render(
      <StrictMode>
        <ResumeEditor initial={initial} save={save} autosaveDelay={1} />
      </StrictMode>,
    );

    await new Promise((resolve) => window.setTimeout(resolve, 20));
    expect(save).not.toHaveBeenCalled();
  });
});

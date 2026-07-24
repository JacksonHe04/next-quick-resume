import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

describe("resume editor", () => {
  it("keeps the local draft and offers retry after a save failure", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockRejectedValue(new Error("offline"));
    render(<ResumeEditor initial={initial} save={save} autosaveDelay={10} />);

    await user.type(screen.getByLabelText("姓名"), "何");

    expect(await screen.findByText("保存失败，重试")).toBeVisible();
    expect(screen.getByLabelText("姓名")).toHaveValue("Jackson何");
  });
});

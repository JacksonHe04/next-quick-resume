import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ResumeEditor } from "@/components/resumes/resume-editor";
import { ResumePreview } from "@/components/resumes/resume-preview";
import type { ResumeRecord } from "@/modules/resumes/service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

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
  it("restores the configuration, preview, and resume switcher columns", async () => {
    const user = userEvent.setup();
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
    const workspaceSwitch = screen.getByRole("navigation", {
      name: "简历视图",
    });
    expect(
      within(workspaceSwitch).getByRole("link", { name: "管理" }),
    ).toHaveAttribute("href", "/app/resumes");
    expect(
      within(workspaceSwitch).getByRole("link", { name: "编辑" }),
    ).toHaveAttribute(
      "href",
      "/app/resumes/resume-a",
    );
    expect(
      within(workspaceSwitch).getByRole("link", { name: "编辑" }),
    ).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("switch", { name: "显示照片" }));
    expect(screen.getByLabelText("上传头像")).toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "显示头部按钮" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "切换到市场简历" }),
    ).toHaveAttribute("href", "/app/resumes/resume-b");
  });

  it("keeps the editor toolbar inside the application content area", () => {
    render(<ResumeEditor initial={initial} />);

    expect(
      screen.getByRole("banner", { name: "简历编辑工具栏" }),
    ).not.toHaveClass("fixed");
    expect(
      screen
        .getByRole("main", { name: "简历预览" })
        .querySelector("#resume-preview"),
    ).toBeInTheDocument();
  });

  it("keeps the local draft and offers retry after a save failure", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockRejectedValue(new Error("offline"));
    render(<ResumeEditor initial={initial} save={save} autosaveDelay={10} />);

    const photoSwitch = screen.getByRole("switch", { name: "显示照片" });
    await user.click(photoSwitch);

    expect(await screen.findByText("保存失败，重试")).toBeVisible();
    expect(photoSwitch).toHaveAttribute("aria-checked", "true");
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

  it("uses the resume-only preview typography instead of the later A4 card", () => {
    const document = structuredClone(initial.document);
    document.data.skills = {
      title: "专业技能",
      items: ["熟悉 **React**"],
    };
    document.displayConfig.sections.push({
      key: "skills",
      label: "专业技能",
      visible: true,
    });
    document.displayConfig.sectionOrder.push("skills");

    const { container } = render(<ResumePreview document={document} />);
    const preview = container.querySelector("#resume-preview");
    const title = screen.getByRole("heading", { name: "专业技能" });
    const list = title.nextElementSibling;

    expect(preview).not.toHaveClass("max-w-[794px]");
    expect(preview).not.toHaveClass(
      "shadow-[0_16px_48px_rgb(38_48_39/0.12)]",
    );
    expect(screen.getByRole("heading", { name: "Jackson" })).toHaveClass(
      "font-serif",
    );
    expect(title).toHaveClass("border-black");
    expect(list).toHaveClass("list-decimal");
    expect(screen.getByText("React").tagName).toBe("STRONG");
  });

  it("keeps the photo inside a header-sized frame for printing", () => {
    const document = structuredClone(initial.document);
    document.displayConfig.photo = {
      showPhoto: true,
      photoData: "data:image/png;base64,iVBORw0KGgo=",
    };

    render(<ResumePreview document={document} />);

    const frame = screen.getByTestId("resume-photo-frame");
    const image = screen.getByRole("img", { name: "个人照片" });

    expect(frame).toHaveClass(
      "resume-photo-frame",
      "relative",
      "overflow-hidden",
      "sm:h-auto",
      "sm:self-stretch",
      "print:h-auto",
      "print:self-stretch",
    );
    expect(frame).not.toHaveClass("sm:h-40");
    expect(image).toHaveClass(
      "resume-photo-image",
      "absolute",
      "inset-0",
      "h-full",
      "w-full",
      "object-cover",
    );
  });
});

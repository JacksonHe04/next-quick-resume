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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("resume editor", () => {
  it("uses one sidebar for layout, content, and resume switching", async () => {
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
      screen.queryByRole("complementary", { name: "切换简历" }),
    ).not.toBeInTheDocument();
    const workspaceSwitch = screen.getByRole("navigation", {
      name: "简历视图",
    });
    expect(
      within(workspaceSwitch).getByRole("link", { name: "管理简历" }),
    ).toHaveAttribute("href", "/app/resumes");
    expect(
      within(workspaceSwitch).getByRole("link", { name: "编辑简历" }),
    ).toHaveAttribute(
      "href",
      "/app/resumes/resume-a",
    );
    expect(
      within(workspaceSwitch).getByRole("link", { name: "编辑简历" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.queryByText("头部样式设置")).not.toBeInTheDocument();
    expect(screen.queryByText("对齐方式")).not.toBeInTheDocument();
    expect(screen.queryByText("模块管理")).not.toBeInTheDocument();
    expect(screen.queryByText("保存简历")).not.toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "显示照片" }));
    expect(screen.getByLabelText("上传头像")).toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "显示头部按钮" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "简历列表" }));
    expect(screen.getByRole("link", { name: "切换到市场简历" })).toHaveAttribute(
      "href",
      "/app/resumes/resume-b",
    );
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

  it("copies Markdown and opens browser printing from direct toolbar actions", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<ResumeEditor initial={initial} />);

    expect(screen.queryByRole("button", { name: "导出" })).not.toBeInTheDocument();
    const copyMarkdownButton = screen.getByRole("button", {
      name: "复制为 Markdown",
    });
    await user.hover(copyMarkdownButton);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "复制为 Markdown",
    );
    await user.click(copyMarkdownButton);
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("# Jackson"),
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("- 邮箱：jackson@example.com"),
    );
    expect(
      screen.getByRole("button", { name: "已复制 Markdown" }),
    ).toHaveAttribute("data-state", "copied");

    await user.click(screen.getByRole("button", { name: "导出为 PDF" }));
    expect(print).toHaveBeenCalledOnce();
  });

  it("keeps autosave invisible while preserving a local draft on failure", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockRejectedValue(new Error("offline"));
    render(<ResumeEditor initial={initial} save={save} autosaveDelay={10} />);

    const photoSwitch = screen.getByRole("switch", { name: "显示照片" });
    await user.click(photoSwitch);

    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/保存/)).not.toBeInTheDocument();
    expect(photoSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("edits structured content and autosaves the same document", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue({ version: 2 });
    render(<ResumeEditor initial={initial} save={save} autosaveDelay={10} />);

    await user.click(screen.getByRole("button", { name: "内容" }));
    const nameInput = screen.getByLabelText("姓名");
    await user.clear(nameInput);
    await user.type(nameInput, "何锦诚");

    expect(screen.getByRole("heading", { name: "何锦诚" })).toBeVisible();
    await vi.waitFor(() =>
      expect(save).toHaveBeenLastCalledWith(
        expect.objectContaining({
          document: expect.objectContaining({
            data: expect.objectContaining({
              header: expect.objectContaining({ name: "何锦诚" }),
            }),
          }),
        }),
      ),
    );
  });

  it("adds and removes education, internship, and project entries", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue({ version: 2 });
    render(<ResumeEditor initial={initial} save={save} autosaveDelay={10} />);

    await user.click(screen.getByRole("button", { name: "内容" }));

    await user.click(
      screen.getByRole("button", { name: "新增教育经历" }),
    );
    expect(screen.getAllByLabelText("学校")).toHaveLength(1);
    await user.click(
      screen.getByRole("button", { name: "删除教育经历 1" }),
    );
    expect(screen.queryByLabelText("学校")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("实习经历编辑区域"));
    await user.click(
      screen.getByRole("button", { name: "新增实习经历" }),
    );
    expect(screen.getAllByLabelText("公司")).toHaveLength(1);
    await user.click(
      screen.getByRole("button", { name: "删除实习经历 1" }),
    );
    expect(screen.queryByLabelText("公司")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("项目经历编辑区域"));
    await user.click(
      screen.getByRole("button", { name: "新增项目经历" }),
    );
    expect(screen.getAllByLabelText("项目名称")).toHaveLength(1);
    await user.click(
      screen.getByRole("button", { name: "删除项目经历 1" }),
    );
    expect(screen.queryByLabelText("项目名称")).not.toBeInTheDocument();
  });

  it("contains sidebar and preview scrolling inside the editor", () => {
    render(<ResumeEditor initial={initial} />);

    expect(screen.getByTestId("resume-sidebar-scroll")).toHaveClass(
      "overflow-y-auto",
      "overscroll-y-contain",
    );
    expect(screen.getByRole("main", { name: "简历预览" })).toHaveClass(
      "overflow-y-auto",
      "overscroll-y-contain",
    );
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

  it("renders multiple education entries in the preview", () => {
    const document = structuredClone(initial.document);
    document.data.education = {
      title: "教育经历",
      school: "东南大学",
      period: "2022–2026",
      details: "本科",
      items: [
        {
          school: "东南大学",
          period: "2022–2026",
          details: "本科",
        },
        {
          school: "清华大学",
          period: "2026–2029",
          details: "硕士",
        },
      ],
    };
    document.displayConfig.sections.push({
      key: "education",
      label: "教育经历",
      visible: true,
    });
    document.displayConfig.sectionOrder.push("education");

    render(<ResumePreview document={document} />);

    expect(
      screen.getByRole("heading", { name: "东南大学" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "清华大学" }),
    ).toBeVisible();
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

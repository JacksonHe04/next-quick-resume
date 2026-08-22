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
  isPublic: false,
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
  it("switches resumes instantly from the right-side list without a server round trip", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue({ version: 2 });
    render(
      <ResumeEditor
        initial={initial}
        availableResumes={[
          initial,
          {
            ...initial,
            id: "resume-b",
            name: "市场简历",
            document: {
              ...initial.document,
              data: {
                ...initial.document.data,
                header: {
                  ...initial.document.data.header,
                  name: "市场候选人",
                },
              },
            },
          },
        ]}
        save={save}
      />,
    );

    expect(
      screen.getByRole("complementary", { name: "简历配置" }),
    ).toBeVisible();
    expect(screen.getByRole("main", { name: "简历预览" })).toBeVisible();
    const listSidebar = screen.getByRole("complementary", {
      name: "简历列表",
    });
    expect(listSidebar).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "简历视图" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "简历列表" }),
    ).not.toBeInTheDocument();

    // 切换到另一份简历：只换名称/内容/预览/列表 active，不发请求
    await user.click(
      within(listSidebar).getByRole("button", { name: "切换到市场简历" }),
    );
    expect(
      within(listSidebar).getByRole("button", { name: "切换到市场简历" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("button", { name: "编辑简历名称：市场简历" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "市场候选人" }),
    ).toBeVisible();
    expect(save).not.toHaveBeenCalled();

    // 切换不改变左侧栏当前 tab（保持在版式）
    expect(
      screen.getByRole("button", { name: "版式" }),
    ).toHaveAttribute("aria-current", "page");

    // 简历列表不展示简历第一行（头部姓名），只展示管理名称与更新时间
    expect(within(listSidebar).queryByText("Jackson")).not.toBeInTheDocument();
    expect(within(listSidebar).getByText("产品简历")).toBeInTheDocument();
  });

  it("clones the current resume from the topbar and switches to the copy", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation(async (_url: string) => {
      const body = JSON.parse(
        (fetchMock.mock.calls.at(-1)?.[1] as RequestInit | undefined)
          ?.body as string,
      );
      return {
        ok: true,
        status: 201,
        json: async () => ({
          resume: {
            id: "resume-clone",
            userId: "user-a",
            name: body.name,
            document: body.document,
            isPublic: false,
            version: 1,
            createdAt: "2026-07-25T00:00:00.000Z",
            updatedAt: "2026-07-25T00:00:00.000Z",
          },
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ResumeEditor initial={initial} />);

    await user.click(screen.getByRole("button", { name: "克隆简历" }));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/resumes",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      screen.getByRole("button", { name: "编辑简历名称：产品简历（副本）" }),
    ).toBeVisible();
    const listSidebar = screen.getByRole("complementary", {
      name: "简历列表",
    });
    await expect
      .poll(() =>
        within(listSidebar)
          .getByRole("button", { name: "切换到产品简历（副本）" })
          .getAttribute("aria-current"),
      )
      .toBe("page");
  });

  it("lets guests edit the demo resume and materializes it on first save only", async () => {
    const user = userEvent.setup();
    const requests: Array<{ url: string; method: string }> = [];
    const fetchMock = vi.fn().mockImplementation(async (_url: string) => {
      requests.push({ url: _url, method: "PATCH" });
      const body = JSON.parse(
        (fetchMock.mock.calls.at(-1)?.[1] as RequestInit | undefined)
          ?.body as string,
      );
      return {
        ok: true,
        status: 201,
        json: async () => ({
          resume: {
            id: "guest-materialized",
            userId: "demo-user",
            name: body.name,
            document: body.document,
            isPublic: false,
            version: 1,
            createdAt: "2026-07-25T00:00:00.000Z",
            updatedAt: "2026-07-25T00:00:00.000Z",
          },
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ResumeEditor initial={initial} isGuest autosaveDelay={10} />);

    // 访客没有克隆 / 分享 / 简历列表
    expect(
      screen.queryByRole("button", { name: "克隆简历" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", { name: "简历列表" }),
    ).not.toBeInTheDocument();

    // 首次修改触发物化（POST 创建），之后保存都打到该记录（PATCH）
    await user.click(screen.getByRole("button", { name: "内容" }));
    const nameInput = screen.getByLabelText("姓名");
    await user.clear(nameInput);
    await user.type(nameInput, "访客姓名");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const calls = fetchMock.mock.calls.map(
      (call) => (call[0] as string, call[1]?.method),
    );
    expect(calls[0]).toBe("POST");
    expect(requests.every((request) => request.method === "PATCH")).toBe(true);

    // 继续修改，不再创建新记录
    await user.clear(nameInput);
    await user.type(nameInput, "访客姓名二");
    await vi.waitFor(() =>
      expect(fetchMock.mock.calls.length).toBeGreaterThan(1),
    );
    const postCalls = fetchMock.mock.calls.filter(
      (call) => call[1]?.method === "POST",
    );
    expect(postCalls).toHaveLength(1);
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

  it("orders the provided JSON by the resume section order", async () => {
    const user = userEvent.setup();
    const document = structuredClone(initial.document);
    document.data.education = {
      title: "教育经历",
      school: "东南大学",
      entries: [{ period: "2022–2026", details: "本科" }],
    };
    document.data.about = { title: "关于我", content: "介绍" };
    document.displayConfig.sections.push(
      { key: "education", label: "教育经历", visible: true },
      { key: "about", label: "关于我", visible: true },
    );
    document.displayConfig.sectionOrder = ["header", "about", "education"];

    render(<ResumeEditor initial={{ ...initial, document }} />);

    await user.click(screen.getByRole("button", { name: "内容" }));
    await user.click(screen.getByLabelText("JSON 编辑区域"));
    const jsonTextarea = screen.getByLabelText(
      "简历内容 JSON",
    ) as HTMLTextAreaElement;
    const keys = Object.keys(JSON.parse(jsonTextarea.value));
    // about 在类型声明里排在 education 前，但 JSON 必须跟随 sectionOrder
    expect(keys).toEqual(["header", "about", "education"]);
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

  it("uses the resume-only preview typography and hides legacy skills sections", () => {
    const document = structuredClone(initial.document);
    document.data.about = {
      title: "关于我",
      content: "熟悉 **React**",
    };
    document.data.skills = {
      title: "专业技能",
      items: ["熟悉 **React**"],
    };
    document.displayConfig.sections.push(
      {
        key: "about",
        label: "关于我",
        visible: true,
      },
      {
        key: "skills",
        label: "专业技能",
        visible: true,
      },
    );
    document.displayConfig.sectionOrder.push("about", "skills");

    const { container } = render(<ResumePreview document={document} />);
    const preview = container.querySelector("#resume-preview");
    const title = screen.getByRole("heading", { name: "关于我" });
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
    // 专业技能已下线：即使旧数据里仍声明该 section，也不再渲染
    expect(
      screen.queryByRole("heading", { name: "专业技能" }),
    ).not.toBeInTheDocument();
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
          entries: [
            { period: "2022–2026", details: "本科" },
          ],
        },
        {
          school: "清华大学",
          entries: [
            { period: "2026–2029", details: "硕士" },
          ],
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

  it("renders the photo inside a header-sized frame", () => {
    const document = structuredClone(initial.document);
    document.displayConfig.photo = {
      showPhoto: true,
      photoData: "data:image/png;base64,iVBORw0KGgo=",
    };

    render(<ResumePreview document={document} />);

    const frame = screen.getByTestId("resume-photo-frame");
    const image = screen.getByRole("img", { name: "个人照片" });

    // On small screens the frame is a fixed 128px box; on sm+ it collapses to
    // zero intrinsic height and stretches to fill the header row (min-h-full),
    // so the photo never dictates the header's height.
    expect(frame).toHaveClass(
      "resume-photo-frame",
      "overflow-hidden",
      "h-32",
      "sm:h-0",
      "sm:min-h-full",
      "sm:self-auto",
    );
    expect(frame).not.toHaveClass("sm:h-40");
    // 打印时用 !important 强制 frame 收缩到 128px，撤销 min-h-full，撤销 stretch，并强制 overflow-hidden 防止 image 溢出
    expect(frame).toHaveClass("print:!h-32");
    expect(frame).toHaveClass("print:!min-h-0");
    expect(frame).toHaveClass("print:!self-start");
    expect(frame).toHaveClass("print:!overflow-hidden");
    expect(image).toHaveClass(
      "resume-photo-image",
      "h-full",
      "w-auto",
      "object-contain",
    );
  });
});

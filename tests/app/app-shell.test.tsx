import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app/app-shell";
import { AppTopbarPortal } from "@/components/app/app-topbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/resumes/resume-a",
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("application shell", () => {
  it("keeps the primary sidebar around the resume editor route", () => {
    render(
      <AppShell account={<span>Jackson</span>}>
        <div>三栏简历编辑器</div>
      </AppShell>,
    );

    expect(
      screen.getByRole("navigation", { name: "主要导航" }),
    ).toBeInTheDocument();
    expect(screen.getByText("三栏简历编辑器")).toBeInTheDocument();
  });

  it("aligns a persistent page toolbar with the sidebar brand area", async () => {
    render(
      <AppShell account={<span>Jackson</span>}>
        <AppTopbarPortal>
          <button type="button">页面操作</button>
        </AppTopbarPortal>
        <div>页面内容</div>
      </AppShell>,
    );

    const toolbar = await screen.findByRole("button", {
      name: "页面操作",
    });
    const appHeader = toolbar.closest("header");
    const brandLink = screen.getByRole("link", {
      name: "SAYLESS 首页",
    });
    const brandArea = brandLink.parentElement;

    expect(appHeader).toHaveClass("h-16", "border-b");
    expect(appHeader).not.toHaveClass("lg:hidden");
    expect(brandArea).toHaveClass("h-16", "border-b");
  });
});

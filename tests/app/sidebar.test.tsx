import {
  cleanup,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SidebarAccountClient } from "@/components/app/sidebar-account-client";
import {
  NAV_ITEMS,
  Sidebar,
} from "@/components/app/sidebar";

afterEach(cleanup);

describe("SAYLESS application sidebar", () => {
  it("renders the approved Chinese navigation order", () => {
    render(
      <Sidebar
        account={
          <div>
            <p>Jackson</p>
            <p>jackson@example.com</p>
          </div>
        }
      />,
    );

    const navigation = screen.getByRole("navigation", {
      name: "主要导航",
    });
    expect(
      within(navigation)
        .getAllByRole("link")
        .map((link) => link.textContent?.trim()),
    ).toEqual([
      "简历",
      "投递",
      "面试",
      "题库",
      "公司",
      "批次",
    ]);
  });

  it("keeps batches in the same navigation group below companies", () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      "简历",
      "投递",
      "面试",
      "题库",
      "公司",
      "批次",
    ]);
  });

  it("shows a login action instead of account actions for guests", () => {
    render(
      <Sidebar
        account={<a href="/login">登录后开始记录</a>}
      />,
    );

    expect(
      screen.getByRole("link", { name: "登录后开始记录" }),
    ).toHaveAttribute("href", "/login");
    expect(
      screen.queryByRole("button", { name: "退出" }),
    ).not.toBeInTheDocument();
  });

  it("collapses to labeled icons with tooltip navigation", () => {
    render(
      <Sidebar
        account={<span>Jackson</span>}
        collapsed
      />,
    );

    expect(
      within(screen.getByRole("navigation", { name: "主要导航" }))
        .getByRole("link", { name: "简历" }),
    ).toHaveAttribute("href", "/resumes");
    expect(
      screen.queryByRole("separator", { name: "调整侧栏宽度" }),
    ).not.toBeInTheDocument();
  });

  it("uses the personal information row as the only account action", () => {
    render(
      <SidebarAccountClient
        user={{ name: "Jackson", email: "jackson@example.com" }}
      />,
    );

    expect(
      screen.getByRole("link", {
        name: "打开 Jackson 的个人设置",
      }),
    ).toHaveAttribute("href", "/settings");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("退出")).not.toBeInTheDocument();
    expect(screen.queryByText("设置")).not.toBeInTheDocument();
  });
});

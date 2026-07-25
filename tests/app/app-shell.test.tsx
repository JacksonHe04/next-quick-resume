import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app/app-shell";

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
});

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  NAV_ITEMS,
  Sidebar,
} from "@/components/app/sidebar";

describe("SAYLESS application sidebar", () => {
  it("renders the approved Chinese navigation order", () => {
    render(
      <Sidebar
        user={{ name: "Jackson", email: "jackson@example.com" }}
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
      "SAYLESS",
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
      "SAYLESS",
      "简历",
      "投递",
      "面试",
      "题库",
      "公司",
      "批次",
    ]);
  });
});

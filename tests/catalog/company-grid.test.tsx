import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompanyGrid } from "@/components/catalog/company-grid";

describe("CompanyGrid", () => {
  it("renders only the official companies supplied by the directory", () => {
    render(
      <CompanyGrid
        companies={[
          {
            id: "official-a",
            name: "OpenAI",
            logoUrl: null,
            websiteUrl: "https://openai.com",
            careersUrl: "https://openai.com/careers",
            processUrl: "https://openai.com/careers/applications",
            industry: "人工智能",
            priority: "Top",
            cities: ["San Francisco"],
            submissionCount: 3,
          },
        ]}
      />,
    );

    expect(screen.getByText("OpenAI")).toBeVisible();
    expect(screen.queryByText("Private Co")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "查看 OpenAI 招聘页面" }),
    ).toHaveAttribute("href", "https://openai.com/careers");
    expect(
      screen.getByRole("link", { name: "查看 OpenAI 投递进度" }),
    ).toHaveAttribute(
      "href",
      "https://openai.com/careers/applications",
    );
    expect(screen.getByText("San Francisco")).toBeVisible();
    expect(screen.getByText("3 条投递")).toBeVisible();
  });
});

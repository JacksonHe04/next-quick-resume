import { describe, expect, it } from "vitest";

import { safePostAuthPath } from "@/modules/auth/navigation";

describe("post-auth navigation", () => {
  it("accepts internal application routes", () => {
    expect(
      safePostAuthPath("/submissions?status=interview"),
    ).toBe("/submissions?status=interview");
    expect(safePostAuthPath("/resumes")).toBe("/resumes");
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(safePostAuthPath("https://example.com")).toBe("/resumes");
    expect(safePostAuthPath("//example.com")).toBe("/resumes");
  });

  it("rejects public routes to avoid redirect loops", () => {
    expect(safePostAuthPath("/login")).toBe("/resumes");
    expect(safePostAuthPath("/register")).toBe("/resumes");
    expect(safePostAuthPath("/intro")).toBe("/resumes");
    expect(safePostAuthPath("/sso/start")).toBe("/resumes");
  });

  it("defaults to resumes for missing value", () => {
    expect(safePostAuthPath(undefined)).toBe("/resumes");
    expect(safePostAuthPath("")).toBe("/resumes");
  });
});

import { describe, expect, it } from "vitest";

import { safePostAuthPath } from "@/modules/auth/navigation";

describe("post-auth navigation", () => {
  it("accepts internal application routes", () => {
    expect(
      safePostAuthPath("/app/submissions?status=interview"),
    ).toBe("/app/submissions?status=interview");
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(safePostAuthPath("https://example.com")).toBe("/app");
    expect(safePostAuthPath("//example.com")).toBe("/app");
  });
});

import { describe, expect, it } from "vitest";

describe("SAYLESS project", () => {
  it("runs tests in the isolated test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});

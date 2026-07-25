import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("SAYLESS project", () => {
  it("runs tests in the isolated test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });

  it("points local development at the production Cloudflare gateway", () => {
    const environmentTemplate = readFileSync(".env.example", "utf8");
    const packageJson = readFileSync("package.json", "utf8");

    expect(environmentTemplate).toContain(
      "D1_GATEWAY_URL=https://sayless-api.yingyingdontkill.workers.dev",
    );
    expect(packageJson).not.toContain('"dev:worker"');
  });
});

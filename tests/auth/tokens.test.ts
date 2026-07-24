import { describe, expect, it } from "vitest";

import {
  createOpaqueToken,
  hashOpaqueToken,
} from "@/modules/auth/tokens";

describe("opaque tokens", () => {
  it("creates URL-safe tokens with a one-way storage hash", async () => {
    const rawToken = createOpaqueToken();
    const tokenHash = await hashOpaqueToken(rawToken);

    expect(rawToken).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(tokenHash).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(tokenHash).not.toContain(rawToken);
    expect(await hashOpaqueToken(rawToken)).toBe(tokenHash);
  });
});

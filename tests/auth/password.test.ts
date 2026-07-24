import { describe, expect, it } from "vitest";

import {
  hashPassword,
  verifyPassword,
} from "@/modules/auth/password";

describe("password hashing", () => {
  it("verifies only the original password", async () => {
    const encoded = await hashPassword("Correct horse battery staple");

    await expect(
      verifyPassword("Correct horse battery staple", encoded),
    ).resolves.toBe(true);
    await expect(verifyPassword("incorrect", encoded)).resolves.toBe(false);
  });

  it("uses an independent random salt for every password", async () => {
    const first = await hashPassword("same password");
    const second = await hashPassword("same password");

    expect(first).not.toBe(second);
    await expect(verifyPassword("same password", first)).resolves.toBe(true);
    await expect(verifyPassword("same password", second)).resolves.toBe(true);
  });

  it("rejects malformed stored hashes without throwing", async () => {
    await expect(verifyPassword("password", "invalid")).resolves.toBe(false);
  });
});

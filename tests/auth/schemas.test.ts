import { describe, expect, it } from "vitest";

import {
  loginInputSchema,
  registerInputSchema,
  requestVerificationCodeInputSchema,
} from "@/modules/auth/schemas";

describe("authentication input schemas", () => {
  it("normalizes email addresses before authentication", () => {
    expect(
      requestVerificationCodeInputSchema.parse({
        email: "  Jackson@Example.COM ",
      }),
    ).toEqual({ email: "jackson@example.com" });
  });

  it("accepts an 8-character password and explains shorter passwords", () => {
    const valid = registerInputSchema.safeParse({
      email: "jackson@example.com",
      code: "123456",
      password: "12345678",
      name: "Jackson",
    });
    const tooShort = registerInputSchema.safeParse({
      email: "jackson@example.com",
      code: "123456",
      password: "1234567",
      name: "Jackson",
    });

    expect(valid.success).toBe(true);
    expect(tooShort.success).toBe(false);
    if (!tooShort.success) {
      expect(tooShort.error.flatten().fieldErrors.password).toEqual([
        "密码至少需要 8 个字符",
      ]);
    }
  });

  it("does not alter the submitted password during login", () => {
    expect(
      loginInputSchema.parse({
        email: " Jackson@Example.com ",
        password: "  exact password  ",
      }),
    ).toEqual({
      email: "jackson@example.com",
      password: "  exact password  ",
    });
  });
});

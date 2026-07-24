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

  it("requires a verified registration code and a strong password", () => {
    const valid = registerInputSchema.safeParse({
      email: "jackson@example.com",
      code: "123456",
      password: "long enough password",
      name: "Jackson",
    });
    const weak = registerInputSchema.safeParse({
      email: "jackson@example.com",
      code: "123456",
      password: "short",
      name: "Jackson",
    });

    expect(valid.success).toBe(true);
    expect(weak.success).toBe(false);
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

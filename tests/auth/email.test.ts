import { describe, expect, it } from "vitest";

import { createResendEmail } from "@/modules/auth/email";

describe("Resend authentication email adapter", () => {
  it("sends a branded verification email with the six-digit code", async () => {
    const payloads: Array<Record<string, unknown>> = [];
    const email = createResendEmail(
      {
        async send(payload) {
          payloads.push(payload);
          return { data: { id: "email-a" }, error: null };
        },
      },
      "SAYLESS <hello@sayless.app>",
      "https://sayless.inon.space",
    );

    await email.sendVerificationCode({
      to: "jackson@example.com",
      code: "123456",
    });

    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({
      from: "SAYLESS <hello@sayless.app>",
      to: ["jackson@example.com"],
      subject: "你的 SAYLESS 注册验证码",
    });
    expect(payloads[0].html).toContain("123456");
    expect(payloads[0].html).toMatch(/logo-180\.png/);
  });

  it("surfaces a Resend API error instead of reporting success", async () => {
    const email = createResendEmail(
      {
        async send() {
          return {
            data: null,
            error: { name: "validation_error", message: "invalid sender" },
          };
        },
      },
      "SAYLESS <hello@sayless.app>",
      "https://sayless.inon.space",
    );

    await expect(
      email.sendVerificationCode({
        to: "jackson@example.com",
        code: "123456",
      }),
    ).rejects.toThrow("invalid sender");
  });
});

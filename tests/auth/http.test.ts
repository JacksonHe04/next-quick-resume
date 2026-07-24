import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AuthError } from "@/modules/auth/errors";
import {
  authErrorResponse,
  readJson,
  sessionCookieOptions,
} from "@/modules/auth/http";

describe("authentication HTTP helpers", () => {
  it("parses JSON through the supplied schema", async () => {
    const request = new Request("https://sayless.app/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "USER@EXAMPLE.COM" }),
    });

    await expect(
      readJson(
        request,
        z.object({ email: z.string().toLowerCase().email() }),
      ),
    ).resolves.toEqual({ email: "user@example.com" });
  });

  it("maps known authentication failures without leaking internals", async () => {
    const response = authErrorResponse(
      new AuthError("RATE_LIMITED", "验证码请求过于频繁，请稍后再试"),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "验证码请求过于频繁，请稍后再试",
      },
    });
  });

  it("uses an HTTP-only same-site session cookie", () => {
    expect(
      sessionCookieOptions(
        new Date("2026-08-25T00:00:00.000Z"),
        true,
      ),
    ).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  });
});

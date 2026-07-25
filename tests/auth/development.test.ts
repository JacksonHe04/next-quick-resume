import { describe, expect, it } from "vitest";

import { getDevelopmentLoginCredentials } from "@/modules/auth/development";

describe("development login configuration", () => {
  it("enables credentials only in development with both values present", () => {
    expect(
      getDevelopmentLoginCredentials({
        NODE_ENV: "development",
        SAYLESS_DEV_LOGIN_EMAIL: "jackson@example.com",
        SAYLESS_DEV_LOGIN_PASSWORD: "local-password",
      }),
    ).toEqual({
      email: "jackson@example.com",
      password: "local-password",
    });

    expect(
      getDevelopmentLoginCredentials({
        NODE_ENV: "production",
        SAYLESS_DEV_LOGIN_EMAIL: "jackson@example.com",
        SAYLESS_DEV_LOGIN_PASSWORD: "local-password",
      }),
    ).toBeNull();
    expect(
      getDevelopmentLoginCredentials({
        NODE_ENV: "development",
        SAYLESS_DEV_LOGIN_EMAIL: "jackson@example.com",
      }),
    ).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { getDevelopmentSession } from "@/modules/auth/development";

describe("development session override", () => {
  it("is disabled outside development", () => {
    expect(
      getDevelopmentSession({
        NODE_ENV: "production",
        SAYLESS_DEV_USER_EMAIL: "jackson@example.com",
      }),
    ).toBeNull();
  });

  it("synthesizes an admin SAYLESS session from configured values in development", () => {
    const session = getDevelopmentSession({
      NODE_ENV: "development",
      SAYLESS_DEV_USER_ID: "dev-1",
      SAYLESS_DEV_USER_EMAIL: "Jackson@Example.com",
      SAYLESS_DEV_USER_NAME: "Jackson",
    });
    expect(session).not.toBeNull();
    expect(session?.email).toBe("jackson@example.com");
    expect(session?.id).toBe("dev-1");
    expect(session?.project).toBe("sayless");
    expect(session?.projectRole).toBe("admin");
    expect(session?.emailVerified).toBe(true);
  });

  it("falls back to the local Jackson identity by default in development", () => {
    const session = getDevelopmentSession({ NODE_ENV: "development" });
    expect(session?.email).toBe("yingyingdontkill@gmail.com");
    expect(session?.username).toBe("Jackson");
  });
});

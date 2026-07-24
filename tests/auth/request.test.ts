import { describe, expect, it } from "vitest";

import {
  authenticateRequest,
  readRequestCookie,
} from "@/modules/auth/request";
import { hashOpaqueToken } from "@/modules/auth/tokens";

describe("request authentication", () => {
  it("reads an encoded cookie value without confusing similarly named cookies", () => {
    const request = new Request("https://sayless.app/api/auth/me", {
      headers: {
        cookie: "sayless_session_old=no; sayless_session=raw%3Dtoken",
      },
    });

    expect(readRequestCookie(request, "sayless_session")).toBe("raw=token");
  });

  it("resolves both the session and its active user", async () => {
    const rawToken = "raw-session-token";
    const tokenHash = await hashOpaqueToken(rawToken);
    const now = new Date("2026-07-25T00:00:00.000Z");
    const user = {
      id: "user-a",
      email: "jackson@example.com",
      passwordHash: "hash",
      name: "Jackson",
      emailVerifiedAt: now,
      disabledAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const session = {
      id: "session-a",
      userId: user.id,
      tokenHash,
      expiresAt: new Date(now.getTime() + 60_000),
      createdAt: now,
      lastSeenAt: now,
    };
    const repository = {
      async findByTokenHash(hash: string) {
        return hash === tokenHash ? session : null;
      },
      async deleteById() {},
      async findUserById(id: string) {
        return id === user.id ? user : null;
      },
    };
    const request = new Request("https://sayless.app/api/auth/me", {
      headers: { cookie: `sayless_session=${rawToken}` },
    });

    await expect(
      authenticateRequest(repository, request, now),
    ).resolves.toEqual({ session, user });
  });
});

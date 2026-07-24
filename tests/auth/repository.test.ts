import { drizzle } from "drizzle-orm/d1";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import { createAuthRepository } from "@/modules/auth/repository";
import type {
  PasswordResetRecord,
  UserRecord,
  VerificationCodeRecord,
} from "@/modules/auth/service";
import type { SessionRecord } from "@/modules/auth/session";
import { createTestD1Binding } from "@/tests/db/d1-test-binding";

describe("D1 authentication repository", () => {
  let close: () => void;
  let repository: ReturnType<typeof createAuthRepository>;

  beforeEach(() => {
    const testDatabase = createTestD1Binding();
    close = testDatabase.close;
    repository = createAuthRepository(
      drizzle(testDatabase.binding, { schema }),
    );
  });

  afterEach(() => {
    close();
  });

  it("persists, finds, counts, and removes verification codes", async () => {
    const now = new Date("2026-07-25T00:00:00.000Z");
    const code: VerificationCodeRecord = {
      id: "code-a",
      email: "jackson@example.com",
      codeHash: "hash",
      expiresAt: new Date(now.getTime() + 60_000),
      attemptCount: 0,
      consumedAt: null,
      createdAt: now,
    };

    await repository.insertVerificationCode(code);

    await expect(
      repository.countVerificationCodesSince(
        code.email,
        new Date(now.getTime() - 1),
      ),
    ).resolves.toBe(1);
    await expect(
      repository.findActiveVerificationCode(code.email, now),
    ).resolves.toEqual(code);
    await repository.deleteVerificationCode(code.id);
    await expect(
      repository.findActiveVerificationCode(code.email, now),
    ).resolves.toBeNull();
  });

  it("atomically consumes a code while creating the user and preferences", async () => {
    const now = new Date("2026-07-25T00:00:00.000Z");
    const code: VerificationCodeRecord = {
      id: "code-a",
      email: "jackson@example.com",
      codeHash: "hash",
      expiresAt: new Date(now.getTime() + 60_000),
      attemptCount: 0,
      consumedAt: null,
      createdAt: now,
    };
    const user: UserRecord = {
      id: "user-a",
      email: code.email,
      passwordHash: "password-hash",
      name: "Jackson",
      emailVerifiedAt: now,
      disabledAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await repository.insertVerificationCode(code);

    await repository.consumeCodeAndCreateUser({
      codeId: code.id,
      user,
      now,
    });

    await expect(repository.findUserByEmail(user.email)).resolves.toEqual(user);
    await expect(
      repository.findActiveVerificationCode(user.email, now),
    ).resolves.toBeNull();
  });

  it("implements the session repository without exposing raw tokens", async () => {
    const now = new Date("2026-07-25T00:00:00.000Z");
    const user: UserRecord = {
      id: "user-a",
      email: "jackson@example.com",
      passwordHash: "password-hash",
      name: "Jackson",
      emailVerifiedAt: now,
      disabledAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const code: VerificationCodeRecord = {
      id: "code-a",
      email: user.email,
      codeHash: "hash",
      expiresAt: new Date(now.getTime() + 60_000),
      attemptCount: 0,
      consumedAt: null,
      createdAt: now,
    };
    await repository.insertVerificationCode(code);
    await repository.consumeCodeAndCreateUser({
      codeId: code.id,
      user,
      now,
    });
    const session: SessionRecord = {
      id: "session-a",
      userId: user.id,
      tokenHash: "token-hash",
      expiresAt: new Date(now.getTime() + 60_000),
      createdAt: now,
      lastSeenAt: now,
    };

    await repository.insert(session);
    await expect(repository.findByTokenHash(session.tokenHash)).resolves.toEqual(
      session,
    );
    await repository.deleteById(session.id);
    await expect(
      repository.findByTokenHash(session.tokenHash),
    ).resolves.toBeNull();
  });

  it("consumes a reset token, changes the password, and revokes sessions atomically", async () => {
    const now = new Date("2026-07-25T00:00:00.000Z");
    const user: UserRecord = {
      id: "user-a",
      email: "jackson@example.com",
      passwordHash: "old-password-hash",
      name: "Jackson",
      emailVerifiedAt: now,
      disabledAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const code: VerificationCodeRecord = {
      id: "code-a",
      email: user.email,
      codeHash: "code-hash",
      expiresAt: new Date(now.getTime() + 60_000),
      attemptCount: 0,
      consumedAt: null,
      createdAt: now,
    };
    const resetToken: PasswordResetRecord = {
      id: "reset-a",
      userId: user.id,
      tokenHash: "reset-token-hash",
      expiresAt: new Date(now.getTime() + 60_000),
      consumedAt: null,
      createdAt: now,
    };
    await repository.insertVerificationCode(code);
    await repository.consumeCodeAndCreateUser({ codeId: code.id, user, now });
    await repository.insert({
      id: "session-a",
      userId: user.id,
      tokenHash: "session-token-hash",
      expiresAt: resetToken.expiresAt,
      createdAt: now,
      lastSeenAt: now,
    });
    await repository.insertPasswordResetToken(resetToken);

    await expect(
      repository.findActivePasswordResetToken(resetToken.tokenHash, now),
    ).resolves.toEqual(resetToken);
    await repository.resetPasswordAndRevokeSessions({
      tokenId: resetToken.id,
      userId: user.id,
      passwordHash: "new-password-hash",
      now,
    });

    await expect(
      repository.findActivePasswordResetToken(resetToken.tokenHash, now),
    ).resolves.toBeNull();
    await expect(
      repository.findByTokenHash("session-token-hash"),
    ).resolves.toBeNull();
    await expect(repository.findUserByEmail(user.email)).resolves.toMatchObject({
      passwordHash: "new-password-hash",
    });
  });
});

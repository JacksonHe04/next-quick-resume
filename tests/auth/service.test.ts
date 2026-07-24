import { describe, expect, it } from "vitest";

import {
  login,
  registerAccount,
  requestRegistrationCode,
  requestPasswordReset,
  resetPassword,
  type AuthRepository,
  type PasswordResetRecord,
  type TransactionalEmail,
  type UserRecord,
  type VerificationCodeRecord,
} from "@/modules/auth/service";
import type {
  SessionRecord,
} from "@/modules/auth/session";

class MemoryAuthRepository implements AuthRepository {
  users = new Map<string, UserRecord>();
  codes: VerificationCodeRecord[] = [];
  sessions = new Map<string, SessionRecord>();
  passwordResetTokens: PasswordResetRecord[] = [];

  async findUserByEmail(email: string) {
    return (
      [...this.users.values()].find((user) => user.email === email) ?? null
    );
  }

  async findUserById(id: string) {
    return this.users.get(id) ?? null;
  }

  async countVerificationCodesSince(email: string, since: Date) {
    return this.codes.filter(
      (code) => code.email === email && code.createdAt >= since,
    ).length;
  }

  async insertVerificationCode(record: VerificationCodeRecord) {
    this.codes.push(record);
  }

  async deleteVerificationCode(id: string) {
    this.codes = this.codes.filter((record) => record.id !== id);
  }

  async findActiveVerificationCode(email: string, now: Date) {
    return (
      this.codes
        .filter(
          (code) =>
            code.email === email &&
            !code.consumedAt &&
            code.expiresAt > now,
        )
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0] ??
      null
    );
  }

  async incrementVerificationAttempts(id: string) {
    const record = this.codes.find((code) => code.id === id);
    if (record) record.attemptCount += 1;
  }

  async consumeCodeAndCreateUser(input: {
    codeId: string;
    user: UserRecord;
    now: Date;
  }) {
    const code = this.codes.find((record) => record.id === input.codeId);
    if (!code || code.consumedAt) throw new Error("code unavailable");
    code.consumedAt = input.now;
    this.users.set(input.user.id, input.user);
  }

  async insert(record: SessionRecord) {
    this.sessions.set(record.tokenHash, record);
  }

  async findByTokenHash(tokenHash: string) {
    return this.sessions.get(tokenHash) ?? null;
  }

  async deleteById(id: string) {
    for (const [hash, record] of this.sessions) {
      if (record.id === id) this.sessions.delete(hash);
    }
  }

  async insertPasswordResetToken(record: PasswordResetRecord) {
    this.passwordResetTokens.push(record);
  }

  async deletePasswordResetToken(id: string) {
    this.passwordResetTokens = this.passwordResetTokens.filter(
      (record) => record.id !== id,
    );
  }

  async findActivePasswordResetToken(tokenHash: string, currentTime: Date) {
    return (
      this.passwordResetTokens.find(
        (record) =>
          record.tokenHash === tokenHash &&
          !record.consumedAt &&
          record.expiresAt > currentTime,
      ) ?? null
    );
  }

  async resetPasswordAndRevokeSessions(input: {
    tokenId: string;
    userId: string;
    passwordHash: string;
    now: Date;
  }) {
    const token = this.passwordResetTokens.find(
      (record) => record.id === input.tokenId,
    );
    const user = this.users.get(input.userId);
    if (!token || token.consumedAt || !user) {
      throw new Error("reset unavailable");
    }
    token.consumedAt = input.now;
    user.passwordHash = input.passwordHash;
    user.updatedAt = input.now;
    for (const [hash, session] of this.sessions) {
      if (session.userId === input.userId) this.sessions.delete(hash);
    }
  }
}

class CapturingEmail implements TransactionalEmail {
  verificationEmails: Array<{ to: string; code: string }> = [];
  passwordResetEmails: Array<{ to: string; url: string }> = [];

  async sendVerificationCode(input: { to: string; code: string }) {
    this.verificationEmails.push(input);
  }

  async sendPasswordReset(input: { to: string; url: string }) {
    this.passwordResetEmails.push(input);
  }
}

const secret = "test-secret-with-more-than-thirty-two-characters";
const now = new Date("2026-07-25T00:00:00.000Z");

describe("authentication service", () => {
  it("emails the raw verification code but persists only a keyed hash", async () => {
    const repository = new MemoryAuthRepository();
    const email = new CapturingEmail();

    await requestRegistrationCode(
      { repository, email, secret },
      { email: "jackson@example.com" },
      now,
    );

    const sentCode = email.verificationEmails[0].code;
    expect(sentCode).toMatch(/^\d{6}$/u);
    expect(repository.codes[0].codeHash).not.toContain(sentCode);
  });

  it("registers with the verified code and creates a usable session", async () => {
    const repository = new MemoryAuthRepository();
    const email = new CapturingEmail();
    await requestRegistrationCode(
      { repository, email, secret },
      { email: "jackson@example.com" },
      now,
    );

    const result = await registerAccount(
      { repository, secret },
      {
        email: "jackson@example.com",
        code: email.verificationEmails[0].code,
        password: "Correct horse battery staple",
        name: "Jackson",
      },
      now,
    );

    expect(result.user).toMatchObject({
      email: "jackson@example.com",
      name: "Jackson",
    });
    expect(result.rawToken).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(repository.codes[0].consumedAt).toEqual(now);
    expect(repository.sessions.size).toBe(1);
  });

  it("increments attempts and refuses an incorrect verification code", async () => {
    const repository = new MemoryAuthRepository();
    const email = new CapturingEmail();
    await requestRegistrationCode(
      { repository, email, secret },
      { email: "jackson@example.com" },
      now,
    );

    await expect(
      registerAccount(
        { repository, secret },
        {
          email: "jackson@example.com",
          code: "000000",
          password: "Correct horse battery staple",
          name: "Jackson",
        },
        now,
      ),
    ).rejects.toMatchObject({ code: "INVALID_VERIFICATION_CODE" });
    expect(repository.codes[0].attemptCount).toBe(1);
    expect(repository.users.size).toBe(0);
  });

  it("logs in only when the password matches", async () => {
    const repository = new MemoryAuthRepository();
    const email = new CapturingEmail();
    await requestRegistrationCode(
      { repository, email, secret },
      { email: "jackson@example.com" },
      now,
    );
    await registerAccount(
      { repository, secret },
      {
        email: "jackson@example.com",
        code: email.verificationEmails[0].code,
        password: "Correct horse battery staple",
        name: "Jackson",
      },
      now,
    );

    await expect(
      login(
        { repository },
        {
          email: "jackson@example.com",
          password: "Correct horse battery staple",
        },
        now,
      ),
    ).resolves.toMatchObject({ user: { email: "jackson@example.com" } });
    await expect(
      login(
        { repository },
        { email: "jackson@example.com", password: "incorrect" },
        now,
      ),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("does not reveal whether a password reset account exists", async () => {
    const repository = new MemoryAuthRepository();
    const email = new CapturingEmail();

    await expect(
      requestPasswordReset(
        { repository, email, appUrl: "https://sayless.app" },
        { email: "missing@example.com" },
        now,
      ),
    ).resolves.toBeUndefined();
    expect(email.passwordResetEmails).toHaveLength(0);
    expect(repository.passwordResetTokens).toHaveLength(0);
  });

  it("emails a raw reset token while persisting only its hash", async () => {
    const repository = new MemoryAuthRepository();
    const email = new CapturingEmail();
    await createRegisteredUser(repository, email);

    await requestPasswordReset(
      { repository, email, appUrl: "https://sayless.app/" },
      { email: "jackson@example.com" },
      now,
    );

    const url = new URL(email.passwordResetEmails[0].url);
    const rawToken = url.searchParams.get("token");
    expect(url.origin + url.pathname).toBe(
      "https://sayless.app/reset-password",
    );
    expect(rawToken).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(repository.passwordResetTokens[0].tokenHash).not.toBe(rawToken);
  });

  it("changes the password and revokes existing sessions after reset", async () => {
    const repository = new MemoryAuthRepository();
    const email = new CapturingEmail();
    await createRegisteredUser(repository, email);
    await requestPasswordReset(
      { repository, email, appUrl: "https://sayless.app" },
      { email: "jackson@example.com" },
      now,
    );
    const resetUrl = new URL(email.passwordResetEmails[0].url);
    const rawToken = resetUrl.searchParams.get("token")!;

    await resetPassword(
      { repository },
      { token: rawToken, password: "A completely new secure password" },
      now,
    );

    expect(repository.sessions.size).toBe(0);
    await expect(
      login(
        { repository },
        {
          email: "jackson@example.com",
          password: "A completely new secure password",
        },
        now,
      ),
    ).resolves.toMatchObject({ user: { email: "jackson@example.com" } });
    await expect(
      resetPassword(
        { repository },
        { token: rawToken, password: "Another secure password" },
        now,
      ),
    ).rejects.toMatchObject({ code: "INVALID_RESET_TOKEN" });
  });
});

async function createRegisteredUser(
  repository: MemoryAuthRepository,
  email: CapturingEmail,
) {
  await requestRegistrationCode(
    { repository, email, secret },
    { email: "jackson@example.com" },
    now,
  );
  return registerAccount(
    { repository, secret },
    {
      email: "jackson@example.com",
      code: email.verificationEmails.at(-1)!.code,
      password: "Correct horse battery staple",
      name: "Jackson",
    },
    now,
  );
}

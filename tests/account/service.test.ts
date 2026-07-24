import { describe, expect, it } from "vitest";

import {
  changePassword,
  deleteAccount,
  updateProfile,
  type AccountRepository,
  type AccountUser,
} from "@/modules/account/service";
import { hashPassword, verifyPassword } from "@/modules/auth/password";

class MemoryAccountRepository implements AccountRepository {
  user: AccountUser | null;
  sessionCount = 2;

  constructor(user: AccountUser) {
    this.user = user;
  }

  async findUserById(id: string) {
    return this.user?.id === id ? this.user : null;
  }

  async updateName(userId: string, name: string, now: Date) {
    if (!this.user || this.user.id !== userId) throw new Error("missing");
    this.user.name = name;
    this.user.updatedAt = now;
  }

  async updatePasswordAndRevokeSessions(
    userId: string,
    passwordHash: string,
    now: Date,
  ) {
    if (!this.user || this.user.id !== userId) throw new Error("missing");
    this.user.passwordHash = passwordHash;
    this.user.updatedAt = now;
    this.sessionCount = 0;
  }

  async deleteUser(userId: string) {
    if (this.user?.id === userId) this.user = null;
  }
}

async function fixture() {
  const now = new Date("2026-07-25T00:00:00.000Z");
  const repository = new MemoryAccountRepository({
    id: "user-a",
    email: "jackson@example.com",
    name: "Jackson",
    passwordHash: await hashPassword("Correct horse battery staple"),
    disabledAt: null,
    emailVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  return { repository, now };
}

describe("account service", () => {
  it("updates the display name without mutating account identity", async () => {
    const { repository, now } = await fixture();

    await updateProfile(repository, "user-a", { name: "  Yingying  " }, now);

    expect(repository.user).toMatchObject({
      id: "user-a",
      email: "jackson@example.com",
      name: "Yingying",
    });
  });

  it("requires the current password before changing it and revokes sessions", async () => {
    const { repository, now } = await fixture();

    await expect(
      changePassword(
        repository,
        "user-a",
        {
          currentPassword: "wrong password",
          newPassword: "A completely new secure password",
        },
        now,
      ),
    ).rejects.toMatchObject({ code: "INVALID_CURRENT_PASSWORD" });

    await changePassword(
      repository,
      "user-a",
      {
        currentPassword: "Correct horse battery staple",
        newPassword: "A completely new secure password",
      },
      now,
    );
    expect(repository.sessionCount).toBe(0);
    expect(
      await verifyPassword(
        "A completely new secure password",
        repository.user!.passwordHash,
      ),
    ).toBe(true);
  });

  it("deletes the account only after password confirmation", async () => {
    const { repository } = await fixture();

    await expect(
      deleteAccount(repository, "user-a", {
        password: "wrong password",
      }),
    ).rejects.toMatchObject({ code: "INVALID_CURRENT_PASSWORD" });
    expect(repository.user).not.toBeNull();

    await deleteAccount(repository, "user-a", {
      password: "Correct horse battery staple",
    });
    expect(repository.user).toBeNull();
  });
});

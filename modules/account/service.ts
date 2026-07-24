import {
  changePasswordInputSchema,
  deleteAccountInputSchema,
  updateProfileInputSchema,
} from "@/modules/account/schemas";
import {
  hashPassword,
  verifyPassword,
} from "@/modules/auth/password";
import type { UserRecord } from "@/modules/auth/service";

export type AccountUser = UserRecord;

export type AccountErrorCode =
  | "ACCOUNT_NOT_FOUND"
  | "INVALID_CURRENT_PASSWORD";

export class AccountError extends Error {
  constructor(
    public readonly code: AccountErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AccountError";
  }
}

export interface AccountRepository {
  findUserById(id: string): Promise<AccountUser | null>;
  updateName(userId: string, name: string, now: Date): Promise<void>;
  updatePasswordAndRevokeSessions(
    userId: string,
    passwordHash: string,
    now: Date,
  ): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

async function requireUser(
  repository: AccountRepository,
  userId: string,
): Promise<AccountUser> {
  const user = await repository.findUserById(userId);
  if (!user) {
    throw new AccountError("ACCOUNT_NOT_FOUND", "账户不存在");
  }
  return user;
}

async function requireCurrentPassword(
  repository: AccountRepository,
  userId: string,
  password: string,
): Promise<AccountUser> {
  const user = await requireUser(repository, userId);
  if (!(await verifyPassword(password, user.passwordHash))) {
    throw new AccountError(
      "INVALID_CURRENT_PASSWORD",
      "当前密码不正确",
    );
  }
  return user;
}

export async function updateProfile(
  repository: AccountRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<void> {
  const parsed = updateProfileInputSchema.parse(input);
  await requireUser(repository, userId);
  await repository.updateName(userId, parsed.name, now);
}

export async function changePassword(
  repository: AccountRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<void> {
  const parsed = changePasswordInputSchema.parse(input);
  await requireCurrentPassword(
    repository,
    userId,
    parsed.currentPassword,
  );
  await repository.updatePasswordAndRevokeSessions(
    userId,
    await hashPassword(parsed.newPassword),
    now,
  );
}

export async function deleteAccount(
  repository: AccountRepository,
  userId: string,
  input: unknown,
): Promise<void> {
  const parsed = deleteAccountInputSchema.parse(input);
  await requireCurrentPassword(repository, userId, parsed.password);
  await repository.deleteUser(userId);
}

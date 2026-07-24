import { AuthError } from "@/modules/auth/errors";
import { hashPassword, verifyPassword } from "@/modules/auth/password";
import type { LoginInput, RegisterInput } from "@/modules/auth/schemas";
import {
  createSession,
  type SessionRepository,
} from "@/modules/auth/session";
import {
  createOpaqueToken,
  hashOpaqueToken,
} from "@/modules/auth/tokens";
import {
  hashKeyedValue,
  verifyKeyedValue,
} from "@/modules/auth/secrets";

const VERIFICATION_CODE_LIMIT = 3;
const VERIFICATION_CODE_WINDOW_MS = 10 * 60 * 1_000;
const VERIFICATION_CODE_LIFETIME_MS = 10 * 60 * 1_000;
const VERIFICATION_CODE_MAX_ATTEMPTS = 5;
const PASSWORD_RESET_LIFETIME_MS = 60 * 60 * 1_000;
const VERIFICATION_CODE_SPACE = 1_000_000;
const UINT32_SPACE = 2 ** 32;
const MAX_UNBIASED_UINT32 =
  Math.floor(UINT32_SPACE / VERIFICATION_CODE_SPACE) *
  VERIFICATION_CODE_SPACE;

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  emailVerifiedAt: Date;
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type VerificationCodeRecord = {
  id: string;
  email: string;
  codeHash: string;
  expiresAt: Date;
  attemptCount: number;
  consumedAt: Date | null;
  createdAt: Date;
};

export type PasswordResetRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
};

export interface AuthRepository extends SessionRepository {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  countVerificationCodesSince(email: string, since: Date): Promise<number>;
  insertVerificationCode(record: VerificationCodeRecord): Promise<void>;
  deleteVerificationCode(id: string): Promise<void>;
  findActiveVerificationCode(
    email: string,
    now: Date,
  ): Promise<VerificationCodeRecord | null>;
  incrementVerificationAttempts(id: string): Promise<void>;
  consumeCodeAndCreateUser(input: {
    codeId: string;
    user: UserRecord;
    now: Date;
  }): Promise<void>;
  insertPasswordResetToken(record: PasswordResetRecord): Promise<void>;
  deletePasswordResetToken(id: string): Promise<void>;
  findActivePasswordResetToken(
    tokenHash: string,
    now: Date,
  ): Promise<PasswordResetRecord | null>;
  resetPasswordAndRevokeSessions(input: {
    tokenId: string;
    userId: string;
    passwordHash: string;
    now: Date;
  }): Promise<void>;
}

export interface TransactionalEmail {
  sendVerificationCode(input: {
    to: string;
    code: string;
  }): Promise<void>;
  sendPasswordReset(input: {
    to: string;
    url: string;
  }): Promise<void>;
}

type RegistrationCodeDependencies = {
  repository: AuthRepository;
  email: TransactionalEmail;
  secret: string;
};

type AccountDependencies = {
  repository: AuthRepository;
  secret: string;
};

function createVerificationCode(): string {
  const values = new Uint32Array(1);
  let value: number;

  do {
    crypto.getRandomValues(values);
    value = values[0];
  } while (value >= MAX_UNBIASED_UINT32);

  return (value % VERIFICATION_CODE_SPACE).toString().padStart(6, "0");
}

export async function requestRegistrationCode(
  dependencies: RegistrationCodeDependencies,
  input: { email: string },
  now = new Date(),
): Promise<void> {
  if (await dependencies.repository.findUserByEmail(input.email)) {
    throw new AuthError(
      "EMAIL_ALREADY_REGISTERED",
      "该邮箱已经注册，请直接登录",
    );
  }

  const recentCount =
    await dependencies.repository.countVerificationCodesSince(
      input.email,
      new Date(now.getTime() - VERIFICATION_CODE_WINDOW_MS),
    );
  if (recentCount >= VERIFICATION_CODE_LIMIT) {
    throw new AuthError("RATE_LIMITED", "验证码请求过于频繁，请稍后再试");
  }

  const code = createVerificationCode();
  const record: VerificationCodeRecord = {
    id: crypto.randomUUID(),
    email: input.email,
    codeHash: await hashKeyedValue(code, dependencies.secret),
    expiresAt: new Date(now.getTime() + VERIFICATION_CODE_LIFETIME_MS),
    attemptCount: 0,
    consumedAt: null,
    createdAt: now,
  };

  await dependencies.repository.insertVerificationCode(record);

  try {
    await dependencies.email.sendVerificationCode({
      to: input.email,
      code,
    });
  } catch {
    await dependencies.repository.deleteVerificationCode(record.id);
    throw new AuthError(
      "EMAIL_DELIVERY_FAILED",
      "验证码邮件发送失败，请稍后重试",
    );
  }
}

export async function registerAccount(
  dependencies: AccountDependencies,
  input: RegisterInput,
  now = new Date(),
): Promise<{ user: UserRecord; rawToken: string; expiresAt: Date }> {
  if (await dependencies.repository.findUserByEmail(input.email)) {
    throw new AuthError(
      "EMAIL_ALREADY_REGISTERED",
      "该邮箱已经注册，请直接登录",
    );
  }

  const verificationCode =
    await dependencies.repository.findActiveVerificationCode(
      input.email,
      now,
    );
  const verified =
    verificationCode &&
    verificationCode.attemptCount < VERIFICATION_CODE_MAX_ATTEMPTS &&
    (await verifyKeyedValue(
      input.code,
      verificationCode.codeHash,
      dependencies.secret,
    ));

  if (!verificationCode || !verified) {
    if (verificationCode) {
      await dependencies.repository.incrementVerificationAttempts(
        verificationCode.id,
      );
    }
    throw new AuthError(
      "INVALID_VERIFICATION_CODE",
      "验证码无效或已过期",
    );
  }

  const user: UserRecord = {
    id: crypto.randomUUID(),
    email: input.email,
    passwordHash: await hashPassword(input.password),
    name: input.name,
    emailVerifiedAt: now,
    disabledAt: null,
    createdAt: now,
    updatedAt: now,
  };
  await dependencies.repository.consumeCodeAndCreateUser({
    codeId: verificationCode.id,
    user,
    now,
  });
  const session = await createSession(dependencies.repository, user.id, now);

  return { user, ...session };
}

export async function login(
  dependencies: { repository: AuthRepository },
  input: LoginInput,
  now = new Date(),
): Promise<{ user: UserRecord; rawToken: string; expiresAt: Date }> {
  const user = await dependencies.repository.findUserByEmail(input.email);
  const valid =
    user &&
    !user.disabledAt &&
    (await verifyPassword(input.password, user.passwordHash));

  if (!user || !valid) {
    throw new AuthError("INVALID_CREDENTIALS", "邮箱或密码错误");
  }

  const session = await createSession(dependencies.repository, user.id, now);
  return { user, ...session };
}

export async function requestPasswordReset(
  dependencies: {
    repository: AuthRepository;
    email: TransactionalEmail;
    appUrl: string;
  },
  input: { email: string },
  now = new Date(),
): Promise<void> {
  const user = await dependencies.repository.findUserByEmail(input.email);

  // Password reset requests deliberately return the same result for unknown
  // accounts so callers cannot enumerate registered email addresses.
  if (!user || user.disabledAt) return;

  const rawToken = createOpaqueToken();
  const record: PasswordResetRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: await hashOpaqueToken(rawToken),
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_LIFETIME_MS),
    consumedAt: null,
    createdAt: now,
  };
  await dependencies.repository.insertPasswordResetToken(record);

  const url = new URL("/reset-password", dependencies.appUrl);
  url.searchParams.set("token", rawToken);

  try {
    await dependencies.email.sendPasswordReset({
      to: user.email,
      url: url.toString(),
    });
  } catch {
    await dependencies.repository.deletePasswordResetToken(record.id);
    throw new AuthError(
      "EMAIL_DELIVERY_FAILED",
      "密码重置邮件发送失败，请稍后重试",
    );
  }
}

export async function resetPassword(
  dependencies: { repository: AuthRepository },
  input: { token: string; password: string },
  now = new Date(),
): Promise<void> {
  const token = await dependencies.repository.findActivePasswordResetToken(
    await hashOpaqueToken(input.token),
    now,
  );
  if (!token) {
    throw new AuthError("INVALID_RESET_TOKEN", "密码重置链接无效或已过期");
  }

  await dependencies.repository.resetPasswordAndRevokeSessions({
    tokenId: token.id,
    userId: token.userId,
    passwordHash: await hashPassword(input.password),
    now,
  });
}

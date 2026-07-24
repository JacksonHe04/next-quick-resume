import {
  and,
  count,
  desc,
  eq,
  gt,
  gte,
  isNull,
  sql,
} from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  emailVerificationCodes,
  passwordResetTokens,
  sessions,
  userPreferences,
  users,
} from "@/db/schema";
import type {
  AuthRepository,
  PasswordResetRecord,
  UserRecord,
  VerificationCodeRecord,
} from "@/modules/auth/service";
import type { SessionRecord } from "@/modules/auth/session";

type Database = DrizzleD1Database<typeof schema>;

export function createAuthRepository(database: Database): AuthRepository {
  return {
    async findUserByEmail(email) {
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return (user as UserRecord | undefined) ?? null;
    },

    async findUserById(id) {
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return (user as UserRecord | undefined) ?? null;
    },

    async countVerificationCodesSince(email, since) {
      const [result] = await database
        .select({ value: count() })
        .from(emailVerificationCodes)
        .where(
          and(
            eq(emailVerificationCodes.email, email),
            gte(emailVerificationCodes.createdAt, since),
          ),
        );

      return result?.value ?? 0;
    },

    async insertVerificationCode(record) {
      await database.insert(emailVerificationCodes).values(record).run();
    },

    async deleteVerificationCode(id) {
      await database
        .delete(emailVerificationCodes)
        .where(eq(emailVerificationCodes.id, id))
        .run();
    },

    async findActiveVerificationCode(email, now) {
      const [record] = await database
        .select()
        .from(emailVerificationCodes)
        .where(
          and(
            eq(emailVerificationCodes.email, email),
            isNull(emailVerificationCodes.consumedAt),
            gt(emailVerificationCodes.expiresAt, now),
          ),
        )
        .orderBy(desc(emailVerificationCodes.createdAt))
        .limit(1);

      return (record as VerificationCodeRecord | undefined) ?? null;
    },

    async incrementVerificationAttempts(id) {
      await database
        .update(emailVerificationCodes)
        .set({
          attemptCount: sql`${emailVerificationCodes.attemptCount} + 1`,
        })
        .where(eq(emailVerificationCodes.id, id))
        .run();
    },

    async consumeCodeAndCreateUser({ codeId, user, now }) {
      await database.batch([
        database
          .update(emailVerificationCodes)
          .set({ consumedAt: now })
          .where(
            and(
              eq(emailVerificationCodes.id, codeId),
              isNull(emailVerificationCodes.consumedAt),
            ),
          ),
        database.insert(users).values(user),
        database.insert(userPreferences).values({
          userId: user.id,
          currentBatchId: null,
          timezone: "Asia/Singapore",
          createdAt: now,
          updatedAt: now,
        }),
      ]);
    },

    async insertPasswordResetToken(record) {
      await database.insert(passwordResetTokens).values(record).run();
    },

    async deletePasswordResetToken(id) {
      await database
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, id))
        .run();
    },

    async findActivePasswordResetToken(tokenHash, now) {
      const [record] = await database
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.tokenHash, tokenHash),
            isNull(passwordResetTokens.consumedAt),
            gt(passwordResetTokens.expiresAt, now),
          ),
        )
        .limit(1);

      return (record as PasswordResetRecord | undefined) ?? null;
    },

    async resetPasswordAndRevokeSessions({
      tokenId,
      userId,
      passwordHash,
      now,
    }) {
      await database.batch([
        database
          .update(passwordResetTokens)
          .set({ consumedAt: now })
          .where(
            and(
              eq(passwordResetTokens.id, tokenId),
              isNull(passwordResetTokens.consumedAt),
            ),
          ),
        database
          .update(users)
          .set({ passwordHash, updatedAt: now })
          .where(eq(users.id, userId)),
        database.delete(sessions).where(eq(sessions.userId, userId)),
      ]);
    },

    async insert(record: SessionRecord) {
      await database.insert(sessions).values(record).run();
    },

    async findByTokenHash(tokenHash) {
      const [record] = await database
        .select()
        .from(sessions)
        .where(eq(sessions.tokenHash, tokenHash))
        .limit(1);

      return (record as SessionRecord | undefined) ?? null;
    },

    async deleteById(id) {
      await database.delete(sessions).where(eq(sessions.id, id)).run();
    },
  };
}

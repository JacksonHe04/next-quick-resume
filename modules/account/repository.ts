import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import { sessions, users } from "@/db/schema";
import type {
  AccountRepository,
  AccountUser,
} from "@/modules/account/service";

type Database = DrizzleD1Database<typeof schema>;

export function createAccountRepository(
  database: Database,
): AccountRepository {
  return {
    async findUserById(id) {
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return (user as AccountUser | undefined) ?? null;
    },

    async updateName(userId, name, now) {
      await database
        .update(users)
        .set({ name, updatedAt: now })
        .where(eq(users.id, userId))
        .run();
    },

    async updatePasswordAndRevokeSessions(
      userId,
      passwordHash,
      now,
    ) {
      await database.batch([
        database
          .update(users)
          .set({ passwordHash, updatedAt: now })
          .where(eq(users.id, userId)),
        database.delete(sessions).where(eq(sessions.userId, userId)),
      ]);
    },

    async deleteUser(userId) {
      await database.delete(users).where(eq(users.id, userId)).run();
    },
  };
}

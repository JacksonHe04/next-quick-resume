import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import { userPreferences, users } from "@/db/schema";
import {
  InonIdentityLinkError,
  resolveInonProjectUser,
} from "@/modules/auth/inon-user";
import { createTestD1Binding } from "@/tests/db/d1-test-binding";

describe("iNon identity mapping", () => {
  let close: () => void;
  let database: ReturnType<typeof drizzle<typeof schema>>;

  beforeEach(() => {
    const testDatabase = createTestD1Binding();
    close = testDatabase.close;
    database = drizzle(testDatabase.binding, { schema });
  });

  afterEach(() => {
    close();
  });

  it("links a verified central identity to the legacy email owner", async () => {
    const createdAt = new Date("2026-07-01T00:00:00.000Z");
    await database.insert(users).values({
      id: "legacy-user",
      email: "owner@example.com",
      passwordHash: "legacy-password-hash",
      name: "Legacy Name",
      emailVerifiedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
    });

    const user = await resolveInonProjectUser(
      database,
      {
        id: "inon-user",
        email: "OWNER@example.com",
        emailVerified: true,
        username: "统一名称",
      },
      new Date("2026-07-26T00:00:00.000Z"),
    );

    expect(user).toMatchObject({
      id: "legacy-user",
      inonUserId: "inon-user",
      email: "owner@example.com",
      name: "统一名称",
      passwordHash: "legacy-password-hash",
    });
  });

  it("creates one local owner and preferences for a new verified identity", async () => {
    const user = await resolveInonProjectUser(database, {
      id: "inon-new-user",
      email: "new@example.com",
      emailVerified: true,
      username: null,
    });

    expect(user).toMatchObject({
      inonUserId: "inon-new-user",
      email: "new@example.com",
      name: "new",
    });
    await expect(
      database
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, user.id)),
    ).resolves.toHaveLength(1);
  });

  it("never migrates local data from an unverified central email", async () => {
    await expect(
      resolveInonProjectUser(database, {
        id: "inon-user",
        email: "owner@example.com",
        emailVerified: false,
        username: null,
      }),
    ).rejects.toBeInstanceOf(InonIdentityLinkError);
  });
});

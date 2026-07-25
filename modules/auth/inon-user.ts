import { and, eq, isNull } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import { userPreferences, users } from "@/db/schema";

type Database = DrizzleD1Database<typeof schema>;
type ProjectUser = typeof users.$inferSelect;

export type InonIdentityInput = {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
};

export class InonIdentityLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InonIdentityLinkError";
  }
}

const SSO_MANAGED_PASSWORD_HASH = "!inon-sso-managed!";

function normalizedEmail(email: string): string {
  return email.trim().toLowerCase();
}

function identityName(
  identity: InonIdentityInput,
  fallback?: string,
): string {
  return (
    identity.username?.trim() ||
    fallback ||
    normalizedEmail(identity.email).split("@")[0] ||
    "iNon user"
  );
}

async function findByInonUserId(
  database: Database,
  inonUserId: string,
): Promise<ProjectUser | null> {
  const [user] = await database
    .select()
    .from(users)
    .where(eq(users.inonUserId, inonUserId))
    .limit(1);
  return user ?? null;
}

async function findByEmail(
  database: Database,
  email: string,
): Promise<ProjectUser | null> {
  const [user] = await database
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

async function synchronizeLinkedUser(
  database: Database,
  user: ProjectUser,
  identity: InonIdentityInput,
  now: Date,
): Promise<ProjectUser> {
  const email = normalizedEmail(identity.email);
  const name = identityName(identity, user.name);
  if (user.email === email && user.name === name) {
    return user;
  }

  await database
    .update(users)
    .set({ email, name, updatedAt: now })
    .where(eq(users.id, user.id))
    .run();

  return { ...user, email, name, updatedAt: now };
}

async function linkLegacyUser(
  database: Database,
  user: ProjectUser,
  identity: InonIdentityInput,
  now: Date,
): Promise<ProjectUser> {
  if (user.inonUserId && user.inonUserId !== identity.id) {
    throw new InonIdentityLinkError(
      "This SAYLESS user is linked to another iNon account.",
    );
  }

  const name = identityName(identity, user.name);
  await database
    .update(users)
    .set({
      inonUserId: identity.id,
      name,
      emailVerifiedAt: now,
      updatedAt: now,
    })
    .where(and(eq(users.id, user.id), isNull(users.inonUserId)))
    .run();

  const linked = await findByInonUserId(database, identity.id);
  if (linked) {
    return linked;
  }

  const current = await findByEmail(database, user.email);
  if (current?.inonUserId && current.inonUserId !== identity.id) {
    throw new InonIdentityLinkError(
      "This SAYLESS user was linked concurrently to another iNon account.",
    );
  }

  throw new InonIdentityLinkError(
    "The SAYLESS user could not be linked to the iNon account.",
  );
}

async function createProjectUser(
  database: Database,
  identity: InonIdentityInput,
  now: Date,
): Promise<ProjectUser> {
  const user: typeof users.$inferInsert = {
    id: crypto.randomUUID(),
    inonUserId: identity.id,
    email: normalizedEmail(identity.email),
    passwordHash: SSO_MANAGED_PASSWORD_HASH,
    name: identityName(identity),
    emailVerifiedAt: now,
    disabledAt: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await database.batch([
      database.insert(users).values(user),
      database.insert(userPreferences).values({
        userId: user.id,
        currentBatchId: null,
        timezone: "Asia/Singapore",
        createdAt: now,
        updatedAt: now,
      }),
    ]);
  } catch (error) {
    const linked = await findByInonUserId(database, identity.id);
    if (linked) {
      return linked;
    }
    throw error;
  }

  const created = await findByInonUserId(database, identity.id);
  if (!created) {
    throw new InonIdentityLinkError(
      "The SAYLESS user was not created for the iNon account.",
    );
  }
  return created;
}

export async function resolveInonProjectUser(
  database: Database,
  identity: InonIdentityInput,
  now = new Date(),
): Promise<ProjectUser> {
  if (!identity.emailVerified) {
    throw new InonIdentityLinkError(
      "A verified iNon email is required to enter SAYLESS.",
    );
  }

  const linked = await findByInonUserId(database, identity.id);
  if (linked) {
    return synchronizeLinkedUser(database, linked, identity, now);
  }

  const legacy = await findByEmail(
    database,
    normalizedEmail(identity.email),
  );
  if (legacy) {
    return linkLegacyUser(database, legacy, identity, now);
  }

  return createProjectUser(database, identity, now);
}

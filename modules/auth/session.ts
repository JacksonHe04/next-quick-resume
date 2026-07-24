import {
  createOpaqueToken,
  hashOpaqueToken,
} from "@/modules/auth/tokens";

export const SESSION_COOKIE_NAME = "sayless_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1_000;

export type SessionRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  lastSeenAt: Date;
};

export interface SessionRepository {
  insert(record: SessionRecord): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  deleteById(id: string): Promise<void>;
}

export async function createSession(
  repository: SessionRepository,
  userId: string,
  now = new Date(),
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = createOpaqueToken();
  const tokenHash = await hashOpaqueToken(rawToken);
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  await repository.insert({
    id: crypto.randomUUID(),
    userId,
    tokenHash,
    expiresAt,
    createdAt: now,
    lastSeenAt: now,
  });

  return { rawToken, expiresAt };
}

export async function resolveSession(
  repository: Pick<SessionRepository, "findByTokenHash" | "deleteById">,
  rawToken: string,
  now = new Date(),
): Promise<SessionRecord | null> {
  const record = await repository.findByTokenHash(
    await hashOpaqueToken(rawToken),
  );

  if (!record) return null;

  if (record.expiresAt.getTime() <= now.getTime()) {
    await repository.deleteById(record.id);
    return null;
  }

  return record;
}

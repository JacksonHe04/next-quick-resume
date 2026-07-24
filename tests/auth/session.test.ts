import { describe, expect, it } from "vitest";

import {
  SESSION_DURATION_MS,
  createSession,
  resolveSession,
  type SessionRecord,
  type SessionRepository,
} from "@/modules/auth/session";

class MemorySessionRepository implements SessionRepository {
  records = new Map<string, SessionRecord>();

  async insert(record: SessionRecord) {
    this.records.set(record.tokenHash, record);
  }

  async findByTokenHash(tokenHash: string) {
    return this.records.get(tokenHash) ?? null;
  }

  async deleteById(id: string) {
    for (const [hash, record] of this.records) {
      if (record.id === id) this.records.delete(hash);
    }
  }
}

describe("session service", () => {
  it("returns a raw token while persisting only its hash", async () => {
    const repository = new MemorySessionRepository();
    const now = new Date("2026-07-25T00:00:00.000Z");

    const created = await createSession(repository, "user-a", now);
    const persisted = [...repository.records.values()][0];

    expect(persisted.userId).toBe("user-a");
    expect(persisted.tokenHash).not.toContain(created.rawToken);
    expect(persisted.expiresAt.getTime()).toBe(
      now.getTime() + SESSION_DURATION_MS,
    );
  });

  it("resolves an active token and rejects an expired token", async () => {
    const repository = new MemorySessionRepository();
    const now = new Date("2026-07-25T00:00:00.000Z");
    const active = await createSession(repository, "user-a", now);

    await expect(
      resolveSession(repository, active.rawToken, now),
    ).resolves.toMatchObject({ userId: "user-a" });
    await expect(
      resolveSession(
        repository,
        active.rawToken,
        new Date(now.getTime() + SESSION_DURATION_MS + 1),
      ),
    ).resolves.toBeNull();
    expect(repository.records.size).toBe(0);
  });
});

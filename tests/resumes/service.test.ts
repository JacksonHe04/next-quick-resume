import { describe, expect, it } from "vitest";

import {
  cloneResume,
  createResume,
  getPublicResume,
  saveResume,
  setResumePublic,
  type ResumeRecord,
  type ResumeRepository,
} from "@/modules/resumes/service";

class MemoryResumeRepository implements ResumeRepository {
  records = new Map<string, ResumeRecord>();

  async find(userId: string, id: string) {
    const record = this.records.get(id);
    return record?.userId === userId ? record : null;
  }

  async findPublicById(id: string) {
    const record = this.records.get(id);
    return record?.isPublic ? record : null;
  }

  async insert(record: ResumeRecord) {
    this.records.set(record.id, record);
  }

  async updateIfVersion(
    userId: string,
    id: string,
    expectedVersion: number,
    changes: Partial<ResumeRecord>,
  ) {
    const record = await this.find(userId, id);
    if (!record || record.version !== expectedVersion) return false;
    Object.assign(record, changes);
    return true;
  }

  async setShareEnabled(userId: string, id: string, isPublic: boolean, now: Date) {
    const record = await this.find(userId, id);
    if (!record) return false;
    record.isPublic = isPublic;
    record.updatedAt = now;
    return true;
  }

  async delete(userId: string, id: string) {
    const record = await this.find(userId, id);
    if (record) this.records.delete(id);
  }
}

const now = new Date("2026-07-25T00:00:00.000Z");
const document = {
  schemaVersion: 1 as const,
  data: {
    header: {
      name: "Jackson",
      contact: { phone: "", email: "jackson@example.com" },
      jobInfo: {},
    },
  },
  displayConfig: {
    sections: [
      { key: "header" as const, label: "基本信息", visible: true },
    ],
    sectionOrder: ["header" as const],
    headerAlignment: "left" as const,
    photo: { showPhoto: false },
  },
};

describe("resume service", () => {
  it("rejects saving an outdated resume version", async () => {
    const repository = new MemoryResumeRepository();
    const created = await createResume(
      repository,
      "user-a",
      { name: "产品简历", document },
      now,
    );

    const saved = await saveResume(
      repository,
      "user-a",
      {
        id: created.id,
        version: 1,
        name: "产品简历 V2",
        document,
      },
      now,
    );

    await expect(
      saveResume(
        repository,
        "user-a",
        {
          id: created.id,
          version: 1,
          name: "过期草稿",
          document,
        },
        now,
      ),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(saved.version).toBe(2);
  });

  it("clones a resume into an independent version-one record", async () => {
    const repository = new MemoryResumeRepository();
    const original = await createResume(
      repository,
      "user-a",
      { name: "通用简历", document },
      now,
    );

    const cloned = await cloneResume(
      repository,
      "user-a",
      original.id,
      now,
    );

    expect(cloned).toMatchObject({
      name: "通用简历（副本）",
      version: 1,
      isPublic: false,
    });
    expect(cloned.id).not.toBe(original.id);
  });

  it("toggles public sharing and exposes the resume without a user", async () => {
    const repository = new MemoryResumeRepository();
    const created = await createResume(
      repository,
      "user-a",
      { name: "通用简历", document },
      now,
    );

    await expect(
      getPublicResume(repository, created.id),
    ).rejects.toMatchObject({ code: "RESUME_NOT_PUBLIC" });

    const shared = await setResumePublic(
      repository,
      "user-a",
      created.id,
      true,
      now,
    );
    expect(shared).toMatchObject({ isPublic: true });

    const publicResume = await getPublicResume(repository, created.id);
    expect(publicResume).toMatchObject({
      id: created.id,
      isPublic: true,
    });

    await setResumePublic(repository, "user-a", created.id, false, now);
    await expect(
      getPublicResume(repository, created.id),
    ).rejects.toMatchObject({ code: "RESUME_NOT_PUBLIC" });
  });

  it("cannot share another user's resume", async () => {
    const repository = new MemoryResumeRepository();
    const created = await createResume(
      repository,
      "user-a",
      { name: "通用简历", document },
      now,
    );

    await expect(
      setResumePublic(repository, "user-b", created.id, true, now),
    ).rejects.toMatchObject({ code: "RESUME_NOT_FOUND" });
  });
});

import { describe, expect, it } from "vitest";

import {
  createResume,
  deleteResume,
  getPublicResume,
  saveResume,
  setResumePublic,
  uploadResumePhoto,
  type ResumeGuestScope,
  type ResumeRecord,
  type ResumeRepository,
} from "@/modules/resumes/service";

class MemoryResumeRepository implements ResumeRepository {
  records = new Map<string, ResumeRecord>();
  photos = new Map<string, string>();

  async find(userId: string, id: string, scope: ResumeGuestScope = null) {
    const record = this.records.get(id);
    if (!record || record.userId !== userId) return null;
    // scope=null 只命中登录用户自己的行（guest_device_id IS NULL）
    if (scope) {
      return record.guestDeviceId === scope.guestDeviceId ? record : null;
    }
    return record.guestDeviceId === null ? record : null;
  }

  async findPublicById(id: string) {
    const record = this.records.get(id);
    return record?.isPublic ? record : null;
  }

  async insert(record: ResumeRecord) {
    this.records.set(record.id, record);
  }

  async savePhoto(resumeId: string, photoData: string, _now: Date) {
    this.photos.set(resumeId, photoData);
  }

  async updateIfVersion(
    userId: string,
    id: string,
    expectedVersion: number,
    changes: Partial<ResumeRecord>,
    scope: ResumeGuestScope = null,
  ) {
    const record = await this.find(userId, id, scope);
    if (!record || record.version !== expectedVersion) return false;
    Object.assign(record, changes);
    return true;
  }

  async setShareEnabled(
    userId: string,
    id: string,
    isPublic: boolean,
    now: Date,
    scope: ResumeGuestScope = null,
  ) {
    const record = await this.find(userId, id, scope);
    if (!record) return false;
    record.isPublic = isPublic;
    record.updatedAt = now;
    return true;
  }

  async delete(userId: string, id: string, scope: ResumeGuestScope = null) {
    const record = await this.find(userId, id, scope);
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

  it("stores photo data separately and keeps it out of the persisted document", async () => {
    const repository = new MemoryResumeRepository();
    const created = await createResume(
      repository,
      "user-a",
      { name: "通用简历", document },
      now,
    );

    const withPhoto = {
      ...document,
      displayConfig: {
        ...document.displayConfig,
        photo: { showPhoto: true, photoData: "data:image/jpeg;base64,AAAA" },
      },
    };
    const saved = await saveResume(
      repository,
      "user-a",
      {
        id: created.id,
        version: 1,
        name: "通用简历",
        document: withPhoto,
      },
      now,
    );

    expect(repository.photos.get(created.id)).toBe(
      "data:image/jpeg;base64,AAAA",
    );
    expect(saved.document.displayConfig.photo).toEqual({
      showPhoto: true,
      photoData: undefined,
    });
  });

  it("uploads a photo only for an owned resume and caps its size", async () => {
    const repository = new MemoryResumeRepository();
    const created = await createResume(
      repository,
      "user-a",
      { name: "通用简历", document },
      now,
    );

    await uploadResumePhoto(
      repository,
      "user-a",
      created.id,
      "data:image/jpeg;base64,BBBB",
      now,
    );
    expect(repository.photos.get(created.id)).toBe(
      "data:image/jpeg;base64,BBBB",
    );

    await expect(
      uploadResumePhoto(repository, "user-b", created.id, "data:x", now),
    ).rejects.toMatchObject({ code: "RESUME_NOT_FOUND" });

    await expect(
      uploadResumePhoto(
        repository,
        "user-a",
        created.id,
        "x".repeat(900_000),
        now,
      ),
    ).rejects.toMatchObject({ code: "INVALID_PHOTO" });
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

  it("isolates guest resumes per device id", async () => {
    const repository = new MemoryResumeRepository();
    const created = await createResume(
      repository,
      "demo-user",
      { name: "访客A简历", document },
      now,
      "device-a",
    );
    expect(created.guestDeviceId).toBe("device-a");

    // 设备 A 能按自己的 id 读到记录
    expect(
      (
        await repository.find("demo-user", created.id, {
          guestDeviceId: "device-a",
        })
      )?.id,
    ).toBe(created.id);

    // 其他设备与登录用户（scope=null）都读不到
    expect(
      await repository.find("demo-user", created.id, {
        guestDeviceId: "device-b",
      }),
    ).toBeNull();
    expect(await repository.find("demo-user", created.id)).toBeNull();

    // 设备 B 保存 / 删除均视为不存在
    await expect(
      saveResume(
        repository,
        "demo-user",
        { id: created.id, version: 1, name: "越权草稿", document },
        now,
        { guestDeviceId: "device-b" },
      ),
    ).rejects.toMatchObject({ code: "RESUME_NOT_FOUND" });
    await expect(
      deleteResume(repository, "demo-user", created.id, {
        guestDeviceId: "device-b",
      }),
    ).rejects.toMatchObject({ code: "RESUME_NOT_FOUND" });

    // 设备 A 正常续编并推进版本
    const saved = await saveResume(
      repository,
      "demo-user",
      { id: created.id, version: 1, name: "访客A简历V2", document },
      now,
      { guestDeviceId: "device-a" },
    );
    expect(saved).toMatchObject({ name: "访客A简历V2", version: 2 });
  });
});

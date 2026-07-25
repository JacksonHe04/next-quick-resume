import { describe, expect, it } from "vitest";

import * as catalogService from "@/modules/catalog/service";

const {
  createPrivateCatalogEntry,
  searchCatalog,
} = catalogService;
const renamePrivateCatalogEntry = (
  catalogService as typeof catalogService & {
    renamePrivateCatalogEntry(
      repository: CatalogRepository,
      userId: string,
      entity: CatalogEntity,
      id: string,
      input: unknown,
    ): Promise<void>;
  }
).renamePrivateCatalogEntry;
type CatalogEntity = catalogService.CatalogEntity;
type CatalogRepository = catalogService.CatalogRepository;
type CatalogRow = catalogService.CatalogRow;

class MemoryCatalogRepository implements CatalogRepository {
  official: Record<CatalogEntity, CatalogRow[]> = {
    company: [
      {
        id: "official-company-a",
        name: "OpenAI",
        normalizedName: "openai",
      },
    ],
    position: [
      {
        id: "official-position-a",
        name: "产品经理",
        normalizedName: "产品经理",
      },
    ],
  };
  private: Record<CatalogEntity, Array<CatalogRow & { userId: string }>> = {
    company: [],
    position: [],
  };

  async searchOfficial(entity: CatalogEntity, query: string) {
    return this.official[entity].filter((row) =>
      row.normalizedName.includes(query),
    );
  }

  async searchPrivate(
    entity: CatalogEntity,
    userId: string,
    query: string,
  ) {
    return this.private[entity].filter(
      (row) =>
        row.userId === userId &&
        row.normalizedName.includes(query),
    );
  }

  async findPrivateByNormalizedName(
    entity: CatalogEntity,
    userId: string,
    normalizedName: string,
  ) {
    return (
      this.private[entity].find(
        (row) =>
          row.userId === userId &&
          row.normalizedName === normalizedName,
      ) ?? null
    );
  }

  async insertPrivate(
    entity: CatalogEntity,
    row: CatalogRow & { userId: string },
  ) {
    this.private[entity].push(row);
  }

  async updatePrivate(
    entity: CatalogEntity,
    userId: string,
    id: string,
    changes: Pick<CatalogRow, "name" | "normalizedName">,
  ) {
    const row = this.private[entity].find(
      (item) => item.userId === userId && item.id === id,
    );
    if (!row) return false;
    Object.assign(row, changes);
    return true;
  }
}

describe("catalog service", () => {
  it("never exposes another user's private company in search", async () => {
    const repository = new MemoryCatalogRepository();
    await createPrivateCatalogEntry(repository, "user-a", "company", {
      name: "Private Co",
    });

    await expect(
      searchCatalog(repository, "user-b", "company", "Private"),
    ).resolves.toEqual([]);
    await expect(
      searchCatalog(repository, "user-a", "company", "Private"),
    ).resolves.toMatchObject([
      { source: "private", name: "Private Co" },
    ]);
  });

  it("combines active official results with only the current user's private fallback", async () => {
    const repository = new MemoryCatalogRepository();
    await createPrivateCatalogEntry(repository, "user-a", "company", {
      name: "OpenAI APAC",
    });

    await expect(
      searchCatalog(repository, "user-a", "company", "OPENAI"),
    ).resolves.toEqual([
      {
        source: "official",
        id: "official-company-a",
        name: "OpenAI",
      },
      {
        source: "private",
        id: expect.any(String),
        name: "OpenAI APAC",
      },
    ]);
  });

  it("reuses a user's existing normalized private entry", async () => {
    const repository = new MemoryCatalogRepository();
    const first = await createPrivateCatalogEntry(
      repository,
      "user-a",
      "position",
      { name: "  产品 运营 " },
    );
    const repeated = await createPrivateCatalogEntry(
      repository,
      "user-a",
      "position",
      { name: "产品  运营" },
    );

    expect(repeated).toEqual(first);
    expect(repository.private.position).toHaveLength(1);
  });

  it("allows only the owner to rename a private company", async () => {
    const repository = new MemoryCatalogRepository();
    const company = await createPrivateCatalogEntry(
      repository,
      "user-a",
      "company",
      { name: "Original Company" },
    );

    await expect(
      renamePrivateCatalogEntry(
        repository,
        "user-b",
        "company",
        company.id,
        { name: "Stolen Name" },
      ),
    ).rejects.toThrow("自定义公司不存在");

    await renamePrivateCatalogEntry(
      repository,
      "user-a",
      "company",
      company.id,
      { name: "Renamed Company" },
    );
    await expect(
      searchCatalog(repository, "user-a", "company", "renamed"),
    ).resolves.toMatchObject([
      { source: "private", name: "Renamed Company" },
    ]);
  });
});

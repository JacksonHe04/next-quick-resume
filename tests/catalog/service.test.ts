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
  it("returns only the official company directory regardless of private rows", async () => {
    const repository = new MemoryCatalogRepository();
    repository.private.company.push({
      id: "legacy-private-company",
      userId: "user-a",
      name: "Private Co",
      normalizedName: "private co",
    });

    await expect(
      searchCatalog(repository, "user-a", "company", ""),
    ).resolves.toEqual([
      {
        source: "official",
        id: "official-company-a",
        name: "OpenAI",
      },
    ]);
  });

  it("rejects creation of private companies", async () => {
    const repository = new MemoryCatalogRepository();

    await expect(
      createPrivateCatalogEntry(repository, "user-a", "company", {
        name: "OpenAI APAC",
      }),
    ).rejects.toThrow("公司只能从 SAYLESS 官方目录中选择");
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

  it("rejects renaming legacy private companies", async () => {
    const repository = new MemoryCatalogRepository();
    repository.private.company.push({
      id: "legacy-company",
      userId: "user-a",
      name: "Original Company",
      normalizedName: "original company",
    });

    await expect(
      renamePrivateCatalogEntry(
        repository,
        "user-a",
        "company",
        "legacy-company",
        { name: "Renamed Company" },
      ),
    ).rejects.toThrow("官方公司不支持个人修改");
  });
});

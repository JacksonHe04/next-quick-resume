import { describe, expect, it } from "vitest";

import {
  createPrivateCatalogEntry,
  searchCatalog,
  type CatalogEntity,
  type CatalogRepository,
  type CatalogRow,
} from "@/modules/catalog/service";

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
});

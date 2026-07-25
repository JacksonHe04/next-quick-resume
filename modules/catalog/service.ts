import {
  createPrivateCatalogInputSchema,
  renamePrivateCatalogInputSchema,
} from "@/modules/catalog/schemas";

export type CatalogEntity = "company" | "position";

export type CatalogRow = {
  id: string;
  name: string;
  normalizedName: string;
};

export type CatalogOption =
  | { source: "official"; id: string; name: string }
  | { source: "private"; id: string; name: string };

export interface CatalogRepository {
  searchOfficial(
    entity: CatalogEntity,
    normalizedQuery: string,
  ): Promise<CatalogRow[]>;
  searchPrivate(
    entity: CatalogEntity,
    userId: string,
    normalizedQuery: string,
  ): Promise<CatalogRow[]>;
  findPrivateByNormalizedName(
    entity: CatalogEntity,
    userId: string,
    normalizedName: string,
  ): Promise<CatalogRow | null>;
  insertPrivate(
    entity: CatalogEntity,
    row: CatalogRow & {
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    },
  ): Promise<void>;
  updatePrivate(
    entity: CatalogEntity,
    userId: string,
    id: string,
    changes: Pick<CatalogRow, "name" | "normalizedName"> & {
      updatedAt: Date;
    },
  ): Promise<boolean>;
}

export class CatalogError extends Error {
  constructor(
    public readonly code: "PRIVATE_CATALOG_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "CatalogError";
  }
}

export function normalizeCatalogName(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("zh-CN");
}

export async function searchCatalog(
  repository: CatalogRepository,
  userId: string,
  entity: CatalogEntity,
  query: string,
): Promise<CatalogOption[]> {
  const normalizedQuery = normalizeCatalogName(query);
  const [official, privateRows] = await Promise.all([
    repository.searchOfficial(entity, normalizedQuery),
    repository.searchPrivate(entity, userId, normalizedQuery),
  ]);

  return [
    ...official.map(({ id, name }) => ({
      source: "official" as const,
      id,
      name,
    })),
    ...privateRows.map(({ id, name }) => ({
      source: "private" as const,
      id,
      name,
    })),
  ];
}

export async function createPrivateCatalogEntry(
  repository: CatalogRepository,
  userId: string,
  entity: CatalogEntity,
  input: unknown,
  now = new Date(),
): Promise<CatalogOption> {
  const { name } = createPrivateCatalogInputSchema.parse(input);
  const normalizedName = normalizeCatalogName(name);
  const existing = await repository.findPrivateByNormalizedName(
    entity,
    userId,
    normalizedName,
  );
  if (existing) {
    return {
      source: "private",
      id: existing.id,
      name: existing.name,
    };
  }

  const row = {
    id: crypto.randomUUID(),
    userId,
    name: name.replace(/\s+/gu, " "),
    normalizedName,
    createdAt: now,
    updatedAt: now,
  };
  await repository.insertPrivate(entity, row);

  return { source: "private", id: row.id, name: row.name };
}

export async function renamePrivateCatalogEntry(
  repository: CatalogRepository,
  userId: string,
  entity: CatalogEntity,
  id: string,
  input: unknown,
  now = new Date(),
): Promise<void> {
  const { name } = renamePrivateCatalogInputSchema.parse(input);
  const saved = await repository.updatePrivate(entity, userId, id, {
    name: name.replace(/\s+/gu, " "),
    normalizedName: normalizeCatalogName(name),
    updatedAt: now,
  });
  if (!saved) {
    throw new CatalogError(
      "PRIVATE_CATALOG_NOT_FOUND",
      entity === "company"
        ? "自定义公司不存在"
        : "自定义岗位不存在",
    );
  }
}

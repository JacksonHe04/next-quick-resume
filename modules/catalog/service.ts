import {
  createPrivateCatalogInputSchema,
  renamePrivateCatalogInputSchema,
} from "@/modules/catalog/schemas";

export type CatalogEntity = "company" | "position";

export type CatalogRow = {
  id: string;
  name: string;
  normalizedName: string;
  careersUrl?: string | null;
  processUrl?: string | null;
};

export type CatalogOption =
  | {
      source: "official";
      id: string;
      name: string;
      careersUrl?: string | null;
      processUrl?: string | null;
    }
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
    public readonly code:
      | "PRIVATE_CATALOG_NOT_FOUND"
      | "COMPANY_OFFICIAL_ONLY",
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
  const official = await repository.searchOfficial(
    entity,
    normalizedQuery,
  );
  const privateRows =
    entity === "company"
      ? []
      : await repository.searchPrivate(
          entity,
          userId,
          normalizedQuery,
        );

  return [
    ...official.map(({ id, name, careersUrl, processUrl }) => ({
      source: "official" as const,
      id,
      name,
      careersUrl,
      processUrl,
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
  if (entity === "company") {
    throw new CatalogError(
      "COMPANY_OFFICIAL_ONLY",
      "公司只能从 SAYLESS 官方目录中选择",
    );
  }
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
  if (entity === "company") {
    throw new CatalogError(
      "COMPANY_OFFICIAL_ONLY",
      "官方公司不支持个人修改",
    );
  }
  const { name } = renamePrivateCatalogInputSchema.parse(input);
  const saved = await repository.updatePrivate(entity, userId, id, {
    name: name.replace(/\s+/gu, " "),
    normalizedName: normalizeCatalogName(name),
    updatedAt: now,
  });
  if (!saved) {
    throw new CatalogError(
      "PRIVATE_CATALOG_NOT_FOUND",
      "自定义岗位不存在",
    );
  }
}

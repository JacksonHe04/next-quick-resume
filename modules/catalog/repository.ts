import { and, asc, eq, like } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  officialCompanies,
  officialPositions,
  privateCompanies,
  privatePositions,
} from "@/db/schema";
import type {
  CatalogRepository,
  CatalogRow,
} from "@/modules/catalog/service";

type Database = DrizzleD1Database<typeof schema>;
const RESULT_LIMIT = 20;

export type OfficialCompany = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  careersUrl: string | null;
  industry: string | null;
};

export function createCatalogRepository(
  database: Database,
): CatalogRepository {
  return {
    async searchOfficial(entity, query) {
      const pattern = `%${query}%`;
      if (entity === "company") {
        return database
          .select({
            id: officialCompanies.id,
            name: officialCompanies.name,
            normalizedName: officialCompanies.normalizedName,
          })
          .from(officialCompanies)
          .where(
            and(
              eq(officialCompanies.isActive, true),
              like(officialCompanies.normalizedName, pattern),
            ),
          )
          .orderBy(asc(officialCompanies.name))
          .limit(RESULT_LIMIT);
      }
      return database
        .select({
          id: officialPositions.id,
          name: officialPositions.name,
          normalizedName: officialPositions.normalizedName,
        })
        .from(officialPositions)
        .where(
          and(
            eq(officialPositions.isActive, true),
            like(officialPositions.normalizedName, pattern),
          ),
        )
        .orderBy(
          asc(officialPositions.sortOrder),
          asc(officialPositions.name),
        )
        .limit(RESULT_LIMIT);
    },

    async searchPrivate(entity, userId, query) {
      const pattern = `%${query}%`;
      if (entity === "company") {
        return database
          .select({
            id: privateCompanies.id,
            name: privateCompanies.name,
            normalizedName: privateCompanies.normalizedName,
          })
          .from(privateCompanies)
          .where(
            and(
              eq(privateCompanies.userId, userId),
              like(privateCompanies.normalizedName, pattern),
            ),
          )
          .orderBy(asc(privateCompanies.name))
          .limit(RESULT_LIMIT);
      }
      return database
        .select({
          id: privatePositions.id,
          name: privatePositions.name,
          normalizedName: privatePositions.normalizedName,
        })
        .from(privatePositions)
        .where(
          and(
            eq(privatePositions.userId, userId),
            like(privatePositions.normalizedName, pattern),
          ),
        )
        .orderBy(asc(privatePositions.name))
        .limit(RESULT_LIMIT);
    },

    async findPrivateByNormalizedName(
      entity,
      userId,
      normalizedName,
    ) {
      if (entity === "company") {
        const [row] = await database
          .select({
            id: privateCompanies.id,
            name: privateCompanies.name,
            normalizedName: privateCompanies.normalizedName,
          })
          .from(privateCompanies)
          .where(
            and(
              eq(privateCompanies.userId, userId),
              eq(privateCompanies.normalizedName, normalizedName),
            ),
          )
          .limit(1);
        return (row as CatalogRow | undefined) ?? null;
      }
      const [row] = await database
        .select({
          id: privatePositions.id,
          name: privatePositions.name,
          normalizedName: privatePositions.normalizedName,
        })
        .from(privatePositions)
        .where(
          and(
            eq(privatePositions.userId, userId),
            eq(privatePositions.normalizedName, normalizedName),
          ),
        )
        .limit(1);
      return (row as CatalogRow | undefined) ?? null;
    },

    async insertPrivate(entity, row) {
      if (entity === "company") {
        await database.insert(privateCompanies).values(row).run();
        return;
      }
      await database.insert(privatePositions).values(row).run();
    },
  };
}

export async function listOfficialCompanies(
  database: Database,
): Promise<OfficialCompany[]> {
  return database
    .select({
      id: officialCompanies.id,
      name: officialCompanies.name,
      logoUrl: officialCompanies.logoUrl,
      websiteUrl: officialCompanies.websiteUrl,
      careersUrl: officialCompanies.careersUrl,
      industry: officialCompanies.industry,
    })
    .from(officialCompanies)
    .where(eq(officialCompanies.isActive, true))
    .orderBy(asc(officialCompanies.name));
}

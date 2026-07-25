import {
  and,
  asc,
  count,
  eq,
  like,
  sql,
} from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  companyCities,
  officialCities,
  officialCompanies,
  officialPositions,
  privateCompanies,
  privatePositions,
  submissions,
} from "@/db/schema";
import type {
  CatalogRepository,
  CatalogRow,
} from "@/modules/catalog/service";

type Database = DrizzleD1Database<typeof schema>;
const RESULT_LIMIT = 200;

function officialCompanyPriorityOrder() {
  return sql<number>`case ${officialCompanies.priority}
    when 'Top' then 0
    when 'Big' then 1
    when 'Hardware' then 2
    when 'AI' then 3
    when 'Middle' then 4
    when 'Foreign' then 5
    when 'State Owned' then 6
    when 'Starup' then 7
    when 'Other' then 8
    when 'Game' then 9
    else 10
  end`;
}

export type OfficialCompany = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  careersUrl: string | null;
  processUrl: string | null;
  industry: string | null;
  priority: string | null;
  cities: string[];
  submissionCount: number;
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
            careersUrl: officialCompanies.careersUrl,
            processUrl: officialCompanies.processUrl,
          })
          .from(officialCompanies)
          .where(
            and(
              eq(officialCompanies.isActive, true),
              like(officialCompanies.normalizedName, pattern),
            ),
          )
          .orderBy(
            officialCompanyPriorityOrder(),
            asc(officialCompanies.name),
          )
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

    async updatePrivate(entity, userId, id, changes) {
      const result =
        entity === "company"
          ? await database
              .update(privateCompanies)
              .set(changes)
              .where(
                and(
                  eq(privateCompanies.id, id),
                  eq(privateCompanies.userId, userId),
                ),
              )
              .run()
          : await database
              .update(privatePositions)
              .set(changes)
              .where(
                and(
                  eq(privatePositions.id, id),
                  eq(privatePositions.userId, userId),
                ),
              )
              .run();
      return result.meta.changes > 0;
    },
  };
}

export async function listOfficialCompanies(
  database: Database,
): Promise<OfficialCompany[]> {
  const companies = await database
    .select({
      id: officialCompanies.id,
      name: officialCompanies.name,
      logoUrl: officialCompanies.logoUrl,
      websiteUrl: officialCompanies.websiteUrl,
      careersUrl: officialCompanies.careersUrl,
      processUrl: officialCompanies.processUrl,
      industry: officialCompanies.industry,
      priority: officialCompanies.priority,
    })
    .from(officialCompanies)
    .where(eq(officialCompanies.isActive, true))
    .orderBy(
      officialCompanyPriorityOrder(),
      asc(officialCompanies.name),
    );

  if (companies.length === 0) return [];

  const [cityRows, submissionRows] = await Promise.all([
    database
      .select({
        companyId: companyCities.companyId,
        cityName: officialCities.name,
      })
      .from(companyCities)
      .innerJoin(
        officialCities,
        eq(companyCities.cityId, officialCities.id),
      )
      .orderBy(asc(officialCities.name)),
    database
      .select({
        companyId: submissions.officialCompanyId,
        submissionCount: count(),
      })
      .from(submissions)
      .groupBy(submissions.officialCompanyId),
  ]);

  const citiesByCompany = new Map<string, string[]>();
  for (const city of cityRows) {
    const cities = citiesByCompany.get(city.companyId) ?? [];
    cities.push(city.cityName);
    citiesByCompany.set(city.companyId, cities);
  }
  const submissionsByCompany = new Map(
    submissionRows.flatMap((row) =>
      row.companyId
        ? [[row.companyId, row.submissionCount] as const]
        : [],
    ),
  );

  return companies.map((company) => ({
    ...company,
    cities: citiesByCompany.get(company.id) ?? [],
    submissionCount: submissionsByCompany.get(company.id) ?? 0,
  }));
}

import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  batches,
  interviews,
  officialCompanies,
  privateCompanies,
  stages,
  submissions,
  userPreferences,
} from "@/db/schema";
import type { DashboardRepository } from "@/modules/dashboard/service";

type Database = DrizzleD1Database<typeof schema>;

export function createDashboardRepository(
  database: Database,
): DashboardRepository {
  return {
    async getCurrentBatchName(userId) {
      const [batch] = await database
        .select({ name: batches.name })
        .from(userPreferences)
        .innerJoin(
          batches,
          eq(userPreferences.currentBatchId, batches.id),
        )
        .where(eq(userPreferences.userId, userId))
        .limit(1);
      return batch?.name ?? null;
    },

    async getBatchCounts(userId) {
      const [counts] = await database
        .select({
          active:
            sql<number>`coalesce(sum(case when ${batches.archivedAt} is null then 1 else 0 end), 0)`,
          archived:
            sql<number>`coalesce(sum(case when ${batches.archivedAt} is not null then 1 else 0 end), 0)`,
        })
        .from(batches)
        .where(eq(batches.userId, userId));
      return {
        active: Number(counts?.active ?? 0),
        archived: Number(counts?.archived ?? 0),
      };
    },

    async listSubmissions(userId) {
      return database
        .select({
          id: submissions.id,
          batchId: submissions.batchId,
          directStatus: submissions.directStatus,
          statusSource: submissions.statusSource,
          currentInterviewStatus: interviews.status,
          hasInterview:
            sql<boolean>`exists(select 1 from interviews interview_history where interview_history.submission_id = ${submissions.id})`,
        })
        .from(submissions)
        .leftJoin(
          interviews,
          eq(submissions.currentInterviewId, interviews.id),
        )
        .where(eq(submissions.userId, userId));
    },

    async listInterviews(userId) {
      return database
        .select({
          id: interviews.id,
          companyName:
            sql<string>`coalesce(${officialCompanies.name}, ${privateCompanies.name})`,
          positionName: submissions.positionName,
          name: interviews.name,
          stageName: stages.name,
          status: interviews.status,
          scheduledAt: interviews.scheduledAt,
        })
        .from(interviews)
        .innerJoin(
          submissions,
          eq(interviews.submissionId, submissions.id),
        )
        .innerJoin(stages, eq(interviews.stageId, stages.id))
        .leftJoin(
          officialCompanies,
          eq(submissions.officialCompanyId, officialCompanies.id),
        )
        .leftJoin(
          privateCompanies,
          eq(submissions.privateCompanyId, privateCompanies.id),
        )
        .where(eq(interviews.userId, userId));
    },
  };
}

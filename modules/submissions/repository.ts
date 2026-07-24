import {
  and,
  desc,
  eq,
} from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  batches,
  officialCompanies,
  officialPositions,
  privateCompanies,
  privatePositions,
  submissions,
  interviews,
  stages,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import type {
  SubmissionRecord,
  SubmissionRepository,
} from "@/modules/submissions/service";

type Database = DrizzleD1Database<typeof schema>;

export function createSubmissionRepository(
  database: Database,
): SubmissionRepository {
  return {
    async findByMutationId(userId, mutationId) {
      const [record] = await database
        .select()
        .from(submissions)
        .where(
          and(
            eq(submissions.userId, userId),
            eq(submissions.clientMutationId, mutationId),
          ),
        )
        .limit(1);
      return (record as SubmissionRecord | undefined) ?? null;
    },

    async findById(userId, id) {
      const [record] = await database
        .select()
        .from(submissions)
        .where(
          and(eq(submissions.userId, userId), eq(submissions.id, id)),
        )
        .limit(1);
      return (record as SubmissionRecord | undefined) ?? null;
    },

    async list(userId) {
      return (await database
        .select()
        .from(submissions)
        .where(eq(submissions.userId, userId))
        .orderBy(desc(submissions.appliedAt))) as SubmissionRecord[];
    },

    async batchBelongsToUser(userId, batchId) {
      const [batch] = await database
        .select({ id: batches.id })
        .from(batches)
        .where(
          and(eq(batches.userId, userId), eq(batches.id, batchId)),
        )
        .limit(1);
      return Boolean(batch);
    },

    async catalogReferenceExists(
      userId,
      entity,
      source,
      id,
    ) {
      if (entity === "company" && source === "official") {
        const [row] = await database
          .select({ id: officialCompanies.id })
          .from(officialCompanies)
          .where(
            and(
              eq(officialCompanies.id, id),
              eq(officialCompanies.isActive, true),
            ),
          )
          .limit(1);
        return Boolean(row);
      }
      if (entity === "position" && source === "official") {
        const [row] = await database
          .select({ id: officialPositions.id })
          .from(officialPositions)
          .where(
            and(
              eq(officialPositions.id, id),
              eq(officialPositions.isActive, true),
            ),
          )
          .limit(1);
        return Boolean(row);
      }
      if (entity === "company") {
        const [row] = await database
          .select({ id: privateCompanies.id })
          .from(privateCompanies)
          .where(
            and(
              eq(privateCompanies.id, id),
              eq(privateCompanies.userId, userId),
            ),
          )
          .limit(1);
        return Boolean(row);
      }
      const [row] = await database
        .select({ id: privatePositions.id })
        .from(privatePositions)
        .where(
          and(
            eq(privatePositions.id, id),
            eq(privatePositions.userId, userId),
          ),
        )
        .limit(1);
      return Boolean(row);
    },

    async insert(record) {
      await database.insert(submissions).values(record).run();
    },

    async update(userId, id, changes) {
      await database
        .update(submissions)
        .set(changes)
        .where(
          and(eq(submissions.userId, userId), eq(submissions.id, id)),
        )
        .run();
    },

    async delete(userId, id) {
      await database
        .delete(submissions)
        .where(
          and(eq(submissions.userId, userId), eq(submissions.id, id)),
        )
        .run();
    },
  };
}

export async function listSubmissionViews(
  database: Database,
  userId: string,
) {
  return database
    .select({
      id: submissions.id,
      batchId: submissions.batchId,
      batchName: batches.name,
      companyName:
        sql<string>`coalesce(${officialCompanies.name}, ${privateCompanies.name})`,
      positionConcept:
        sql<string>`coalesce(${officialPositions.name}, ${privatePositions.name})`,
      positionName: submissions.positionName,
      jdUrl: submissions.jdUrl,
      location: submissions.location,
      channel: submissions.channel,
      appliedAt: submissions.appliedAt,
      statusSource: submissions.statusSource,
      directStatus: submissions.directStatus,
      currentInterviewId: submissions.currentInterviewId,
      stageName: stages.name,
      interviewStatus: interviews.status,
    })
    .from(submissions)
    .innerJoin(batches, eq(submissions.batchId, batches.id))
    .leftJoin(
      officialCompanies,
      eq(submissions.officialCompanyId, officialCompanies.id),
    )
    .leftJoin(
      privateCompanies,
      eq(submissions.privateCompanyId, privateCompanies.id),
    )
    .leftJoin(
      officialPositions,
      eq(submissions.officialPositionId, officialPositions.id),
    )
    .leftJoin(
      privatePositions,
      eq(submissions.privatePositionId, privatePositions.id),
    )
    .leftJoin(
      interviews,
      eq(submissions.currentInterviewId, interviews.id),
    )
    .leftJoin(stages, eq(interviews.stageId, stages.id))
    .where(eq(submissions.userId, userId))
    .orderBy(desc(submissions.appliedAt));
}

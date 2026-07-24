import {
  and,
  desc,
  eq,
  sql,
} from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  interviews,
  stages,
  submissions,
} from "@/db/schema";
import type {
  InterviewRecord,
  InterviewRepository,
  InterviewSubmission,
} from "@/modules/interviews/service";

type Database = DrizzleD1Database<typeof schema>;

export function createInterviewRepository(
  database: Database,
): InterviewRepository {
  return {
    async findSubmission(userId, id) {
      const [submission] = await database
        .select({
          id: submissions.id,
          userId: submissions.userId,
          directStatus: submissions.directStatus,
          statusSource: submissions.statusSource,
          currentInterviewId: submissions.currentInterviewId,
        })
        .from(submissions)
        .where(
          and(eq(submissions.userId, userId), eq(submissions.id, id)),
        )
        .limit(1);
      return (submission as InterviewSubmission | undefined) ?? null;
    },

    async findInterview(userId, id) {
      const [interview] = await database
        .select()
        .from(interviews)
        .where(
          and(eq(interviews.userId, userId), eq(interviews.id, id)),
        )
        .limit(1);
      return (interview as InterviewRecord | undefined) ?? null;
    },

    async stageExists(id) {
      const [stage] = await database
        .select({ id: stages.id })
        .from(stages)
        .where(and(eq(stages.id, id), eq(stages.isActive, true)))
        .limit(1);
      return Boolean(stage);
    },

    async insert(record) {
      await database.insert(interviews).values(record).run();
    },

    async insertAndAdvance(record) {
      await database.batch([
        database.insert(interviews).values(record),
        database
          .update(submissions)
          .set({
            statusSource: "interview",
            currentInterviewId: record.id,
            statusUpdatedAt: record.updatedAt,
            updatedAt: record.updatedAt,
          })
          .where(
            and(
              eq(submissions.userId, record.userId),
              eq(submissions.id, record.submissionId),
            ),
          ),
      ]);
    },

    async updateOnly(id, changes) {
      await database
        .update(interviews)
        .set(changes)
        .where(eq(interviews.id, id))
        .run();
    },

    async updateAndAdvance(record, changes) {
      const updatedAt = changes.updatedAt ?? new Date();
      await database.batch([
        database
          .update(interviews)
          .set(changes)
          .where(
            and(
              eq(interviews.userId, record.userId),
              eq(interviews.id, record.id),
            ),
          ),
        database
          .update(submissions)
          .set({
            statusSource: "interview",
            currentInterviewId: record.id,
            statusUpdatedAt: updatedAt,
            updatedAt,
          })
          .where(
            and(
              eq(submissions.userId, record.userId),
              eq(submissions.id, record.submissionId),
            ),
          ),
      ]);
    },

    async findLatestOther(userId, submissionId, excludedId) {
      const [interview] = await database
        .select()
        .from(interviews)
        .where(
          and(
            eq(interviews.userId, userId),
            eq(interviews.submissionId, submissionId),
            // SQLite boolean expression keeps repeated stages valid while
            // excluding only the record being deleted.
            sql`${interviews.id} <> ${excludedId}`,
          ),
        )
        .orderBy(desc(interviews.updatedAt))
        .limit(1);
      return (interview as InterviewRecord | undefined) ?? null;
    },

    async deleteAndRewind(interview, fallbackId) {
      await database.batch([
        database
          .delete(interviews)
          .where(
            and(
              eq(interviews.userId, interview.userId),
              eq(interviews.id, interview.id),
            ),
          ),
        database
          .update(submissions)
          .set({
            currentInterviewId: fallbackId,
            statusSource: fallbackId ? "interview" : "direct",
            statusUpdatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(submissions.userId, interview.userId),
              eq(submissions.id, interview.submissionId),
              eq(submissions.currentInterviewId, interview.id),
            ),
          ),
      ]);
    },
  };
}

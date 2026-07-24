import {
  and,
  desc,
  eq,
  sql,
} from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  interviewQuestions,
  interviews,
  questions,
  stages,
  submissions,
} from "@/db/schema";
import type {
  QuestionRecord,
  QuestionRepository,
} from "@/modules/questions/service";

type Database = DrizzleD1Database<typeof schema>;

export function createQuestionRepository(
  database: Database,
): QuestionRepository {
  return {
    async findQuestion(userId, id) {
      const [question] = await database
        .select()
        .from(questions)
        .where(
          and(eq(questions.userId, userId), eq(questions.id, id)),
        )
        .limit(1);
      return (question as QuestionRecord | undefined) ?? null;
    },

    async findInterview(userId, id) {
      const [interview] = await database
        .select({ id: interviews.id, userId: interviews.userId })
        .from(interviews)
        .where(
          and(eq(interviews.userId, userId), eq(interviews.id, id)),
        )
        .limit(1);
      return interview ?? null;
    },

    async insert(record) {
      await database.insert(questions).values(record).run();
    },

    async update(id, changes) {
      await database
        .update(questions)
        .set(changes)
        .where(eq(questions.id, id))
        .run();
    },

    async delete(id) {
      await database.delete(questions).where(eq(questions.id, id)).run();
    },

    async link(userId, interviewId, questionId, createdAt) {
      await database
        .insert(interviewQuestions)
        .values({ userId, interviewId, questionId, createdAt })
        .onConflictDoNothing()
        .run();
    },

    async unlink(userId, interviewId, questionId) {
      await database
        .delete(interviewQuestions)
        .where(
          and(
            eq(interviewQuestions.userId, userId),
            eq(interviewQuestions.interviewId, interviewId),
            eq(interviewQuestions.questionId, questionId),
          ),
        )
        .run();
    },
  };
}

export async function listQuestionViews(
  database: Database,
  userId: string,
) {
  return database
    .select({
      id: questions.id,
      questionText: questions.questionText,
      answerMarkdown: questions.answerMarkdown,
      category: questions.category,
      updatedAt: questions.updatedAt,
      interviewCount: sql<number>`count(${interviewQuestions.interviewId})`,
    })
    .from(questions)
    .leftJoin(
      interviewQuestions,
      eq(questions.id, interviewQuestions.questionId),
    )
    .where(eq(questions.userId, userId))
    .groupBy(questions.id)
    .orderBy(desc(questions.updatedAt));
}

export async function listQuestionInterviewLinks(
  database: Database,
  userId: string,
  questionId: string,
) {
  return database
    .select({
      id: interviews.id,
      name: interviews.name,
      stageName: stages.name,
      positionName: submissions.positionName,
      status: interviews.status,
      scheduledAt: interviews.scheduledAt,
    })
    .from(interviewQuestions)
    .innerJoin(
      interviews,
      eq(interviewQuestions.interviewId, interviews.id),
    )
    .innerJoin(stages, eq(interviews.stageId, stages.id))
    .innerJoin(
      submissions,
      eq(interviews.submissionId, submissions.id),
    )
    .where(
      and(
        eq(interviewQuestions.userId, userId),
        eq(interviewQuestions.questionId, questionId),
      ),
    )
    .orderBy(desc(interviews.scheduledAt));
}

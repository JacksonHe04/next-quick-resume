import {
  createQuestionInputSchema,
  linkQuestionInputSchema,
  updateQuestionInputSchema,
} from "@/modules/questions/schemas";

export type QuestionRecord = {
  id: string;
  userId: string;
  questionText: string;
  answerMarkdown: string;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionErrorCode =
  | "QUESTION_NOT_FOUND"
  | "INTERVIEW_NOT_FOUND";

export class QuestionError extends Error {
  constructor(
    public readonly code: QuestionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "QuestionError";
  }
}

export interface QuestionRepository {
  findQuestion(
    userId: string,
    id: string,
  ): Promise<QuestionRecord | null>;
  findInterview(
    userId: string,
    id: string,
  ): Promise<{ id: string; userId: string } | null>;
  insert(record: QuestionRecord): Promise<void>;
  update(id: string, changes: Partial<QuestionRecord>): Promise<void>;
  delete(id: string): Promise<void>;
  link(
    userId: string,
    interviewId: string,
    questionId: string,
    createdAt: Date,
  ): Promise<void>;
  unlink(
    userId: string,
    interviewId: string,
    questionId: string,
  ): Promise<void>;
}

async function requireQuestion(
  repository: QuestionRepository,
  userId: string,
  id: string,
) {
  const question = await repository.findQuestion(userId, id);
  if (!question) {
    throw new QuestionError("QUESTION_NOT_FOUND", "问题不存在");
  }
  return question;
}

export async function createQuestion(
  repository: QuestionRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<QuestionRecord> {
  const parsed = createQuestionInputSchema.parse(input);
  const question: QuestionRecord = {
    id: crypto.randomUUID(),
    userId,
    questionText: parsed.questionText,
    answerMarkdown: parsed.answerMarkdown,
    category: parsed.category ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await repository.insert(question);
  return question;
}

export async function updateQuestion(
  repository: QuestionRepository,
  userId: string,
  id: string,
  input: unknown,
  now = new Date(),
): Promise<void> {
  await requireQuestion(repository, userId, id);
  const parsed = updateQuestionInputSchema.parse(input);
  await repository.update(id, { ...parsed, updatedAt: now });
}

export async function deleteQuestion(
  repository: QuestionRepository,
  userId: string,
  id: string,
): Promise<void> {
  await requireQuestion(repository, userId, id);
  await repository.delete(id);
}

export async function linkQuestion(
  repository: QuestionRepository,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<void> {
  const parsed = linkQuestionInputSchema.parse(input);
  await requireQuestion(repository, userId, parsed.questionId);
  if (
    !(await repository.findInterview(userId, parsed.interviewId))
  ) {
    throw new QuestionError(
      "INTERVIEW_NOT_FOUND",
      "选拔事件不存在",
    );
  }
  await repository.link(
    userId,
    parsed.interviewId,
    parsed.questionId,
    now,
  );
}

export async function unlinkQuestion(
  repository: QuestionRepository,
  userId: string,
  input: unknown,
): Promise<void> {
  const parsed = linkQuestionInputSchema.parse(input);
  await requireQuestion(repository, userId, parsed.questionId);
  await repository.unlink(
    userId,
    parsed.interviewId,
    parsed.questionId,
  );
}

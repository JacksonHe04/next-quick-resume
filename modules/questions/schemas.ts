import { z } from "zod";

export const createQuestionInputSchema = z.object({
  questionText: z.string().trim().min(1, "请输入问题").max(2_000),
  answerMarkdown: z.string().max(100_000).default(""),
  category: z.string().trim().max(80).nullable().optional(),
});

export const updateQuestionInputSchema =
  createQuestionInputSchema.partial();

export const linkQuestionInputSchema = z.object({
  interviewId: z.string().min(1),
  questionId: z.string().min(1),
});

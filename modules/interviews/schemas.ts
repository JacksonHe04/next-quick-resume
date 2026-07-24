import { z } from "zod";

import { INTERVIEW_STATUSES } from "@/db/schema/hiring";

export const createInterviewInputSchema = z.object({
  submissionId: z.string().min(1),
  stageId: z.string().min(1),
  name: z.string().trim().min(1, "请输入选拔名称").max(120),
  scheduledAt: z.coerce.date().nullable().optional(),
  durationMinutes: z.number().int().positive().max(24 * 60).nullable().optional(),
  meetingUrl: z.string().url().nullable().optional(),
  status: z.enum(INTERVIEW_STATUSES),
  reviewMarkdown: z.string().max(100_000).nullable().optional(),
});

export const updateInterviewInputSchema =
  createInterviewInputSchema
    .omit({ submissionId: true })
    .partial();

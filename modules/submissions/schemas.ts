import { z } from "zod";

import { DIRECT_SUBMISSION_STATUSES } from "@/db/schema/hiring";

const catalogReferenceSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("official"),
    id: z.string().min(1),
  }),
  z.object({
    source: z.literal("private"),
    id: z.string().min(1),
  }),
]);

const officialCompanyReferenceSchema = z.object({
  source: z.literal("official"),
  id: z.string().min(1),
});

export const createSubmissionInputSchema = z.object({
  clientMutationId: z.string().min(8).max(100),
  batchId: z.string().min(1),
  company: officialCompanyReferenceSchema,
  position: catalogReferenceSchema,
  positionName: z.string().trim().min(1, "请输入岗位名称").max(160),
  jdUrl: z.string().url("请输入有效的职位链接").optional(),
  location: z.string().trim().max(120).optional(),
  channel: z.string().trim().max(120).optional(),
  appliedAt: z.coerce.date(),
  notesMarkdown: z.string().max(50_000).optional(),
});

export const updateSubmissionInputSchema = z.object({
  batchId: z.string().min(1).optional(),
  positionName: z.string().trim().min(1).max(160).optional(),
  jdUrl: z.string().url().nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  channel: z.string().trim().max(120).nullable().optional(),
  appliedAt: z.coerce.date().optional(),
  notesMarkdown: z.string().max(50_000).nullable().optional(),
  directStatus: z.enum(DIRECT_SUBMISSION_STATUSES).optional(),
});

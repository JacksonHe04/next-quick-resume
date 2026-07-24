import { z } from "zod";

export const createBatchInputSchema = z.object({
  name: z.string().trim().min(1, "请输入批次名称").max(80, "批次名称不能超过 80 个字符"),
  description: z.string().trim().max(500).optional(),
  strategyMarkdown: z.string().max(20_000).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateBatchInputSchema =
  createBatchInputSchema.partial();

import { z } from "zod";

export const catalogEntitySchema = z.enum(["company", "position"]);

export const createPrivateCatalogInputSchema = z.object({
  name: z.string().trim().min(1, "请输入名称").max(120, "名称不能超过 120 个字符"),
});

export const searchCatalogInputSchema = z.object({
  query: z.string().trim().max(120).default(""),
});

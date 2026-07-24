import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import {
  officialCompanies,
  officialPositions,
  stages,
} from "@/db/schema";

type Database = DrizzleD1Database<typeof schema>;

export const OFFICIAL_COMPANIES = [
  ["company-openai", "OpenAI", "openai", "人工智能"],
  ["company-bytedance", "字节跳动", "字节跳动", "互联网"],
  ["company-tencent", "腾讯", "腾讯", "互联网"],
  ["company-xiaohongshu", "小红书", "小红书", "互联网"],
  ["company-alibaba", "阿里巴巴", "阿里巴巴", "互联网"],
  ["company-meituan", "美团", "美团", "本地生活"],
  ["company-shopee", "Shopee", "shopee", "电子商务"],
  ["company-microsoft", "Microsoft", "microsoft", "软件"],
] as const;

export const OFFICIAL_POSITIONS = [
  ["position-pm", "产品经理", "产品经理"],
  ["position-ai-pm", "AI 产品经理", "ai 产品经理"],
  ["position-data-pm", "数据产品经理", "数据产品经理"],
  ["position-growth-pm", "增长产品经理", "增长产品经理"],
  ["position-marketing", "市场营销", "市场营销"],
  ["position-ba", "商业分析", "商业分析"],
  ["position-swe", "软件工程师", "软件工程师"],
] as const;

export const OFFICIAL_STAGES = [
  ["stage-assessment", "online_assessment", "测评"],
  ["stage-written", "written_test", "笔试"],
  ["stage-group", "group_interview", "群面"],
  ["stage-first", "first_interview", "一面"],
  ["stage-second", "second_interview", "二面"],
  ["stage-third", "third_interview", "三面"],
  ["stage-hr", "hr_interview", "HR 面"],
  ["stage-final", "final_interview", "终面"],
] as const;

export async function seedOfficialCatalog(
  database: Database,
  now = new Date(),
) {
  for (const [id, name, normalizedName, industry] of OFFICIAL_COMPANIES) {
    await database
      .insert(officialCompanies)
      .values({
        id,
        name,
        normalizedName,
        industry,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: officialCompanies.id,
        set: { name, normalizedName, industry, isActive: true },
      })
      .run();
  }

  for (const [index, [id, name, normalizedName]] of
    OFFICIAL_POSITIONS.entries()) {
    await database
      .insert(officialPositions)
      .values({
        id,
        name,
        normalizedName,
        sortOrder: (index + 1) * 10,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: officialPositions.id,
        set: {
          name,
          normalizedName,
          sortOrder: (index + 1) * 10,
          isActive: true,
        },
      })
      .run();
  }

  for (const [index, [id, code, name]] of OFFICIAL_STAGES.entries()) {
    await database
      .insert(stages)
      .values({
        id,
        code,
        name,
        sortOrder: (index + 1) * 10,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: stages.id,
        set: {
          code,
          name,
          sortOrder: (index + 1) * 10,
          isActive: true,
        },
      })
      .run();
  }
}

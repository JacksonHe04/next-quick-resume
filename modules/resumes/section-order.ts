import type {
  ResumeData,
  ResumeSectionKey,
} from "@/types";

// 提供/持久化 JSON 时，字段顺序应跟随简历 sectionOrder（header 恒在最前），
// 而不是 TypeScript 类型声明里的固定顺序（about 曾长期排在 education 前面）。
export function orderDataBySections(
  data: ResumeData,
  sectionOrder: ResumeSectionKey[],
): ResumeData {
  const ordered: Record<string, unknown> = {};
  const used = new Set<string>();

  for (const key of sectionOrder) {
    if (key in data) {
      ordered[key] = data[key as keyof ResumeData];
      used.add(key);
    }
  }
  // sectionOrder 之外的遗留字段按原有相对顺序追加在末尾
  for (const key of Object.keys(data)) {
    if (!used.has(key)) {
      ordered[key] = data[key as keyof ResumeData];
    }
  }
  return ordered as unknown as ResumeData;
}

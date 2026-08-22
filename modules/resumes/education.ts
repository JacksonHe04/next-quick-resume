import type { EducationData, EducationItem } from "@/types";

/**
 * 从 EducationData 中提取标准化的 EducationItem 列表。
 * 兼容旧版数据结构（单条教育经历，period/details 在顶层）。
 */
export function getEducationItems(
  education: EducationData | undefined,
): EducationItem[] {
  if (!education) return [];
  if (education.items) return education.items;

  // 兼容旧数据：顶层的 period 和 details 转为第一个 entry
  const oldData = education as EducationData & { period?: string; details?: string };
  let entries: EducationItem["entries"] = [];
  if (education.entries && education.entries.length > 0) {
    entries = education.entries;
  } else if (oldData.period || oldData.details) {
    entries = [{ period: oldData.period ?? "", details: oldData.details ?? "" }];
  }

  return [
    {
      school: education.school,
      base: education.base,
      image: education.image,
      entries,
    },
  ];
}

export function withEducationItems(
  title: string,
  items: EducationItem[],
): EducationData | undefined {
  const first = items[0];
  if (!first) return undefined;
  const firstEntry = first.entries[0];
  return {
    title,
    school: first.school,
    base: first.base,
    image: first.image,
    period: firstEntry?.period,
    details: firstEntry?.details,
    entries: firstEntry ? first.entries : undefined,
    items,
  };
}

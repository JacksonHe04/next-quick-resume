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
      school: education.school ?? "",
      base: education.base,
      image: education.image,
      entries,
    },
  ];
}

/**
 * 写入教育经历：持久化形态只保留 title + items[]。
 * 旧版的顶层 school/base/period/details/entries 仅由 getEducationItems 在读
 * 取侧兼容，任何写入路径都不再产出它们。
 */
export function withEducationItems(
  title: string,
  items: EducationItem[],
): EducationData | undefined {
  if (!items.length) return undefined;
  return { title, items };
}

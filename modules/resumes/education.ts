import type { EducationData, EducationItem } from "@/types";

export function getEducationItems(
  education: EducationData | undefined,
): EducationItem[] {
  if (!education) return [];
  if (education.items) return education.items;
  return [
    {
      school: education.school,
      base: education.base,
      period: education.period,
      details: education.details,
      image: education.image,
    },
  ];
}

export function withEducationItems(
  title: string,
  items: EducationItem[],
): EducationData | undefined {
  const first = items[0];
  if (!first) return undefined;
  return {
    title,
    ...first,
    items,
  };
}

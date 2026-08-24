import { getEducationItems } from "@/modules/resumes/education";
import type {
  AboutData,
  EducationData,
  EducationItem,
  HeaderData,
  InternData,
  InternItem,
  ProjectsData,
  ProjectItem,
  ResumeData,
} from "@/types";

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asString) : [];
}

// 关于我的要点：新数据为 string[]，旧数据为换行分隔的字符串。
function asPointArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(asString);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeHeader(value: unknown): HeaderData {
  const header = asObject(value) ?? {};
  const contact = asObject(header.contact) ?? {};
  const github = asObject(contact.github);
  const homepage = asObject(contact.homepage);
  const jobInfo = asObject(header.jobInfo) ?? {};
  return {
    name: asString(header.name),
    contact: {
      phone: asString(contact.phone),
      email: asString(contact.email),
      ...(github
        ? { github: { text: asString(github.text), url: asString(github.url) } }
        : {}),
      ...(homepage
        ? {
            homepage: {
              text: asString(homepage.text),
              url: asString(homepage.url),
            },
          }
        : {}),
    },
    jobInfo: {
      ...(jobInfo.position !== undefined
        ? { position: asString(jobInfo.position) }
        : {}),
    },
  };
}

function normalizeEducationEntry(value: unknown): {
  period: string;
  details: string;
} {
  const entry = asObject(value);
  return entry
    ? { period: asString(entry.period), details: asString(entry.details) }
    : { period: "", details: asString(value) };
}

function normalizeEducation(value: unknown): EducationData | undefined {
  const section = asObject(value);
  if (!section) return undefined;
  const rawItems = Array.isArray(section.items)
    ? section.items
    : section.school !== undefined
      ? [section]
      : [];
  const items: EducationItem[] = rawItems
    .map(asObject)
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => {
      const normalized: EducationItem = {
        school: asString(item.school),
        entries: Array.isArray(item.entries)
          ? item.entries.map(normalizeEducationEntry)
          : [],
      };
      if (item.base !== undefined) normalized.base = asString(item.base);
      if (item.image !== undefined) normalized.image = asString(item.image);
      return normalized;
    });
  return {
    title: asString(section.title) || "教育经历",
    items,
  };
}

function normalizeIntern(value: unknown): InternData | undefined {
  const section = asObject(value);
  if (!section) return undefined;
  const items: InternItem[] = Array.isArray(section.items)
    ? section.items
        .map(asObject)
        .filter((item): item is Record<string, unknown> => Boolean(item))
        .map((item) => {
          const normalized: InternItem = {
            company: asString(item.company),
            position: asString(item.position),
            period: asString(item.period),
            base: asString(item.base),
            description: asString(item.description),
            responsibilities: asStringArray(item.responsibilities),
          };
          if (item.image !== undefined) normalized.image = asString(item.image);
          return normalized;
        })
    : [];
  return { title: asString(section.title) || "实习经历", items };
}

function normalizeProjects(value: unknown): ProjectsData | undefined {
  const section = asObject(value);
  if (!section) return undefined;
  const items: ProjectItem[] = Array.isArray(section.items)
    ? section.items
        .map(asObject)
        .filter((item): item is Record<string, unknown> => Boolean(item))
        .map((item) => ({
          name: asString(item.name),
          github: asString(item.github),
          description: asString(item.description),
          features: asStringArray(item.features),
          ...(item.demo !== undefined ? { demo: asString(item.demo) } : {}),
        }))
    : [];
  return { title: asString(section.title) || "项目经历", items };
}

function normalizeAbout(value: unknown): AboutData | undefined {
  const section = asObject(value);
  if (!section) return undefined;
  return {
    title: asString(section.title) || "关于我",
    content: asPointArray(section.content),
  };
}

/** 读取关于我要点：新数据为 string[]，旧数据按换行拆成数组，缺失返回空数组。 */
export function getAboutPoints(about: AboutData | undefined): string[] {
  return asPointArray(about?.content);
}

/**
 * 把任意 JSON 输入收敛为渲染安全的 ResumeData：
 * - 缺失/类型错误的字段补成空字符串或空数组，预览里的 `.map` 永不读到 undefined；
 * - 教育经历统一规整为 items[] 结构，丢弃遗留的顶层 school/period/details 字段；
 * - 未知键原样保留（编辑过程中可能存在，不影响渲染）。
 */
export function normalizeResumeData(input: unknown): ResumeData {
  const source = asObject(input) ?? {};
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    switch (key) {
      case "header":
        normalized[key] = normalizeHeader(value);
        break;
      case "education":
        normalized[key] = normalizeEducation(value);
        break;
      case "intern":
        normalized[key] = normalizeIntern(value);
        break;
      case "projects":
        normalized[key] = normalizeProjects(value);
        break;
      case "about":
        normalized[key] = normalizeAbout(value);
        break;
      default:
        normalized[key] = value;
    }
  }
  if (!normalized.header) {
    normalized.header = normalizeHeader(undefined);
  }
  return normalized as unknown as ResumeData;
}

/**
 * 迁移读取侧：旧数据里 education 顶层字段会被读成一个合成 item。
 * 用于把数据库里的旧文档一次性升级到 items[] 形态。
 */
export function migrateEducation(data: ResumeData): ResumeData {
  if (!data.education) return data;
  const items = getEducationItems(data.education);
  return {
    ...data,
    education: items.length
      ? { title: data.education.title || "教育经历", items }
      : undefined,
  };
}

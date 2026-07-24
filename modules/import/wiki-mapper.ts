import type {
  DIRECT_SUBMISSION_STATUSES,
  INTERVIEW_STATUSES,
} from "@/db/schema/hiring";

export type WikiPage = {
  notionId: string;
  title: string;
  body: string;
  createdTime?: string;
  lastEditedTime?: string;
  properties: Record<string, unknown>;
};

type DirectSubmissionStatus =
  (typeof DIRECT_SUBMISSION_STATUSES)[number];
type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];
type RelationTitles = ReadonlyMap<string, string>;

function scalarString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function relationId(value: unknown): string | undefined {
  return Array.isArray(value) && typeof value[0] === "string"
    ? value[0]
    : undefined;
}

function relationTitle(
  properties: Record<string, unknown>,
  property: string,
  relations: RelationTitles,
): string | undefined {
  const id = relationId(properties[property]);
  return id ? relations.get(id) : undefined;
}

function isoDate(value: unknown, fallback?: string): string {
  const candidate = scalarString(value) ?? fallback;
  const date = candidate ? new Date(candidate) : new Date(0);
  return Number.isNaN(date.getTime())
    ? new Date(0).toISOString()
    : date.toISOString();
}

export function stableWikiId(
  entity:
    | "batch"
    | "company"
    | "position"
    | "submission"
    | "interview"
    | "question"
    | "resume",
  notionId: string,
) {
  return `wiki-${entity}-${notionId}`;
}

function mapDirectStatus(
  status: unknown,
  result: unknown,
): DirectSubmissionStatus {
  const value = `${scalarString(status) ?? ""} ${scalarString(result) ?? ""}`;
  if (/offer|录用|已入职/i.test(value)) return "offer";
  if (/简历挂|筛选失败|未通过/.test(value)) return "resume_failed";
  if (/简历过|筛选通过/.test(value)) return "resume_passed";
  if (/取消|放弃/.test(value)) return "cancelled";
  if (/过期/.test(value)) return "expired";
  if (/结束|已结束|关闭/.test(value)) return "closed";
  if (/筛选中|进行中/.test(value)) return "screening";
  return "submitted";
}

function mapInterviewStatus(value: unknown): InterviewStatus {
  const status = scalarString(value) ?? "";
  if (/success|pass|通过/i.test(status)) return "passed";
  if (/failure|fail|未通过|挂|cancel/i.test(status)) return "failed";
  if (/wait.?result|待结果|completion/i.test(status)) return "pending_result";
  return "pending_interview";
}

export function mapBatch(page: WikiPage) {
  return {
    id: stableWikiId("batch", page.notionId),
    sourceId: page.notionId,
    name: page.title.trim(),
    description: page.body || undefined,
    strategyMarkdown: page.body || undefined,
    createdAt: isoDate(page.createdTime),
    updatedAt: isoDate(page.lastEditedTime, page.createdTime),
  };
}

export function mapSubmission(
  page: WikiPage,
  relations: RelationTitles,
) {
  const properties = page.properties;
  const companyName =
    relationTitle(properties, "Company", relations) ?? "未命名公司";
  const positionName =
    relationTitle(properties, "Position", relations) ??
    page.title.replace(companyName, "").replace(/\d{4}-\d{2}-\d{2}/, "").trim() ??
    "未命名岗位";
  return {
    id: stableWikiId("submission", page.notionId),
    sourceId: page.notionId,
    batchSourceId: relationId(properties.Batch),
    companySourceId: relationId(properties.Company),
    positionSourceId: relationId(properties.Position),
    companyName,
    positionName: positionName || "未命名岗位",
    appliedAt: isoDate(properties.Time, page.createdTime),
    directStatus: mapDirectStatus(properties.Status, properties.Result),
    jdUrl: scalarString(properties.JD),
    location: relationTitle(properties, "City", relations),
    channel: relationTitle(properties, "Type", relations),
    notesMarkdown: page.body || undefined,
    createdAt: isoDate(page.createdTime),
    updatedAt: isoDate(page.lastEditedTime, page.createdTime),
  };
}

export function mapInterview(
  page: WikiPage,
  relations: RelationTitles,
) {
  const properties = page.properties;
  const duration = Number(properties.Duration);
  return {
    id: stableWikiId("interview", page.notionId),
    sourceId: page.notionId,
    submissionSourceId: relationId(properties.Submission),
    stageName:
      relationTitle(properties, "Stage", relations) ??
      page.title.split("：")[1]?.trim() ??
      "一面",
    name: page.title.trim(),
    scheduledAt: scalarString(properties.Time)
      ? isoDate(properties.Time)
      : undefined,
    durationMinutes:
      Number.isFinite(duration) && duration > 0 ? Math.round(duration) : undefined,
    meetingUrl: scalarString(properties.Process),
    status: mapInterviewStatus(properties.Status),
    reviewMarkdown: page.body || undefined,
    questionSourceIds: Array.isArray(properties.Questions)
      ? properties.Questions.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    createdAt: isoDate(page.createdTime),
    updatedAt: isoDate(page.lastEditedTime, page.createdTime),
  };
}

export function mapQuestion(
  page: WikiPage,
  relations: RelationTitles,
) {
  return {
    id: stableWikiId("question", page.notionId),
    sourceId: page.notionId,
    questionText: page.title.trim(),
    answerMarkdown: page.body,
    category: relationTitle(page.properties, "Category", relations),
    interviewSourceIds: Array.isArray(
      page.properties["Interview Experience"],
    )
      ? page.properties["Interview Experience"].filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    createdAt: isoDate(page.createdTime),
    updatedAt: isoDate(page.lastEditedTime, page.createdTime),
  };
}

export function mapResume(page: WikiPage) {
  return {
    id: stableWikiId("resume", page.notionId),
    sourceId: page.notionId,
    name: page.title.trim(),
    markdownBody: page.body,
    date: scalarString(page.properties.Date),
    createdAt: isoDate(page.createdTime),
    updatedAt: isoDate(page.lastEditedTime, page.createdTime),
  };
}

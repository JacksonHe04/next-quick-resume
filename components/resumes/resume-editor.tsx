"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ResumePreview } from "@/components/resumes/resume-preview";
import { Button, Card, Input } from "@/components/ui";
import { appFetch } from "@/lib/app-fetch";
import type { ResumeRecord } from "@/modules/resumes/service";
import type {
  ResumeData,
  ResumeDocumentV1,
  ResumeSectionKey,
} from "@/types";

type SaveInput = {
  id: string;
  version: number;
  name: string;
  document: ResumeDocumentV1;
};

type SaveResult = { version: number };

async function saveThroughApi(input: SaveInput): Promise<SaveResult> {
  const response = await appFetch(`/api/resumes/${input.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    resume?: ResumeRecord;
    error?: { message?: string };
  };
  if (!response.ok || !payload.resume) {
    throw new Error(payload.error?.message ?? "保存失败");
  }
  return { version: payload.resume.version };
}

function toMarkdown(data: ResumeData) {
  const lines = [
    `# ${data.header.name}`,
    "",
    data.header.jobInfo.position ?? "",
    "",
    `- 电话 / 微信：${data.header.contact.phone}`,
    `- 邮箱：${data.header.contact.email}`,
  ];
  if (data.education) {
    lines.push(
      "",
      `## ${data.education.title}`,
      `${data.education.school} · ${data.education.period}`,
      "",
      data.education.details,
    );
  }
  if (data.skills) {
    lines.push(
      "",
      `## ${data.skills.title}`,
      ...data.skills.items.map((item) => `- ${item}`),
    );
  }
  if (data.intern) {
    lines.push("", `## ${data.intern.title}`);
    data.intern.items.forEach((item) => {
      lines.push(
        "",
        `### ${item.company} · ${item.position}`,
        `${item.period} · ${item.base}`,
        "",
        item.description,
        ...item.responsibilities.map(
          (responsibility) => `- ${responsibility}`,
        ),
      );
    });
  }
  if (data.projects) {
    lines.push("", `## ${data.projects.title}`);
    data.projects.items.forEach((item) => {
      lines.push(
        "",
        `### ${item.name}`,
        item.description,
        ...item.features.map((feature) => `- ${feature}`),
      );
    });
  }
  if (data.about) {
    lines.push("", `## ${data.about.title}`, data.about.content);
  }
  return lines.join("\n");
}

export function ResumeEditor({
  initial,
  save = saveThroughApi,
  autosaveDelay = 650,
}: {
  initial: ResumeRecord;
  save?: (input: SaveInput) => Promise<SaveResult>;
  autosaveDelay?: number;
}) {
  const [name, setName] = useState(initial.name);
  const [document, setDocument] = useState<ResumeDocumentV1>(() =>
    structuredClone(initial.document),
  );
  const [version, setVersion] = useState(initial.version);
  const [syncState, setSyncState] = useState<
    "saved" | "saving" | "error"
  >("saved");
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(initial.document.data, null, 2),
  );
  const [jsonError, setJsonError] = useState<string>();
  const firstRender = useRef(true);
  const latestVersion = useRef(initial.version);

  const persist = useCallback(async () => {
    setSyncState("saving");
    try {
      const result = await save({
        id: initial.id,
        version: latestVersion.current,
        name,
        document,
      });
      latestVersion.current = result.version;
      setVersion(result.version);
      setSyncState("saved");
    } catch {
      setSyncState("error");
    }
  }, [document, initial.id, name, save]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSyncState("saving");
    const timer = window.setTimeout(persist, autosaveDelay);
    return () => window.clearTimeout(timer);
  }, [autosaveDelay, document, name, persist]);

  function updateHeader(
    changes: Partial<ResumeData["header"]>,
  ) {
    setDocument((current) => ({
      ...current,
      data: {
        ...current.data,
        header: { ...current.data.header, ...changes },
      },
    }));
  }

  function updateContact(
    changes: Partial<ResumeData["header"]["contact"]>,
  ) {
    setDocument((current) => ({
      ...current,
      data: {
        ...current.data,
        header: {
          ...current.data.header,
          contact: {
            ...current.data.header.contact,
            ...changes,
          },
        },
      },
    }));
  }

  function changeJson(value: string) {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value) as ResumeData;
      setDocument((current) => ({ ...current, data: parsed }));
      setJsonError(undefined);
    } catch {
      setJsonError("JSON 格式错误，修正后才会同步到预览。");
    }
  }

  function toggleSection(key: ResumeSectionKey) {
    setDocument((current) => ({
      ...current,
      displayConfig: {
        ...current.displayConfig,
        sections: current.displayConfig.sections.map((section) =>
          section.key === key
            ? { ...section, visible: !section.visible }
            : section,
        ),
      },
    }));
  }

  function moveSection(key: ResumeSectionKey, direction: -1 | 1) {
    setDocument((current) => {
      const sectionOrder = [...current.displayConfig.sectionOrder];
      const index = sectionOrder.indexOf(key);
      const target = index + direction;
      if (target < 0 || target >= sectionOrder.length) return current;
      [sectionOrder[index], sectionOrder[target]] = [
        sectionOrder[target],
        sectionOrder[index],
      ];
      return {
        ...current,
        displayConfig: {
          ...current.displayConfig,
          sectionOrder,
        },
      };
    });
  }

  function exportMarkdown() {
    const blob = new Blob([toMarkdown(document.data)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${name}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f1] print:bg-white">
      <div className="sticky top-0 z-30 border-b border-border bg-[#fbfcf8]/95 px-4 py-3 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/app/resumes"
              aria-label="返回简历列表"
              className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft size={17} />
            </Link>
            <Input
              aria-label="简历名称"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-48 bg-white font-medium"
            />
            <span className="hidden text-xs text-muted-foreground sm:inline">
              v{version}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              role="status"
              className={
                syncState === "error"
                  ? "text-xs text-[#9d4450]"
                  : "text-xs text-muted-foreground"
              }
            >
              {syncState === "saved" ? (
                <span className="inline-flex items-center gap-1">
                  <Check size={12} />
                  已保存
                </span>
              ) : syncState === "saving" ? (
                "保存中…"
              ) : (
                "保存失败，重试"
              )}
            </span>
            {syncState === "error" ? (
              <Button variant="secondary" onClick={persist}>
                <RefreshCw size={14} />
                重试
              </Button>
            ) : null}
            <Button variant="secondary" onClick={exportMarkdown}>
              <FileText size={14} />
              Markdown
            </Button>
            <Button onClick={() => window.print()}>
              <Download size={14} />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 xl:grid-cols-[330px_minmax(0,1fr)] print:block print:p-0">
        <aside className="space-y-4 print:hidden">
          <Card className="p-4 shadow-none">
            <h2 className="text-sm font-semibold">基本信息</h2>
            <div className="mt-4 space-y-3">
              <label>
                <span className="mb-1.5 block text-xs text-muted-foreground">
                  姓名
                </span>
                <Input
                  aria-label="姓名"
                  value={document.data.header.name}
                  onChange={(event) =>
                    updateHeader({ name: event.target.value })
                  }
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-muted-foreground">
                  求职方向
                </span>
                <Input
                  aria-label="求职方向"
                  value={document.data.header.jobInfo.position ?? ""}
                  onChange={(event) =>
                    updateHeader({
                      jobInfo: {
                        ...document.data.header.jobInfo,
                        position: event.target.value,
                      },
                    })
                  }
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-muted-foreground">
                  邮箱
                </span>
                <Input
                  aria-label="邮箱"
                  value={document.data.header.contact.email}
                  onChange={(event) =>
                    updateContact({ email: event.target.value })
                  }
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-muted-foreground">
                  电话 / 微信
                </span>
                <Input
                  aria-label="电话 / 微信"
                  value={document.data.header.contact.phone}
                  onChange={(event) =>
                    updateContact({ phone: event.target.value })
                  }
                />
              </label>
            </div>
          </Card>

          <Card className="p-4 shadow-none">
            <h2 className="text-sm font-semibold">版式与模块</h2>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs text-muted-foreground">
                头部对齐
              </span>
              <select
                value={document.displayConfig.headerAlignment}
                onChange={(event) =>
                  setDocument((current) => ({
                    ...current,
                    displayConfig: {
                      ...current.displayConfig,
                      headerAlignment: event.target.value as
                        | "left"
                        | "center",
                    },
                  }))
                }
                className="min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm"
              >
                <option value="left">左对齐</option>
                <option value="center">居中</option>
              </select>
            </label>
            <div className="mt-4 space-y-2">
              {document.displayConfig.sectionOrder.map((key) => {
                const section = document.displayConfig.sections.find(
                  (item) => item.key === key,
                );
                if (!section) return null;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
                  >
                    <label className="flex flex-1 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={() => toggleSection(key)}
                      />
                      {section.label}
                    </label>
                    <button
                      type="button"
                      aria-label={`上移${section.label}`}
                      onClick={() => moveSection(key, -1)}
                      className="text-muted-foreground"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label={`下移${section.label}`}
                      onClick={() => moveSection(key, 1)}
                      className="text-muted-foreground"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="overflow-hidden shadow-none">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">完整 JSON</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                用于编辑教育、项目、实习等全部结构化字段。
              </p>
            </div>
            {jsonError ? (
              <p role="alert" className="px-4 pt-3 text-xs text-[#9d4450]">
                {jsonError}
              </p>
            ) : null}
            <textarea
              aria-label="简历内容 JSON"
              value={jsonText}
              onChange={(event) => changeJson(event.target.value)}
              spellCheck={false}
              className="block min-h-96 w-full resize-y bg-white px-4 py-4 font-[var(--font-data)] text-[11px] leading-5 outline-none"
            />
          </Card>
        </aside>

        <main className="min-w-0 overflow-auto rounded-[20px] bg-[#e9ede7] p-4 sm:p-8 print:overflow-visible print:rounded-none print:bg-white print:p-0">
          <ResumePreview document={document} />
        </main>
      </div>
    </div>
  );
}

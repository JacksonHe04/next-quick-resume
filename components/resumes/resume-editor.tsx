"use client";

import {
  AlignCenter,
  AlignLeft,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Download,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  RefreshCw,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ResumePreview } from "@/components/resumes/resume-preview";
import { Button, Input } from "@/components/ui";
import { appFetch } from "@/lib/app-fetch";
import { cn } from "@/lib/utils";
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

function serializeDraft(name: string, document: ResumeDocumentV1) {
  return JSON.stringify({ name, document });
}

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

function PanelTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-border px-4 py-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ResumeEditor({
  initial,
  availableResumes = [initial],
  save = saveThroughApi,
  autosaveDelay = 650,
}: {
  initial: ResumeRecord;
  availableResumes?: ResumeRecord[];
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
  const [photoError, setPhotoError] = useState<string>();
  const latestVersion = useRef(initial.version);
  const persistedDraft = useRef(serializeDraft(initial.name, initial.document));

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
      persistedDraft.current = serializeDraft(name, document);
      setVersion(result.version);
      setSyncState("saved");
    } catch {
      setSyncState("error");
    }
  }, [document, initial.id, name, save]);

  useEffect(() => {
    if (serializeDraft(name, document) === persistedDraft.current) return;
    setSyncState("saving");
    const timer = window.setTimeout(persist, autosaveDelay);
    return () => window.clearTimeout(timer);
  }, [autosaveDelay, document, name, persist]);

  function updateHeader(changes: Partial<ResumeData["header"]>) {
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

  function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("请选择 JPG、PNG 或 WebP 图片");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("头像不能超过 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDocument((current) => ({
        ...current,
        displayConfig: {
          ...current.displayConfig,
          photo: {
            showPhoto: true,
            photoData: String(reader.result),
          },
        },
      }));
      setPhotoError(undefined);
    };
    reader.readAsDataURL(file);
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
    <div className="min-h-screen bg-[#f7f8f6] print:bg-white">
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur-xl print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/app/resumes"
              aria-label="返回简历列表"
              className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft size={16} />
            </Link>
            <Input
              aria-label="简历名称"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-44 border-transparent bg-transparent font-medium shadow-none hover:border-input focus:border-input sm:w-56"
            />
            <span className="hidden font-[var(--font-data)] text-[10px] text-muted-foreground sm:inline">
              v{version}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              role="status"
              className={cn(
                "hidden text-xs sm:inline-flex",
                syncState === "error"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
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
              <Button size="sm" variant="secondary" onClick={persist}>
                <RefreshCw size={14} />
                重试
              </Button>
            ) : null}
            <Button size="sm" variant="secondary" onClick={exportMarkdown}>
              <FileText size={14} />
              Markdown
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Download size={14} />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-58px)] xl:grid-cols-[300px_minmax(620px,1fr)_260px] print:block print:min-h-0">
        <aside
          aria-label="简历配置"
          className="border-r border-border bg-background xl:max-h-[calc(100vh-58px)] xl:overflow-y-auto print:hidden"
        >
          <PanelTitle
            title="简历配置"
            description="内容与版式修改会自动保存并实时反映到预览。"
          />
          <div className="space-y-5 p-4">
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground">
                基本信息
              </h3>
              <div className="mt-3 space-y-3">
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
            </section>

            <section className="border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground">
                    头像
                  </h3>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    JPG、PNG、WebP，最大 2 MB
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setDocument((current) => ({
                      ...current,
                      displayConfig: {
                        ...current.displayConfig,
                        photo: {
                          ...current.displayConfig.photo,
                          showPhoto:
                            !current.displayConfig.photo.showPhoto,
                        },
                      },
                    }))
                  }
                >
                  {document.displayConfig.photo.showPhoto ? (
                    <Eye size={14} />
                  ) : (
                    <EyeOff size={14} />
                  )}
                  {document.displayConfig.photo.showPhoto ? "显示" : "隐藏"}
                </Button>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-3 transition hover:border-[#9fc5a9] hover:bg-muted/50">
                <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                  {document.displayConfig.photo.photoData ? (
                    <Image
                      src={document.displayConfig.photo.photoData}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound size={22} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <ImagePlus size={13} />
                    上传头像
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    点击选择新图片
                  </span>
                </span>
                <input
                  aria-label="上传头像"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={changePhoto}
                  className="sr-only"
                />
              </label>
              {photoError ? (
                <p role="alert" className="mt-2 text-xs text-destructive">
                  {photoError}
                </p>
              ) : null}
            </section>

            <section className="border-t border-border pt-5">
              <h3 className="text-xs font-semibold text-muted-foreground">
                头部对齐
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    ["left", "左对齐", AlignLeft],
                    ["center", "居中", AlignCenter],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={
                      document.displayConfig.headerAlignment === value
                    }
                    onClick={() =>
                      setDocument((current) => ({
                        ...current,
                        displayConfig: {
                          ...current.displayConfig,
                          headerAlignment: value,
                        },
                      }))
                    }
                    className={cn(
                      "flex h-9 items-center justify-center gap-2 rounded-md border border-border text-xs transition",
                      document.displayConfig.headerAlignment === value
                        ? "border-[#8fc09d] bg-[#edf8f0] text-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <section className="border-t border-border pt-5">
              <h3 className="text-xs font-semibold text-muted-foreground">
                模块与顺序
              </h3>
              <div className="mt-3 space-y-1.5">
                {document.displayConfig.sectionOrder.map((key, index) => {
                  const section =
                    document.displayConfig.sections.find(
                      (item) => item.key === key,
                    );
                  if (!section) return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5"
                    >
                      <button
                        type="button"
                        aria-label={`${section.visible ? "隐藏" : "显示"}${section.label}`}
                        onClick={() => toggleSection(key)}
                        className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {section.visible ? (
                          <Eye size={13} />
                        ) : (
                          <EyeOff size={13} />
                        )}
                      </button>
                      <span
                        className={cn(
                          "flex-1 text-xs",
                          !section.visible && "text-muted-foreground",
                        )}
                      >
                        {section.label}
                      </span>
                      <button
                        type="button"
                        aria-label={`上移${section.label}`}
                        disabled={index === 0}
                        onClick={() => moveSection(key, -1)}
                        className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-25"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label={`下移${section.label}`}
                        disabled={
                          index ===
                          document.displayConfig.sectionOrder.length - 1
                        }
                        onClick={() => moveSection(key, 1)}
                        className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-25"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-border pt-5">
              <h3 className="text-xs font-semibold text-muted-foreground">
                完整内容
              </h3>
              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                教育、项目、实习等结构化字段可在这里完整编辑。
              </p>
              {jsonError ? (
                <p role="alert" className="mt-2 text-xs text-destructive">
                  {jsonError}
                </p>
              ) : null}
              <textarea
                aria-label="简历内容 JSON"
                value={jsonText}
                onChange={(event) => changeJson(event.target.value)}
                spellCheck={false}
                className="mt-3 block min-h-80 w-full resize-y rounded-md border border-border bg-muted/30 px-3 py-3 font-[var(--font-data)] text-[10px] leading-5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </section>
          </div>
        </aside>

        <main
          aria-label="简历预览"
          className="min-w-0 overflow-auto bg-[#edf0eb] p-4 sm:p-8 xl:max-h-[calc(100vh-58px)] print:max-h-none print:overflow-visible print:bg-white print:p-0"
        >
          <ResumePreview document={document} />
        </main>

        <aside
          aria-label="切换简历"
          className="border-l border-border bg-background xl:max-h-[calc(100vh-58px)] xl:overflow-y-auto print:hidden"
        >
          <PanelTitle
            title="所有简历"
            description={`${availableResumes.length} 份简历，点击即可切换`}
          />
          <div className="space-y-2 p-3">
            {availableResumes.map((resume) => {
              const active = resume.id === initial.id;
              return (
                <Link
                  key={resume.id}
                  href={`/app/resumes/${resume.id}`}
                  aria-label={`切换到${resume.name}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group block rounded-lg border p-3 transition",
                    active
                      ? "border-[#8fc09d] bg-[#edf8f0]"
                      : "border-transparent hover:border-border hover:bg-muted/60",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-md border bg-background",
                        active
                          ? "border-[#8fc09d] text-[#3d8c5a]"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <FileText size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {resume.name}
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                        {resume.document.data.header.name || "未填写姓名"} ·
                        v{resume.version}
                      </span>
                    </span>
                    {active ? (
                      <Check
                        size={13}
                        className="mt-1 shrink-0 text-[#3d8c5a]"
                      />
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="sticky bottom-0 mt-auto border-t border-border bg-background p-3">
            <Link
              href="/app/resumes"
              className="flex h-9 items-center justify-center gap-2 rounded-md border border-border text-xs font-medium transition hover:bg-muted"
            >
              <ArrowLeft size={13} />
              返回简历管理
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

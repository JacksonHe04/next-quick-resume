"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ResumeConfigSidebar,
  type ResumeSidebarMode,
} from "@/components/resumes/resume-config-sidebar";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { ResumeTopbar } from "@/components/resumes/resume-topbar";
import { appFetch } from "@/lib/app-fetch";
import { cn } from "@/lib/utils";
import { getEducationItems } from "@/modules/resumes/education";
import { getResumePhotoValidationError } from "@/modules/resumes/photo";
import type { ResumeRecord } from "@/modules/resumes/service";
import type {
  ResumeData,
  ResumeDisplayConfig,
  ResumeDocumentV1,
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
  if (data.header.contact.github) {
    lines.push(
      `- GitHub：[${data.header.contact.github.text}](${data.header.contact.github.url})`,
    );
  }
  if (data.header.contact.homepage) {
    lines.push(
      `- 主页：[${data.header.contact.homepage.text}](${data.header.contact.homepage.url})`,
    );
  }
  if (data.education) {
    lines.push("", `## ${data.education.title}`);
    getEducationItems(data.education).forEach((item) => {
      lines.push(
        "",
        `${item.school} · ${item.period}`,
        "",
        item.details,
      );
    });
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
  const [sidebarMode, setSidebarMode] =
    useState<ResumeSidebarMode>("layout");
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(initial.document.data, null, 2),
  );
  const [jsonError, setJsonError] = useState<string>();
  const [photoError, setPhotoError] = useState<string>();
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320);
  const [resizing, setResizing] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const latestVersion = useRef(initial.version);
  const saveQueue = useRef(Promise.resolve(true));
  const persistedDraft = useRef(
    serializeDraft(initial.name, initial.document),
  );

  const persist = useCallback(async () => {
    const draftName = name;
    const draftDocument = structuredClone(document);
    const serialized = serializeDraft(draftName, draftDocument);
    saveQueue.current = saveQueue.current.then(async () => {
      if (serialized === persistedDraft.current) return true;
      try {
        const result = await save({
          id: initial.id,
          version: latestVersion.current,
          name: draftName,
          document: draftDocument,
        });
        latestVersion.current = result.version;
        persistedDraft.current = serialized;
        return true;
      } catch {
        return false;
      }
    });
    return saveQueue.current;
  }, [document, initial.id, name, save]);

  useEffect(() => {
    if (serializeDraft(name, document) === persistedDraft.current) return;
    const timer = window.setTimeout(() => void persist(), autosaveDelay);
    return () => window.clearTimeout(timer);
  }, [autosaveDelay, document, name, persist]);

  useEffect(() => {
    function move(event: MouseEvent) {
      if (!resizing || !containerRef.current) return;
      const left =
        event.clientX -
        containerRef.current.getBoundingClientRect().left;
      setLeftSidebarWidth(Math.min(440, Math.max(260, left)));
    }
    function stop() {
      setResizing(false);
    }
    if (resizing) {
      window.document.body.style.cursor = "col-resize";
      window.document.body.style.userSelect = "none";
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", stop);
    }
    return () => {
      window.document.body.style.cursor = "";
      window.document.body.style.userSelect = "";
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
  }, [resizing]);

  function updateConfig(config: ResumeDisplayConfig) {
    setDocument((current) => ({ ...current, displayConfig: config }));
  }

  function updateData(data: ResumeData) {
    setDocument((current) => ({ ...current, data }));
    setJsonText(JSON.stringify(data, null, 2));
    setJsonError(undefined);
  }

  function changeJson(value: string) {
    setJsonText(value);
    try {
      const data = JSON.parse(value) as ResumeData;
      setDocument((current) => ({ ...current, data }));
      setJsonError(undefined);
    } catch (error) {
      setJsonError(`JSON格式错误：${(error as Error).message}`);
    }
  }

  function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = getResumePhotoValidationError(file);
    if (validationError) {
      setPhotoError(validationError);
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

  async function copyMarkdown() {
    await navigator.clipboard.writeText(toMarkdown(document.data));
  }

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] flex-col overflow-hidden overscroll-none bg-background print:h-auto print:overflow-visible">
      <ResumeTopbar
        editorHref={`/app/resumes/${initial.id}`}
        name={name}
        onNameChange={setName}
        onExportPdf={() => window.print()}
        onCopyMarkdown={copyMarkdown}
        onToggleLeftSidebar={() =>
          setShowLeftSidebar((current) => !current)
        }
      />

      <main
        ref={containerRef}
        className="relative flex min-h-0 flex-1 overflow-hidden print:block print:overflow-visible"
      >
        {showLeftSidebar ? (
          <button
            type="button"
            aria-label="关闭侧边栏"
            onClick={() => {
              setShowLeftSidebar(false);
            }}
            className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[1px] lg:hidden"
          />
        ) : null}

        <aside
          aria-label="简历配置"
          className={cn(
            "absolute inset-y-0 left-0 z-40 flex h-full shrink-0 flex-col border-r border-border bg-background shadow-xl transition-transform duration-200 ease-out lg:relative lg:translate-x-0 lg:shadow-none print:hidden",
            showLeftSidebar ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ width: leftSidebarWidth }}
        >
          <ResumeConfigSidebar
            currentResumeId={initial.id}
            resumes={availableResumes}
            data={document.data}
            config={document.displayConfig}
            mode={sidebarMode}
            jsonText={jsonText}
            jsonError={jsonError}
            photoError={photoError}
            onModeChange={setSidebarMode}
            onDataChange={updateData}
            onConfigChange={updateConfig}
            onJsonChange={changeJson}
            onPhotoChange={changePhoto}
          />
        </aside>

        <button
          type="button"
          aria-label="调整左侧边栏宽度"
          onMouseDown={() => setResizing(true)}
          className="z-20 hidden w-1 cursor-col-resize bg-border transition-colors hover:bg-foreground/25 lg:block print:hidden"
        />

        <section
          role="main"
          aria-label="简历预览"
          className="relative min-w-0 flex-1 overflow-y-auto overscroll-y-contain bg-muted/35 print:overflow-visible print:bg-transparent"
        >
          <div className="p-4 sm:p-6 md:p-8 print:p-0">
            <ResumePreview document={document} />
          </div>
        </section>
      </main>
    </div>
  );
}

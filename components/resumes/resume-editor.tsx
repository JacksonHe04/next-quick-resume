"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ResumeConfigSidebar } from "@/components/resumes/resume-config-sidebar";
import { ResumeListSidebar } from "@/components/resumes/resume-list-sidebar";
import { ResumePreview } from "@/components/resumes/resume-preview";
import {
  ResumeTopbar,
  type ResumeViewMode,
} from "@/components/resumes/resume-topbar";
import { appFetch } from "@/lib/app-fetch";
import { cn } from "@/lib/utils";
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
  availableResumes = [initial],
  save = saveThroughApi,
  autosaveDelay = 650,
}: {
  initial: ResumeRecord;
  availableResumes?: ResumeRecord[];
  save?: (input: SaveInput) => Promise<SaveResult>;
  autosaveDelay?: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [document, setDocument] = useState<ResumeDocumentV1>(() =>
    structuredClone(initial.document),
  );
  const [syncState, setSyncState] = useState<
    "saved" | "saving" | "error"
  >("saved");
  const [viewMode, setViewMode] = useState<ResumeViewMode>("preview");
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(initial.document.data, null, 2),
  );
  const [jsonError, setJsonError] = useState<string>();
  const [photoError, setPhotoError] = useState<string>();
  const [cloning, setCloning] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const [resizing, setResizing] = useState<"left" | "right">();
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const latestVersion = useRef(initial.version);
  const persistedDraft = useRef(
    serializeDraft(initial.name, initial.document),
  );

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
      setSyncState("saved");
      return true;
    } catch {
      setSyncState("error");
      return false;
    }
  }, [document, initial.id, name, save]);

  useEffect(() => {
    if (serializeDraft(name, document) === persistedDraft.current) return;
    setSyncState("saving");
    const timer = window.setTimeout(() => void persist(), autosaveDelay);
    return () => window.clearTimeout(timer);
  }, [autosaveDelay, document, name, persist]);

  useEffect(() => {
    function move(event: MouseEvent) {
      if (!resizing || !containerRef.current) return;
      if (resizing === "left") {
        setLeftSidebarWidth(
          Math.min(500, Math.max(240, event.clientX)),
        );
        return;
      }
      const right =
        containerRef.current.getBoundingClientRect().right - event.clientX;
      setRightSidebarWidth(Math.min(500, Math.max(240, right)));
    }
    function stop() {
      setResizing(undefined);
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

  async function cloneCurrentResume() {
    if (serializeDraft(name, document) !== persistedDraft.current) {
      const saved = await persist();
      if (!saved) return;
    }
    setCloning(true);
    const response = await appFetch(`/api/resumes/${initial.id}/clone`, {
      method: "POST",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      resume?: ResumeRecord;
    };
    setCloning(false);
    if (!response.ok || !payload.resume) return;
    router.push(`/app/resumes/${payload.resume.id}`);
    router.refresh();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white print:h-auto print:overflow-visible">
      <ResumeTopbar
        name={name}
        viewMode={viewMode}
        syncState={syncState}
        showLeftSidebar={showLeftSidebar}
        onNameChange={setName}
        onViewModeChange={setViewMode}
        onRetry={() => void persist()}
        onExportPdf={() => window.print()}
        onExportMarkdown={exportMarkdown}
        onToggleLeftSidebar={() =>
          setShowLeftSidebar((current) => !current)
        }
        onToggleRightSidebar={() =>
          setShowRightSidebar((current) => !current)
        }
      />

      <main
        ref={containerRef}
        className="flex flex-1 overflow-hidden pt-16 print:block print:overflow-visible print:pt-0"
      >
        {showLeftSidebar || showRightSidebar ? (
          <button
            type="button"
            aria-label="关闭侧边栏"
            onClick={() => {
              setShowLeftSidebar(false);
              setShowRightSidebar(false);
            }}
            className="fixed inset-0 top-16 z-30 bg-black/50 lg:hidden"
          />
        ) : null}

        <aside
          aria-label="简历配置"
          className={cn(
            "fixed inset-y-0 left-0 top-16 z-40 flex h-[calc(100%-64px)] shrink-0 flex-col border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:top-0 lg:h-full lg:translate-x-0 print:hidden",
            showLeftSidebar ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ width: leftSidebarWidth }}
        >
          <ResumeConfigSidebar
            data={document.data}
            config={document.displayConfig}
            viewMode={viewMode}
            jsonText={jsonText}
            jsonError={jsonError}
            photoError={photoError}
            syncState={syncState}
            cloning={cloning}
            onConfigChange={updateConfig}
            onJsonChange={changeJson}
            onPhotoChange={changePhoto}
            onSave={() => void persist()}
            onClone={() => void cloneCurrentResume()}
          />
        </aside>

        <button
          type="button"
          aria-label="调整左侧边栏宽度"
          onMouseDown={() => setResizing("left")}
          className="z-20 hidden w-1 cursor-col-resize bg-gray-300 transition-colors hover:bg-blue-500 lg:block print:hidden"
        />

        <section
          role="main"
          aria-label="简历预览"
          className="relative min-w-0 flex-1 overflow-y-auto bg-gray-50 print:overflow-visible print:bg-transparent"
        >
          <div className="p-4 sm:p-6 md:p-8 print:p-0">
            <ResumePreview document={document} />
          </div>
        </section>

        <button
          type="button"
          aria-label="调整右侧边栏宽度"
          onMouseDown={() => setResizing("right")}
          className="z-20 hidden w-1 cursor-col-resize bg-gray-300 transition-colors hover:bg-blue-500 lg:block print:hidden"
        />

        <aside
          aria-label="切换简历"
          className={cn(
            "fixed inset-y-0 right-0 top-16 z-40 h-[calc(100%-64px)] shrink-0 border-l border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:top-0 lg:h-full lg:translate-x-0 print:hidden",
            showRightSidebar ? "translate-x-0" : "translate-x-full",
          )}
          style={{ width: rightSidebarWidth }}
        >
          <ResumeListSidebar
            currentId={initial.id}
            resumes={availableResumes}
          />
        </aside>
      </main>
    </div>
  );
}

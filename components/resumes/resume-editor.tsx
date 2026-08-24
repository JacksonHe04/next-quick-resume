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
import { ResumeEmptyState } from "@/components/resumes/resume-empty-state";
import { ResumeListSidebar } from "@/components/resumes/resume-list-sidebar";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { ResumeTopbar } from "@/components/resumes/resume-topbar";
import { appFetch } from "@/lib/app-fetch";
import { cn } from "@/lib/utils";
import { createResume } from "@/modules/resumes/client-actions";
import { getEducationItems } from "@/modules/resumes/education";
import {
  compressResumePhoto,
  getResumePhotoValidationError,
} from "@/modules/resumes/photo";
import {
  getAboutPoints,
  migrateEducation,
  normalizeResumeData,
} from "@/modules/resumes/normalize";
import { orderDataBySections } from "@/modules/resumes/section-order";
import type { ResumeRecord } from "@/modules/resumes/service";
import type {
  ResumeData,
  ResumeDisplayConfig,
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

function toMarkdown(data: ResumeData, sectionOrder: ResumeSectionKey[]) {
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
  // 与 JSON 保持一致：markdown 的 section 顺序跟随 sectionOrder
  for (const key of sectionOrder) {
    if (key === "education" && data.education) {
      lines.push("", `## ${data.education.title}`);
      getEducationItems(data.education).forEach((item) => {
        lines.push("", `### ${item.school}`);
        item.entries.forEach((entry) => {
          lines.push(`- ${entry.details} · ${entry.period}`);
        });
      });
    }
    if (key === "intern" && data.intern) {
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
    if (key === "projects" && data.projects) {
      lines.push("", `## ${data.projects.title}`);
      data.projects.items.forEach((item) => {
        lines.push(
          "",
          `### ${item.name}`,
          item.github
            ? `- GitHub：[${item.github}](${item.github})`
            : "",
          item.description,
          ...item.features.map((feature) => `- ${feature}`),
        );
      });
    }
    if (key === "about" && data.about) {
      lines.push("", `## ${data.about.title}`);
      getAboutPoints(data.about).forEach((point) => {
        lines.push(`- ${point}`);
      });
    }
  }
  return lines.join("\n");
}

type SaveState = {
  // 每个保存目标（简历 id）上次已持久化的草稿与版本号
  drafts: Map<string, string>;
  versions: Map<string, number>;
};

function prepareDocument(document: ResumeDocumentV1): ResumeDocumentV1 {
  return {
    ...document,
    data: orderDataBySections(
      migrateEducation(normalizeResumeData(document.data)),
      document.displayConfig.sectionOrder,
    ),
  };
}

export function ResumeEditor({
  initial,
  availableResumes = [initial],
  isGuest = false,
  guestDraft = false,
  save = saveThroughApi,
  autosaveDelay = 650,
}: {
  initial: ResumeRecord;
  availableResumes?: ResumeRecord[];
  isGuest?: boolean;
  // 访客当前编辑的是「新建简历」模板 mock（guestDraft=true）：首次修改时
  // 物化为数据库记录；回访访客（guestDraft=false）的 initial 就是自己设备
  // 下已物化的记录，保存直接打回它，不再二次创建。
  guestDraft?: boolean;
  save?: (input: SaveInput) => Promise<SaveResult>;
  autosaveDelay?: number;
}) {
  const preparedInitial = useState(() => prepareDocument(initial.document))[0];
  const [resumes, setResumes] = useState<ResumeRecord[]>(availableResumes);
  const [currentId, setCurrentId] = useState(initial.id);
  const [name, setName] = useState(initial.name);
  const [document, setDocument] = useState<ResumeDocumentV1>(
    preparedInitial,
  );
  const [sidebarMode, setSidebarMode] =
    useState<ResumeSidebarMode>("layout");
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(preparedInitial.data, null, 2),
  );
  const [jsonError, setJsonError] = useState<string>();
  const [photoError, setPhotoError] = useState<string>();
  const [photoUploading, setPhotoUploading] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [cloneBusy, setCloneBusy] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320);
  const [resizing, setResizing] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const containerRef = useRef<HTMLElement>(null);
  const targetIdRef = useRef(initial.id);
  // 访客模式：模板 mock（guestDraft）首次修改时把 demo 简历物化为数据库
  // 记录；回访访客的 initial 已是该设备下物化的记录，直接以它为保存目标。
  const guestRecordId = useRef<string | undefined>(
    isGuest && !guestDraft ? initial.id : undefined,
  );
  const saveQueue = useRef(Promise.resolve(true));
  const actionErrorTimer = useRef<number | undefined>(undefined);
  // 每个保存目标（简历 id）上次已持久化的草稿与版本号（惰性初始化一次）
  const [saveState] = useState<SaveState>(() => {
    const drafts = new Map<string, string>();
    const versions = new Map<string, number>();
    for (const record of [initial, ...availableResumes]) {
      drafts.set(record.id, serializeDraft(record.name, record.document));
      versions.set(record.id, record.version);
    }
    return { drafts, versions };
  });

  const currentRecord =
    resumes.find((record) => record.id === currentId) ?? initial;
  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/resumes/share/${currentId}`;

  function showActionError(message: string) {
    setActionError(message);
    window.clearTimeout(actionErrorTimer.current);
    actionErrorTimer.current = window.setTimeout(
      () => setActionError(undefined),
      3000,
    );
  }

  // 访客：把 demo 简历物化为数据库记录（并发安全：多条保存路径共享同一队列）
  const materializeQueue = useRef(Promise.resolve<string | undefined>(undefined));

  function materializeGuestResume(
    draftName: string,
    draftDocument: ResumeDocumentV1,
  ): Promise<string> {
    if (guestRecordId.current) return Promise.resolve(guestRecordId.current);
    const task = materializeQueue.current.then(async () => {
      if (guestRecordId.current) return guestRecordId.current!;
      const record = await createResume(draftName, draftDocument);
      guestRecordId.current = record.id;
      const state = saveState;
      state.drafts.set(record.id, serializeDraft(draftName, draftDocument));
      state.versions.set(record.id, record.version);
      setResumes((prev) =>
        prev.some((item) => item.id === record.id)
          ? prev
          : [record, ...prev],
      );
      return record.id;
    });
    materializeQueue.current = task;
    return task;
  }

  const guestSave = useCallback(
    async (input: SaveInput): Promise<SaveResult> => {
      if (guestRecordId.current) {
        return saveThroughApi({ ...input, id: guestRecordId.current });
      }
      const recordId = await materializeGuestResume(input.name, input.document);
      return saveThroughApi({ ...input, id: recordId });
    },
    // materializeGuestResume 每次渲染重建，但其内部只依赖 ref/稳定 state，无需入依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saveState],
  );

  const persist = useCallback(async () => {
    const draftName = name;
    const draftDocument = structuredClone(document);
    const serialized = serializeDraft(draftName, draftDocument);
    const state = saveState;
    const targetId = guestRecordId.current ?? targetIdRef.current;
    if (state.drafts.get(targetId) === serialized) return saveQueue.current;
    const effectiveSave = isGuest ? guestSave : save;
    const task = saveQueue.current.then(async () => {
      if (state.drafts.get(targetId) === serialized) return true;
      try {
        const result = await effectiveSave({
          id: targetId,
          version: state.versions.get(targetId) ?? 1,
          name: draftName,
          document: draftDocument,
        });
        state.versions.set(targetId, result.version);
        state.drafts.set(targetId, serialized);
        return true;
      } catch {
        return false;
      }
    });
    saveQueue.current = task;
    return task;
  }, [document, guestSave, isGuest, name, save, saveState]);

  useEffect(() => {
    const state = saveState;
    const targetId = guestRecordId.current ?? targetIdRef.current;
    if (state.drafts.get(targetId) === serializeDraft(name, document)) return;
    const timer = window.setTimeout(() => void persist(), autosaveDelay);
    return () => window.clearTimeout(timer);
  }, [autosaveDelay, document, name, persist, saveState]);

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

  // 把编辑状态切换到另一份简历：只换名称/文档/JSON，其余（tab、宽度、列表）保持不变
  function applyRecord(record: ResumeRecord) {
    if (record.id === currentId) return;
    void persist(); // 先排队保存当前简历的未落盘修改（闭包捕获的是旧文档）
    targetIdRef.current = record.id;
    const prepared = prepareDocument(record.document);
    setCurrentId(record.id);
    setName(record.name);
    setDocument(prepared);
    setJsonText(JSON.stringify(prepared.data, null, 2));
    setJsonError(undefined);
    setPhotoError(undefined);
    if (!isGuest) {
      window.history.replaceState(null, "", `/resumes/${record.id}`);
    }
  }

  function switchTo(id: string) {
    const record = resumes.find((item) => item.id === id);
    if (record) applyRecord(record);
  }

  function adoptRecord(record: ResumeRecord) {
    setResumes((prev) =>
      prev.some((item) => item.id === record.id)
        ? prev
        : [record, ...prev],
    );
    const state = saveState;
    state.drafts.set(record.id, serializeDraft(record.name, record.document));
    state.versions.set(record.id, record.version);
    applyRecord(record);
  }

  async function createNew() {
    if (isGuest) return;
    try {
      adoptRecord(await createResume("我的简历"));
    } catch {
      showActionError("新建失败，请稍后重试");
    }
  }

  async function cloneCurrent() {
    if (isGuest) return;
    setCloneBusy(true);
    try {
      const record = await createResume(`${name}（副本）`, document);
      // 克隆记录的照片 blob 已由服务端落库；这里把展示用的 data URL 一起带过来
      if (
        !record.document.displayConfig.photo.photoData &&
        document.displayConfig.photo.photoData
      ) {
        record.document.displayConfig.photo.photoData =
          document.displayConfig.photo.photoData;
      }
      adoptRecord(record);
    } catch {
      showActionError("克隆失败，请稍后重试");
    } finally {
      setCloneBusy(false);
    }
  }

  async function toggleShare() {
    if (isGuest) return;
    setShareBusy(true);
    try {
      const response = await appFetch(
        `/api/resumes/${currentId}/public`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ isPublic: !currentRecord.isPublic }),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        resume?: ResumeRecord;
        error?: { message?: string };
      };
      if (!response.ok || !payload.resume) {
        throw new Error(payload.error?.message ?? "公开状态更新失败");
      }
      setResumes((prev) =>
        prev.map((record) =>
          record.id === currentId
            ? { ...record, isPublic: payload.resume!.isPublic }
            : record,
        ),
      );
    } catch {
      showActionError("公开状态更新失败，请稍后重试");
    } finally {
      setShareBusy(false);
    }
  }

  async function removeResume(record: ResumeRecord) {
    try {
      const response = await appFetch(`/api/resumes/${record.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      const remaining = resumes.filter((item) => item.id !== record.id);
      setResumes(remaining);
      saveState.drafts.delete(record.id);
      saveState.versions.delete(record.id);
      if (record.id === currentId) {
        if (remaining.length === 0) {
          if (!isGuest) window.history.replaceState(null, "", "/resumes");
          setCurrentId("");
        } else {
          applyRecord(remaining[0]);
        }
      }
    } catch {
      showActionError("删除失败，请稍后重试");
    }
  }

  function updateConfig(config: ResumeDisplayConfig) {
    setDocument((current) => ({ ...current, displayConfig: config }));
  }

  function updateData(data: ResumeData) {
    const ordered = orderDataBySections(
      data,
      document.displayConfig.sectionOrder,
    );
    setDocument((current) => ({ ...current, data: ordered }));
    setJsonText(JSON.stringify(ordered, null, 2));
    setJsonError(undefined);
  }

  function changeJson(value: string) {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("根节点必须是 JSON 对象");
      }
      // 归一化：补齐缺失字段、收敛教育经历结构，避免预览对 undefined 调 .map
      const data = normalizeResumeData(parsed);
      const ordered = orderDataBySections(
        data,
        document.displayConfig.sectionOrder,
      );
      setDocument((current) => ({ ...current, data: ordered }));
      setJsonError(undefined);
    } catch (error) {
      setJsonError(`JSON格式错误：${(error as Error).message}`);
    }
  }

  // 照片先压缩并上传云端，成功后才更新预览；失败不落任何本地状态
  async function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const validationError = getResumePhotoValidationError(file);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }
    const targetId = targetIdRef.current;
    setPhotoUploading(true);
    setPhotoError(undefined);
    try {
      const photoData = await compressResumePhoto(file);
      const saveTarget = isGuest
        ? await materializeGuestResume(name, document)
        : targetId;
      const response = await appFetch(`/api/resumes/${saveTarget}/photo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ photoData }),
      });
      if (!response.ok) {
        throw new Error("照片上传失败");
      }
      // 上传成功才算成功；若期间已切换到别的简历，则不覆盖当前预览
      if (targetIdRef.current === targetId) {
        setDocument((current) => ({
          ...current,
          displayConfig: {
            ...current.displayConfig,
            photo: { showPhoto: true, photoData },
          },
        }));
      }
    } catch {
      setPhotoError("照片上传失败，请重试或换一张更小的图片");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(
      toMarkdown(document.data, document.displayConfig.sectionOrder),
    );
  }

  if (resumes.length === 0 && currentId === "") {
    return <ResumeEmptyState />;
  }

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] flex-col overflow-hidden overscroll-none bg-background print:h-auto print:overflow-visible">
      <ResumeTopbar
        name={name}
        onNameChange={setName}
        onExportPdf={() => window.print()}
        onCopyMarkdown={copyMarkdown}
        onToggleLeftSidebar={() => setShowLeftSidebar((current) => !current)}
        onToggleRightSidebar={() =>
          setShowRightSidebar((current) => !current)
        }
        canClone={!isGuest}
        cloneBusy={cloneBusy}
        onClone={() => void cloneCurrent()}
        canShare={!isGuest}
        isPublic={isGuest ? false : currentRecord.isPublic}
        shareBusy={shareBusy}
        onToggleShare={() => void toggleShare()}
        shareUrl={isGuest ? "" : shareUrl}
      />

      <main
        ref={containerRef}
        className="relative flex min-h-0 flex-1 overflow-hidden print:block print:overflow-visible"
      >
        {showLeftSidebar ? (
          <button
            type="button"
            aria-label="关闭侧边栏"
            onClick={() => setShowLeftSidebar(false)}
            className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[1px] lg:hidden"
          />
        ) : null}
        {showRightSidebar ? (
          <button
            type="button"
            aria-label="关闭简历列表"
            onClick={() => setShowRightSidebar(false)}
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
            data={document.data}
            config={document.displayConfig}
            mode={sidebarMode}
            jsonText={jsonText}
            jsonError={jsonError}
            photoError={photoError}
            photoUploading={photoUploading}
            onModeChange={setSidebarMode}
            onDataChange={updateData}
            onConfigChange={updateConfig}
            onJsonChange={changeJson}
            onPhotoChange={(event) => void changePhoto(event)}
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

        {!isGuest ? (
          <aside
            aria-label="简历列表"
            className={cn(
              "absolute inset-y-0 right-0 z-40 flex h-full w-72 shrink-0 flex-col border-l border-border bg-background shadow-xl transition-transform duration-200 ease-out lg:relative lg:translate-x-0 lg:shadow-none print:hidden",
              showRightSidebar ? "translate-x-0" : "translate-x-full",
            )}
          >
            <ResumeListSidebar
              currentId={currentId}
              resumes={resumes}
              onSelect={switchTo}
              onCreate={() => void createNew()}
              onDelete={(record) => void removeResume(record)}
            />
          </aside>
        ) : null}
      </main>

      {actionError ? (
        <div
          role="alert"
          className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-destructive/25 bg-background px-4 py-2 text-sm text-destructive shadow-lg"
        >
          {actionError}
        </div>
      ) : null}
    </div>
  );
}

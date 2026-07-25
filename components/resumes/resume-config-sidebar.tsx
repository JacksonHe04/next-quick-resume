"use client";

import {
  AlignCenter,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FilePenLine,
  GripVertical,
  ImagePlus,
  LayoutTemplate,
  List,
} from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";

import { ResumeContentForm } from "@/components/resumes/resume-content-form";
import { ResumeListSidebar } from "@/components/resumes/resume-list-sidebar";
import { cn } from "@/lib/utils";
import type { ResumeRecord } from "@/modules/resumes/service";
import type {
  HeaderAlignment,
  ResumeData,
  ResumeDisplayConfig,
  ResumeSectionKey,
} from "@/types";

export type ResumeSidebarMode = "layout" | "content" | "resumes";

const sidebarModes = [
  ["layout", "版式", LayoutTemplate],
  ["content", "内容", FilePenLine],
  ["resumes", "简历列表", List],
] as const;

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-[#4d9669]" : "bg-muted-foreground/25",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

export function ResumeConfigSidebar({
  currentResumeId,
  resumes,
  data,
  config,
  mode,
  jsonText,
  jsonError,
  photoError,
  onModeChange,
  onDataChange,
  onConfigChange,
  onJsonChange,
  onPhotoChange,
}: {
  currentResumeId: string;
  resumes: ResumeRecord[];
  data: ResumeData;
  config: ResumeDisplayConfig;
  mode: ResumeSidebarMode;
  jsonText: string;
  jsonError?: string;
  photoError?: string;
  onModeChange: (mode: ResumeSidebarMode) => void;
  onDataChange: (data: ResumeData) => void;
  onConfigChange: (config: ResumeDisplayConfig) => void;
  onJsonChange: (value: string) => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function updateAlignment(alignment: HeaderAlignment) {
    onConfigChange({ ...config, headerAlignment: alignment });
  }

  function toggleSection(key: ResumeSectionKey) {
    onConfigChange({
      ...config,
      sections: config.sections.map((section) =>
        section.key === key
          ? { ...section, visible: !section.visible }
          : section,
      ),
    });
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= config.sectionOrder.length) return;
    const sectionOrder = [...config.sectionOrder];
    [sectionOrder[index], sectionOrder[target]] = [
      sectionOrder[target],
      sectionOrder[index],
    ];
    onConfigChange({ ...config, sectionOrder });
  }

  function moveDraggedSection(target: number) {
    if (draggedIndex === null || draggedIndex === target) return;
    const sectionOrder = [...config.sectionOrder];
    const [moved] = sectionOrder.splice(draggedIndex, 1);
    sectionOrder.splice(target, 0, moved);
    onConfigChange({ ...config, sectionOrder });
    setDraggedIndex(target);
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <nav
        aria-label="简历编辑面板"
        className="grid grid-cols-3 gap-1 border-b border-border p-2"
      >
        {sidebarModes.map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            title={label}
            aria-current={mode === value ? "page" : undefined}
            onClick={() => onModeChange(value)}
            className={cn(
              "grid h-8 place-items-center rounded-md transition-colors",
              mode === value
                ? "bg-muted text-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {mode === "layout" ? (
          <>
            <div className="grid gap-5 border-b border-border p-4">
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-label="头部对齐方式"
              >
                {(
                  [
                    ["left", "靠左对齐", AlignLeft],
                    ["center", "居中对齐", AlignCenter],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={label}
                    title={label}
                    onClick={() => updateAlignment(value)}
                    className={cn(
                      "grid h-9 place-items-center rounded-md border transition-colors",
                      config.headerAlignment === value
                        ? "border-[#55a572]/50 bg-[#55a572]/10 text-[#34734c]"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">显示照片</span>
                <Switch
                  label="显示照片"
                  checked={config.photo.showPhoto}
                  onChange={(showPhoto) =>
                    onConfigChange({
                      ...config,
                      photo: { ...config.photo, showPhoto },
                    })
                  }
                />
              </div>

              {config.photo.showPhoto ? (
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-3 transition hover:border-[#55a572]/60 hover:bg-[#55a572]/5">
                  <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                    {config.photo.photoData ? (
                      <Image
                        src={config.photo.photoData}
                        alt=""
                        width={56}
                        height={56}
                        unoptimized
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="size-5" />
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    上传照片
                  </span>
                  <input
                    aria-label="上传头像"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onPhotoChange}
                    className="sr-only"
                  />
                </label>
              ) : null}
              {photoError ? (
                <p role="alert" className="text-xs text-destructive">
                  {photoError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 p-4">
              {config.sectionOrder.map((key, index) => {
                const section = config.sections.find(
                  (item) => item.key === key,
                );
                if (!section) return null;
                return (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => setDraggedIndex(index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      moveDraggedSection(index);
                    }}
                    className={cn(
                      "flex cursor-move items-center gap-2 rounded-lg border border-border bg-muted/25 p-3 transition-opacity",
                      draggedIndex === index && "opacity-50",
                      !section.visible && "opacity-60",
                    )}
                  >
                    <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {section.label}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        aria-label={`上移${section.label}`}
                        disabled={index === 0}
                        onClick={() => moveSection(index, -1)}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        aria-label={`下移${section.label}`}
                        disabled={index === config.sectionOrder.length - 1}
                        onClick={() => moveSection(index, 1)}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="size-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`${section.visible ? "隐藏" : "显示"}${section.label}`}
                      onClick={() => toggleSection(key)}
                      className={cn(
                        "rounded-md p-1.5 transition-colors",
                        section.visible
                          ? "text-[#3d8c5a] hover:bg-[#55a572]/10"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {section.visible ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {mode === "content" ? (
          <>
            <ResumeContentForm data={data} onChange={onDataChange} />
            <details className="border-t border-border">
              <summary
                aria-label="JSON 编辑区域"
                className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground marker:hidden"
              >
                JSON
              </summary>
              <div className="px-4 pb-4">
                {jsonError ? (
                  <div
                    role="alert"
                    className="mb-3 rounded-md border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive"
                  >
                    {jsonError}
                  </div>
                ) : null}
                <textarea
                  aria-label="简历内容 JSON"
                  value={jsonText}
                  onChange={(event) => onJsonChange(event.target.value)}
                  spellCheck={false}
                  className="min-h-96 w-full resize-y rounded-lg border border-input bg-muted/25 p-3 font-[var(--font-data)] text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </details>
          </>
        ) : null}

        {mode === "resumes" ? (
          <ResumeListSidebar
            currentId={currentResumeId}
            resumes={resumes}
          />
        ) : null}
      </div>
    </div>
  );
}

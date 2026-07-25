"use client";

import {
  AlignCenter,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
} from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";

import { cn } from "@/lib/utils";
import type {
  HeaderAlignment,
  ResumeData,
  ResumeDisplayConfig,
  ResumeSectionKey,
} from "@/types";
import type { ResumeViewMode } from "./resume-topbar";

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
  data,
  config,
  viewMode,
  jsonText,
  jsonError,
  photoError,
  syncState,
  cloning,
  onConfigChange,
  onJsonChange,
  onPhotoChange,
  onSave,
  onClone,
}: {
  data: ResumeData;
  config: ResumeDisplayConfig;
  viewMode: ResumeViewMode;
  jsonText: string;
  jsonError?: string;
  photoError?: string;
  syncState: "saved" | "saving" | "error";
  cloning: boolean;
  onConfigChange: (config: ResumeDisplayConfig) => void;
  onJsonChange: (value: string) => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onClone: () => void;
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
      <div className="flex-1 overflow-y-auto">
        {viewMode === "preview" ? (
          <>
            <div className="border-b border-border p-4">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                头部样式设置
              </h2>

              <div className="mb-6 space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  对齐方式
                </h3>
                <div className="flex gap-2">
                  {(
                    [
                      ["left", "靠左对齐", AlignLeft],
                      ["center", "居中对齐", AlignCenter],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateAlignment(value)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 transition-all",
                        config.headerAlignment === value
                          ? "border-[#55a572]/50 bg-[#55a572]/10 text-[#34734c]"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    显示照片
                  </h3>
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
                      上传个人照片
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
            </div>

            <div className="p-4">
              <h2 className="mb-3 text-sm font-medium text-foreground">
                模块管理
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                拖拽调整顺序，点击眼睛图标切换显隐
              </p>
              <div className="space-y-2">
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
                        "flex cursor-move items-center gap-2 rounded-lg border border-border bg-muted/35 p-3 transition-all duration-200",
                        draggedIndex === index && "opacity-50",
                        !section.visible && "bg-muted/70",
                      )}
                    >
                      <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                      <span
                        className={cn(
                          "flex-1 text-sm font-medium",
                          section.visible
                            ? "text-foreground"
                            : "text-muted-foreground/65",
                        )}
                      >
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
              <div className="mt-4 rounded-lg border border-border bg-muted/45 p-3">
                <p className="text-xs leading-5 text-muted-foreground">
                  <strong>提示：</strong>
                  隐藏的模块不会显示在简历中，但数据仍然保留。
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">JSON编辑</h2>
              <span className="text-xs text-muted-foreground">
                {data.header.name}
              </span>
            </div>
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
              className="min-h-96 flex-1 resize-none rounded-lg border border-input bg-muted/35 p-3 font-[var(--font-data)] text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              直接编辑 JSON 数据，修改后会实时同步到简历预览。
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-border p-4">
        <button
          type="button"
          onClick={onSave}
          disabled={syncState === "saving"}
          className="h-9 w-full rounded-lg bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {syncState === "saving" ? "保存中..." : "保存简历"}
        </button>
        <button
          type="button"
          onClick={onClone}
          disabled={cloning}
          className="h-9 w-full rounded-lg border border-border bg-background text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
        >
          {cloning ? "克隆中..." : "克隆简历"}
        </button>
        <div className="border-t border-border pt-2 text-center text-xs">
          <span
            className={cn(
              syncState === "error" ? "text-destructive" : "text-[#3d8c5a]",
            )}
          >
            {syncState === "error"
              ? "保存失败，请重试"
              : "当前：已保存简历"}
          </span>
        </div>
      </div>
    </div>
  );
}

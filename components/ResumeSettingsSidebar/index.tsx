'use client'

import React, { useRef } from 'react'
import { Button } from '@/components/ui'
import { ResumeSectionKey, ResumeSettings } from '@/types'
import { SECTION_LABELS } from '@/utils/resumeSettings'

interface ResumeSettingsSidebarProps {
  isOpen: boolean
  onClose: () => void
  settings: ResumeSettings
  avatar?: string
  onSettingsChange: (settings: ResumeSettings) => void
  onAvatarChange: (avatar: string | null) => void
  onFitOnePage: () => void
}

const FONT_OPTIONS = [
  {
    label: '经典衬线（推荐）',
    value: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", serif'
  },
  {
    label: '现代无衬线',
    value: '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Helvetica Neue", Arial, sans-serif'
  },
  {
    label: '简洁中性',
    value: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif'
  }
]

const clampLineHeight = (value: number) => Math.min(1.8, Math.max(1.1, value))

export default function ResumeSettingsSidebar({
  isOpen,
  onClose,
  settings,
  avatar,
  onSettingsChange,
  onAvatarChange,
  onFitOnePage
}: ResumeSettingsSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleMoveSection = (section: ResumeSectionKey, direction: 'up' | 'down') => {
    const currentIndex = settings.sectionOrder.indexOf(section)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= settings.sectionOrder.length) return

    const nextOrder = [...settings.sectionOrder]
    ;[nextOrder[currentIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[currentIndex]]

    onSettingsChange({
      ...settings,
      sectionOrder: nextOrder
    })
  }

  const handleToggleSection = (section: ResumeSectionKey) => {
    onSettingsChange({
      ...settings,
      sectionVisibility: {
        ...settings.sectionVisibility,
        [section]: !settings.sectionVisibility[section]
      }
    })
  }

  const handleFontChange = (value: string) => {
    onSettingsChange({
      ...settings,
      typography: {
        ...settings.typography,
        fontFamily: value
      }
    })
  }

  const handleLineHeightChange = (value: number) => {
    onSettingsChange({
      ...settings,
      typography: {
        ...settings.typography,
        lineHeight: clampLineHeight(value)
      }
    })
  }

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAvatarChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="fixed inset-0 z-40 no-print" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <aside className="absolute left-0 top-0 h-full w-[340px] bg-white shadow-2xl border-r border-slate-200 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">简历配置</p>
            <h2 className="text-lg font-semibold text-slate-900 mt-1">布局与样式</h2>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose} className="!w-8 !h-8 !p-0 rounded-full">
            ×
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">头像</h3>
              <p className="text-xs text-slate-500 mt-1">上传后将随简历一起存储在浏览器数据库。</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                {avatar ? (
                  <img src={avatar} alt="头像预览" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">无头像</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="primary" size="sm" onClick={triggerAvatarUpload}>
                  上传头像
                </Button>
                <Button variant="secondary" size="xs" onClick={() => onAvatarChange(null)}>
                  移除头像
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">内容显示与排序</h3>
              <p className="text-xs text-slate-500 mt-1">控制模块显示与顺序。</p>
            </div>
            <div className="space-y-2">
              {settings.sectionOrder.map((section) => (
                <div
                  key={section}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.sectionVisibility[section]}
                      onChange={() => handleToggleSection(section)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                    />
                    <span className="text-sm text-slate-800">{SECTION_LABELS[section]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveSection(section, 'up')}
                      className="w-7 h-7 rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      aria-label="上移"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveSection(section, 'down')}
                      className="w-7 h-7 rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      aria-label="下移"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">字体与行间距</h3>
              <p className="text-xs text-slate-500 mt-1">影响整体视觉密度与风格。</p>
            </div>
            <div className="space-y-3">
              <label className="text-xs text-slate-500">字体</label>
              <select
                value={settings.typography.fontFamily}
                onChange={(event) => handleFontChange(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                {FONT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>行间距</span>
                <span>{settings.typography.lineHeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={1.1}
                max={1.8}
                step={0.05}
                value={settings.typography.lineHeight}
                onChange={(event) => handleLineHeightChange(Number(event.target.value))}
                className="w-full accent-slate-800"
              />
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button variant="primary" block onClick={onFitOnePage}>
            一键适配一页 A4
          </Button>
          <p className="text-xs text-slate-500 mt-2">将自动调整行间距与缩放比例。</p>
        </div>
      </aside>
    </div>
  )
}

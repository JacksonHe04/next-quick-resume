'use client'

import React, { useState, useCallback, useRef } from 'react'
import { ResumeConfig } from '@/types'
import { SECTION_LABELS, getDefaultConfig } from '@/config/data'

interface ConfigSidebarProps {
  /** 侧边栏是否打开 */
  isOpen: boolean
  /** 关闭侧边栏回调 */
  onClose: () => void
  /** 当前简历配置 */
  config: ResumeConfig
  /** 配置变更回调 */
  onConfigChange: (config: ResumeConfig) => void
  /** 头像 base64 */
  avatarBase64?: string
  /** 头像变更回调 */
  onAvatarChange: (base64: string | undefined) => void
  /** 一键一页回调 */
  onFitOnePage: () => void
}

/**
 * 简历配置侧边栏组件
 * 提供模块显隐、排序、字体、行间距等配置功能
 */
export default function ConfigSidebar({
  isOpen,
  onClose,
  config,
  onConfigChange,
  avatarBase64,
  onAvatarChange,
  onFitOnePage,
}: ConfigSidebarProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 更新配置的通用方法
   */
  const updateConfig = useCallback(
    (partial: Partial<ResumeConfig>) => {
      onConfigChange({ ...config, ...partial })
    },
    [config, onConfigChange]
  )

  /**
   * 切换模块显隐
   */
  const toggleVisibility = useCallback(
    (key: string) => {
      // header 始终显示
      if (key === 'header') return
      const newVisibility = {
        ...config.sectionVisibility,
        [key]: !config.sectionVisibility[key],
      }
      updateConfig({ sectionVisibility: newVisibility })
    },
    [config.sectionVisibility, updateConfig]
  )

  /**
   * 拖拽排序处理
   */
  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const newOrder = [...config.sectionOrder]
    const [moved] = newOrder.splice(dragIndex, 1)
    newOrder.splice(index, 0, moved)
    updateConfig({ sectionOrder: newOrder })
    setDragIndex(index)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
  }

  /**
   * 处理头像上传
   */
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      onAvatarChange(base64)
    }
    reader.readAsDataURL(file)
    // 清空 input 以便重复上传同一文件
    e.target.value = ''
  }

  /**
   * 重置为默认配置
   */
  const handleReset = () => {
    onConfigChange(getDefaultConfig())
  }

  // 字体选项
  const fontOptions = [
    { value: 'serif', label: '宋体 / Times New Roman' },
    { value: 'sans-serif', label: '黑体 / Arial' },
    { value: '"Microsoft YaHei", sans-serif', label: '微软雅黑' },
    { value: '"SimSun", serif', label: '宋体' },
    { value: '"KaiTi", serif', label: '楷体' },
    { value: 'monospace', label: '等宽字体' },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/20 z-40 no-print"
        onClick={onClose}
      />

      {/* 侧边栏 */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col no-print overflow-hidden border-r border-gray-200">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">简历配置</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto">
          {/* 照片上传 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">个人照片</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="头像" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    无照片
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                >
                  上传照片
                </button>
                {avatarBase64 && (
                  <button
                    onClick={() => onAvatarChange(undefined)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    移除照片
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* 模块顺序与显隐 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">模块顺序与显隐</h3>
            <p className="text-xs text-gray-400 mb-3">拖拽调整顺序，点击开关控制显隐</p>
            <div className="space-y-1.5">
              {config.sectionOrder.map((key, index) => (
                <div
                  key={key}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                    dragIndex === index
                      ? 'border-gray-400 bg-gray-100 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-sm">⠿</span>
                    <span className="text-sm text-gray-700">
                      {SECTION_LABELS[key] || key}
                    </span>
                  </div>
                  {key !== 'header' ? (
                    <button
                      onClick={() => toggleVisibility(key)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        config.sectionVisibility[key]
                          ? 'bg-gray-900'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          config.sectionVisibility[key]
                            ? 'translate-x-4'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">始终显示</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 字体设置 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">字体设置</h3>
            <select
              value={config.fontFamily || 'serif'}
              onChange={(e) => updateConfig({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              {fontOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 字体大小 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">字体大小</h3>
              <span className="text-xs text-gray-500">{config.fontSize || 16}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="20"
              step="1"
              value={config.fontSize || 16}
              onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
              className="w-full accent-gray-900"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>12px</span>
              <span>20px</span>
            </div>
          </div>

          {/* 行间距 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">行间距</h3>
              <span className="text-xs text-gray-500">{config.lineHeight || 1.5}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={config.lineHeight || 1.5}
              onChange={(e) => updateConfig({ lineHeight: Number(e.target.value) })}
              className="w-full accent-gray-900"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* 一键一页 */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">页面适配</h3>
            <button
              onClick={onFitOnePage}
              className="w-full px-4 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              📄 一键适配一页
            </button>
            <p className="text-xs text-gray-400 mt-2">
              智能调整字体大小和行间距，使简历适合一页 A4 纸打印
            </p>
          </div>

          {/* 重置配置 */}
          <div className="px-5 py-4">
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重置为默认配置
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

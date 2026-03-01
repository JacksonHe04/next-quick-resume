'use client'

import React, { useState, useCallback } from 'react'
import { ResumeDisplayConfig, ResumeSectionKey } from '@/types'
import { Eye, EyeOff, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'

/**
 * 模块管理组件属性接口
 */
interface SectionManagerProps {
  /** 当前配置 */
  config: ResumeDisplayConfig
  /** 可见性变更回调 */
  onVisibilityChange: (key: ResumeSectionKey, visible: boolean) => void
  /** 排序变更回调 */
  onOrderChange: (newOrder: ResumeSectionKey[]) => void
}

/**
 * 模块管理组件
 * 
 * 提供简历各模块的显隐控制和拖拽排序功能
 */
export function SectionManager({
  config,
  onVisibilityChange,
  onOrderChange
}: SectionManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  /**
   * 获取按顺序排列的模块列表
   */
  const sortedSections = config.sectionOrder
    .map(key => config.sections.find(s => s.key === key))
    .filter(Boolean)

  /**
   * 处理拖拽开始
   */
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
  }, [])

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newOrder = [...config.sectionOrder]
    const [removed] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(index, 0, removed)

    onOrderChange(newOrder as ResumeSectionKey[])
    setDraggedIndex(index)
  }, [draggedIndex, config.sectionOrder, onOrderChange])

  /**
   * 上移模块
   */
  const moveUp = useCallback((index: number) => {
    if (index === 0) return
    const newOrder = [...config.sectionOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    onOrderChange(newOrder as ResumeSectionKey[])
  }, [config.sectionOrder, onOrderChange])

  /**
   * 下移模块
   */
  const moveDown = useCallback((index: number) => {
    if (index === config.sectionOrder.length - 1) return
    const newOrder = [...config.sectionOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    onOrderChange(newOrder as ResumeSectionKey[])
  }, [config.sectionOrder, onOrderChange])

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">模块管理</h3>
      <p className="text-xs text-gray-500 mb-4">
        拖拽调整顺序，点击眼睛图标切换显隐
      </p>

      <div className="space-y-2">
        {sortedSections.map((section, index) => {
          if (!section) return null

          return (
            <div
              key={section.key}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move transition-all duration-200 ${
                draggedIndex === index ? 'opacity-50' : 'opacity-100'
              } ${!section.visible ? 'bg-gray-100' : ''}`}
            >
              {/* 拖拽手柄 */}
              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

              {/* 模块名称 */}
              <span
                className={`flex-1 text-sm font-medium ${
                  section.visible ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {section.label}
              </span>

              {/* 排序按钮 */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="上移"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === sortedSections.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="下移"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* 显隐切换按钮 */}
              <button
                onClick={() => onVisibilityChange(section.key, !section.visible)}
                className={`p-1.5 rounded-md transition-colors ${
                  section.visible
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-400 hover:bg-gray-200'
                }`}
                title={section.visible ? '隐藏' : '显示'}
              >
                {section.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* 提示信息 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700">
          <strong>提示：</strong>
          隐藏的模块将不会显示在简历中，但数据仍然保留。
        </p>
      </div>
    </div>
  )
}

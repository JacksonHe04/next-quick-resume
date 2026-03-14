'use client'

import React, { useCallback } from 'react'
import { ResumeData, ResumeDisplayConfig, HeaderAlignment } from '@/types'
import { Button } from '@/components/ui'
import { SectionManager } from './components/SectionManager'
import { JsonEditor } from './components/JsonEditor'
import { HeaderConfig } from './components/HeaderConfig'
import { useResumeSidebar } from './hooks/useResumeSidebar'

/**
 * 视图模式类型
 */
type ViewMode = 'preview' | 'edit'

/**
 * 简历侧边栏组件属性接口
 */
interface ResumeSidebarProps {
  /** 当前简历数据 */
  resumeData: ResumeData
  /** 当前简历配置 */
  config: ResumeDisplayConfig
  /** 是否为模板简历 */
  isTemplate: boolean
  /** 当前简历记录ID */
  recordId?: string
  /** 当前视图模式 */
  viewMode: ViewMode
  /** 配置变更回调 */
  onConfigChange: (config: ResumeDisplayConfig) => void
  /** 数据变更回调（编辑模式） */
  onDataChange?: (data: ResumeData) => void
  /** 强制刷新回调 */
  onRefresh: () => void
}

/**
 * 简历侧边栏组件
 * 
 * 提供以下功能：
 * 1. 简历属性管理（显隐控制、拖拽排序）- 预览模式
 * 2. JSON 编辑器 - 编辑模式
 * 3. 配置数据持久化
 * 4. 简历克隆
 * 5. 智能保存
 */
export default function ResumeSidebar({
  resumeData,
  config,
  isTemplate,
  recordId,
  viewMode,
  onConfigChange,
  onDataChange,
  onRefresh
}: ResumeSidebarProps) {
  const {
    localConfig,
    isSaving,
    isCloning,
    saveMessage,
    updateSectionVisibility,
    updateSectionOrder,
    updateHeaderAlignment,
    updatePhotoConfig,
    saveConfig,
    cloneResume
  } = useResumeSidebar({
    config,
    resumeData,
    isTemplate,
    recordId,
    onConfigChange,
    onRefresh
  })

  /**
   * 处理JSON数据变更
   */
  const handleJsonChange = useCallback((newData: ResumeData) => {
    onDataChange?.(newData)
  }, [onDataChange])

  return (
    <aside className="h-full w-full bg-white flex flex-col print:hidden">
      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'preview' ? (
          <>
            <HeaderConfig
              alignment={localConfig.headerAlignment || 'left'}
              photo={localConfig.photo || { showPhoto: true }}
              onAlignmentChange={updateHeaderAlignment}
              onShowPhotoChange={(show) => updatePhotoConfig({ showPhoto: show })}
              onPhotoDataChange={(photoData) => updatePhotoConfig({ photoData })}
            />
            <SectionManager
              config={localConfig}
              onVisibilityChange={updateSectionVisibility}
              onOrderChange={updateSectionOrder}
            />
          </>
        ) : (
          <JsonEditor
            data={resumeData}
            onChange={handleJsonChange}
          />
        )}
      </div>

      {/* 底部操作按钮 */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* 保存按钮 - 始终可点击（模板简历除外） */}
        <Button
          variant="primary"
          size="md"
          onClick={saveConfig}
          disabled={isTemplate || isSaving}
          className="w-full"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              保存中...
            </span>
          ) : (
            '保存简历'
          )}
        </Button>

        {/* 克隆按钮 */}
        <Button
          variant="info"
          size="md"
          onClick={cloneResume}
          disabled={isCloning}
          className="w-full"
        >
          {isCloning ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              克隆中...
            </span>
          ) : (
            '克隆简历'
          )}
        </Button>

        {/* 状态提示 */}
        {saveMessage && (
          <div
            className={`text-sm text-center py-2 px-3 rounded ${
              saveMessage.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* 简历状态信息 */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          {isTemplate ? (
            <span className="text-orange-600">当前：模板简历</span>
          ) : (
            <span className="text-green-600">当前：已保存简历</span>
          )}
        </div>
      </div>
    </aside>
  )
}

export type { ViewMode }

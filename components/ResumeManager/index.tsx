'use client'

import React, { useEffect, useState } from 'react'
import { ResumeData } from '@/types'
import { Button } from '@/components/ui'
import {
  useResumeData,
  useFileRecords,
  useResumeEditor,
  type UnifiedRecord
} from './hooks'
import {
  TabNavigation,
  DatabaseResumeList,
  FileResumeList,
  ResumeEditor,
  type TabType
} from './components'

/**
 * 简历管理组件属性接口
 */
interface ResumeManagerProps {
  /** 弹窗是否打开 */
  isOpen: boolean
  /** 关闭弹窗回调 */
  onClose: () => void
  /** 选择简历回调 */
  onSelectResume: (resumeData: ResumeData) => void
}

/**
 * 简历管理组件 - 重构后的版本
 * 提供IndexedDB中简历数据的增删改查功能，支持文件记录浏览
 * 
 * @example
 * ```tsx
 * <ResumeManager
 *   isOpen={showManager}
 *   onClose={() => setShowManager(false)}
 *   onSelectResume={(data) => {
 *     setCurrentResumeData(data)
 *     setShowManager(false)
 *   }}
 * />
 * ```
 */
export default function ResumeManager({ isOpen, onClose, onSelectResume }: ResumeManagerProps) {
  // 标签状态
  const [activeTab, setActiveTab] = useState<TabType>('database')
  
  // 使用自定义 hooks
  const resumeData = useResumeData()
  const fileRecords = useFileRecords()
  const editor = useResumeEditor()



  /**
   * 业务逻辑处理函数
   */
  const handlers = {
    // 编辑相关
    startEditing: (record: UnifiedRecord | null = null) => {
      editor.startEditing(record)
    },
    
    createFromTemplate: (template: UnifiedRecord) => {
      editor.startEditingFromTemplate(template)
    },
    
    saveResume: async () => {
      const success = await editor.saveResume(resumeData.createResume, resumeData.updateResumeComplete)
      if (success) {
        await resumeData.loadResumes()
      }
    },
    
    cancelEditing: () => {
      editor.cancelEditing()
    },
    
    // 简历操作
    deleteResume: async (id: string) => {
      const success = await resumeData.deleteResumeById(id)
      if (success) {
        await resumeData.loadResumes()
      }
    },
    
    useResume: (data: ResumeData) => {
      onSelectResume(data)
      onClose()
    },
    
    // 标签切换
    switchTab: (tab: TabType) => {
      setActiveTab(tab)
    }
  }

  // 当弹窗打开时加载数据
  useEffect(() => {
    if (isOpen) {
      resumeData.loadResumes()
      fileRecords.loadFileRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resumeData.loadResumes, fileRecords.loadFileRecords])

  // 如果弹窗未打开，不渲染任何内容
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-[90vw] h-[80vh] max-w-6xl flex flex-col shadow-2xl border border-gray-200">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">简历管理</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="!w-8 !h-8 !p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            ×
          </Button>
        </div>

        {/* 主体内容 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：简历列表 */}
          <div className="w-1/2 border-r border-gray-100 flex flex-col bg-gray-50">
            {/* 标签导航 */}
            <div className="bg-white border-b border-gray-100">
              <TabNavigation
                activeTab={activeTab}
                onTabChange={handlers.switchTab}
                databaseCount={resumeData.resumes?.length || 0}
                fileCount={fileRecords.fileRecords?.length || 0}
              />
            </div>

            {/* 列表内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'database' && (
                <DatabaseResumeList
                  resumes={resumeData.resumes || []}
                  loading={resumeData.loading}
                  onUse={handlers.useResume}
                  onUseResume={handlers.useResume}
                  onCreateFromTemplate={handlers.createFromTemplate}
                  onEdit={handlers.startEditing}
                  onCopy={handlers.createFromTemplate}
                  onDelete={handlers.deleteResume}
                  onNew={() => handlers.startEditing(null)}
                />
              )}

              {activeTab === 'files' && (
                <FileResumeList
                  fileRecords={fileRecords.fileRecords || []}
                  loading={fileRecords.loading}
                  onUse={handlers.useResume}
                  onUseResume={handlers.useResume}
                  onCreateFromTemplate={handlers.createFromTemplate}
                  onCopy={handlers.createFromTemplate}
                />
              )}
            </div>
          </div>

          {/* 右侧：编辑区域 */}
          <div className="w-1/2 flex flex-col">
            <ResumeEditor
              isEditing={editor.isEditing}
              selectedRecord={editor.selectedRecord}
              editingName={editor.editingName}
              editingData={editor.editingData}
              error={editor.error}
              loading={resumeData.loading}
              onNameChange={editor.updateEditingName}
              onDataChange={editor.updateEditingData}
              onSave={handlers.saveResume}
              onCancel={handlers.cancelEditing}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import React, { useEffect, useState } from 'react'
import { ResumeData, ResumeDisplayConfig } from '@/types'
import { Button } from '@/components/ui'
import {
  useResumeData,
  useFileRecords
} from './hooks'
import {
  TabNavigation,
  DatabaseResumeList,
  FileResumeList,
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
  onSelectResume: (resumeData: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => void
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
 *   onSelectResume={(data, recordId, config) => {
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

  /**
   * 业务逻辑处理函数
   */
  const handlers = {
    // 简历操作
    deleteResume: async (id: string) => {
      const success = await resumeData.deleteResumeById(id)
      if (success) {
        await resumeData.loadResumes()
      }
    },
    
    useResume: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => {
      onSelectResume(data, recordId, config)
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

  /**
   * 处理背景点击事件 - 点击外部区域关闭弹窗
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
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
                  onDelete={handlers.deleteResume}
                />
              )}

              {activeTab === 'files' && (
                <FileResumeList
                  fileRecords={fileRecords.fileRecords || []}
                  loading={fileRecords.loading}
                  onUse={handlers.useResume}
                  onUseResume={handlers.useResume}
                />
              )}
            </div>
          </div>

          {/* 右侧：提示信息区域（替代原来的编辑区域） */}
          <div className="w-1/2 flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="text-center max-w-md">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">简历编辑已移至侧边栏</h3>
              <p className="text-sm text-gray-500 mb-4">
                现在您可以在主界面的左侧边栏中进行简历编辑、模块管理和配置保存。
                选择左侧列表中的简历，然后点击&ldquo;使用&rdquo;按钮即可开始编辑。
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>💡 提示：侧边栏提供以下功能</p>
                <ul className="list-disc list-inside text-left inline-block">
                  <li>模块显隐控制</li>
                  <li>拖拽排序</li>
                  <li>JSON 编辑</li>
                  <li>配置保存</li>
                  <li>简历克隆</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

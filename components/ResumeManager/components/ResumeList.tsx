/**
 * 简历列表组件
 * 统一管理数据库记录和文件记录的列表显示
 */

import React from 'react'
import { ResumeRecord } from '@/utils/indexedDB'
import { FileRecord, UnifiedRecord } from '../hooks'
import { DatabaseRecordActions, FileRecordActions } from './ActionButtons'
import { ResumeData } from '@/types'

/**
 * 简历列表组件基础属性
 */
interface BaseResumeListProps {
  /** 是否加载中 */
  loading: boolean
  /** 使用简历回调 */
  onUseResume: (data: ResumeData) => void
  /** 从模板创建回调 */
  onCreateFromTemplate: (template: UnifiedRecord) => void
}

/**
 * 数据库记录列表组件属性
 */
export interface DatabaseResumeListProps extends BaseResumeListProps {
  /** 简历记录列表 */
  resumes: ResumeRecord[]
  /** 编辑简历回调 */
  onEdit: (record: UnifiedRecord) => void
  /** 删除简历回调 */
  onDelete: (id: string) => void
  /** 使用简历回调 */
  onUse: (data: ResumeData) => void
  /** 复制简历回调 */
  onCopy: (template: UnifiedRecord) => void
  /** 新建简历回调 */
  onNew: () => void
}

/**
 * 文件记录列表组件属性
 */
export interface FileResumeListProps extends BaseResumeListProps {
  /** 文件记录列表 */
  fileRecords: FileRecord[]
  /** 使用简历回调 */
  onUse: (data: ResumeData) => void
  /** 复制到数据库回调 */
  onCopy: (template: UnifiedRecord) => void
}

/**
 * 空状态组件
 */
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center text-gray-500 py-8">
    {message}
  </div>
)

/**
 * 加载状态组件
 */
const LoadingState: React.FC = () => (
  <div className="text-center text-gray-500 py-8">
    <div className="inline-flex items-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      加载中...
    </div>
  </div>
)

/**
 * 简历记录卡片组件
 */
const ResumeRecordCard: React.FC<{
  record: ResumeRecord
  onUse: (data: ResumeData) => void
  onEdit: (record: UnifiedRecord) => void
  onCopy: (record: UnifiedRecord) => void
  onDelete: (id: string) => void
  loading: boolean
}> = ({ record, onUse, onEdit, onCopy, onDelete, loading }) => (
  <div className="border rounded p-3 hover:bg-gray-50 transition-colors">
    <div className="font-medium text-sm mb-1">{record.name}</div>
    <div className="text-xs text-gray-500 mb-2">
      更新时间: {new Date(record.updatedAt).toLocaleString()}
    </div>
    <DatabaseRecordActions
      record={record}
      onUse={onUse}
      onEdit={onEdit}
      onCopy={onCopy}
      onDelete={onDelete}
      loading={loading}
    />
  </div>
)

/**
 * 文件记录卡片组件
 */
const FileRecordCard: React.FC<{
  record: FileRecord
  onUse: (data: ResumeData) => void
  onCopyToDatabase: (record: UnifiedRecord) => void
}> = ({ record, onUse, onCopyToDatabase }) => (
  <div className="border rounded p-3 hover:bg-gray-50 transition-colors">
    <div className="font-medium text-sm mb-1">{record.name}</div>
    <div className="text-xs text-gray-500 mb-2">
      文件路径: {record.source}
    </div>
    <FileRecordActions
      record={record}
      onUse={onUse}
      onCopyToDatabase={onCopyToDatabase}
    />
  </div>
)

/**
 * 数据库记录列表组件
 * 
 * @example
 * ```tsx
 * <DatabaseResumeList
 *   resumes={resumes}
 *   loading={loading}
 *   onUseResume={handleUseResume}
 *   onEditResume={handleEditResume}
 *   onCreateFromTemplate={handleCreateFromTemplate}
 *   onDeleteResume={handleDeleteResume}
 * />
 * ```
 */
export const DatabaseResumeList: React.FC<DatabaseResumeListProps> = ({
  resumes,
  loading,
  onUse,
  onEdit,
  onCreateFromTemplate,
  onDelete
}) => {
  // 加载状态
  if (loading && resumes.length === 0) {
    return <LoadingState />
  }

  // 空状态
  if (resumes.length === 0) {
    return <EmptyState message="暂无数据库记录" />
  }

  // 列表渲染
  return (
    <div className="space-y-2">
      {resumes.map((resume) => (
        <ResumeRecordCard
          key={resume.id}
          record={resume}
          onUse={onUse}
          onEdit={onEdit}
          onCopy={onCreateFromTemplate}
          onDelete={onDelete}
          loading={loading}
        />
      ))}
    </div>
  )
}

/**
 * 文件记录列表组件
 * 
 * @example
 * ```tsx
 * <FileResumeList
 *   fileRecords={fileRecords}
 *   loading={loading}
 *   onUseResume={handleUseResume}
 *   onCreateFromTemplate={handleCreateFromTemplate}
 * />
 * ```
 */
export const FileResumeList: React.FC<FileResumeListProps> = ({
  fileRecords,
  loading,
  onUse,
  onUseResume,
  onCreateFromTemplate,
  onCopy
}) => {
  // 避免未使用变量警告
  void onUseResume
  void onCreateFromTemplate
  // 加载状态
  if (loading && fileRecords.length === 0) {
    return <LoadingState />
  }

  // 空状态
  if (fileRecords.length === 0) {
    return <EmptyState message="暂无文件记录" />
  }

  // 列表渲染
  return (
    <div className="space-y-2">
      {fileRecords.map((file) => (
        <FileRecordCard
          key={file.id}
          record={file}
          onUse={onUse}
          onCopyToDatabase={onCopy}
        />
      ))}
    </div>
  )
}
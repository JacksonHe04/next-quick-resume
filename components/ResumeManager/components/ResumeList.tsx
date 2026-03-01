/**
 * 简历列表组件
 * 统一管理数据库记录和文件记录的列表显示
 */

import React from 'react'
import { ResumeRecord } from '@/utils/indexedDB'
import { FileRecord, UnifiedRecord } from '../hooks'
import { DatabaseRecordActions, FileRecordActions } from './ActionButtons'

/**
 * 简历列表组件基础属性
 */
interface BaseResumeListProps {
  /** 是否加载中 */
  loading: boolean
  /** 使用简历回调 */
  onUse: (record: UnifiedRecord) => void
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
  /** 复制到数据库回调 */
  onCopy: (template: UnifiedRecord) => void
}

/**
 * 空状态组件
 */
const EmptyState: React.FC<{ message: string; onNew?: () => void }> = ({ message, onNew }) => (
  <div className="text-center text-slate-500 py-12">
    <div className="mb-4">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <p className="text-slate-600 mb-4">{message}</p>
    {onNew && (
      <button
        onClick={onNew}
        className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        新建简历
      </button>
    )}
  </div>
)

/**
 * 加载状态组件
 */
const LoadingState: React.FC = () => (
  <div className="text-center text-slate-500 py-8">
    <div className="inline-flex items-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  onUse: (record: UnifiedRecord) => void
  onEdit: (record: UnifiedRecord) => void
  onCopy: (record: UnifiedRecord) => void
  onDelete: (id: string) => void
  loading: boolean
}> = ({ record, onUse, onEdit, onCopy, onDelete, loading }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-slate-300">
    <div className="font-semibold text-slate-800 mb-2">{record.name}</div>
    <div className="text-xs text-slate-500 mb-3">
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
  onUse: (record: UnifiedRecord) => void
  onCopyToDatabase: (record: UnifiedRecord) => void
}> = ({ record, onUse, onCopyToDatabase }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-slate-300">
    <div className="font-semibold text-slate-800 mb-2">{record.name}</div>
    <div className="text-xs text-slate-500 mb-3 truncate">
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
 *   onUse={handleUseResume}
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
  onDelete,
  onNew
}) => {
  // 加载状态
  if (loading && resumes.length === 0) {
    return <LoadingState />
  }

  // 空状态
  if (resumes.length === 0) {
    return <EmptyState message="暂无数据库记录" onNew={onNew} />
  }

  // 列表渲染
  return (
    <div className="space-y-3">
      {/* 新建按钮 */}
      <button
        onClick={onNew}
        className="w-full border border-dashed border-slate-300 rounded-xl p-4 text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        新建简历
      </button>
      
      {/* 简历列表 */}
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
 *   onUse={handleUseResume}
 *   onCreateFromTemplate={handleCreateFromTemplate}
 * />
 * ```
 */
export const FileResumeList: React.FC<FileResumeListProps> = ({
  fileRecords,
  loading,
  onUse,
  onCopy
}) => {
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
    <div className="space-y-3">
      {fileRecords.map((record) => (
        <FileRecordCard
          key={record.id}
          record={record}
          onUse={onUse}
          onCopyToDatabase={onCopy}
        />
      ))}
    </div>
  )
}

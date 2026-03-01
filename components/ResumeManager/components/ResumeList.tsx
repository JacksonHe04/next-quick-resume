/**
 * 简历列表组件
 * 统一管理数据库记录和文件记录的列表显示
 */

import React from 'react'
import { ResumeRecord } from '@/utils/indexedDB'
import { FileRecord } from '../hooks'
import { DatabaseRecordActions, FileRecordActions } from './ActionButtons'
import { ResumeData, ResumeDisplayConfig } from '@/types'

/**
 * 简历列表组件基础属性
 */
interface BaseResumeListProps {
  /** 是否加载中 */
  loading: boolean
  /** 使用简历回调 */
  onUseResume: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => void
}

/**
 * 数据库记录列表组件属性
 */
export interface DatabaseResumeListProps extends BaseResumeListProps {
  /** 简历记录列表 */
  resumes: ResumeRecord[]
  /** 删除简历回调 */
  onDelete: (id: string) => void
  /** 使用简历回调 */
  onUse: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => void
}

/**
 * 文件记录列表组件属性
 */
export interface FileResumeListProps extends BaseResumeListProps {
  /** 文件记录列表 */
  fileRecords: FileRecord[]
  /** 使用简历回调 */
  onUse: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => void
}

/**
 * 空状态组件
 */
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center text-gray-500 py-12">
    <div className="mb-4">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <p className="text-gray-600 mb-4">{message}</p>
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
  onUse: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => void
  onDelete: (id: string) => void
  loading: boolean
}> = ({ record, onUse, onDelete, loading }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300">
    <div className="font-semibold text-gray-800 mb-2">{record.name}</div>
    <div className="text-xs text-gray-500 mb-3">
      更新时间: {new Date(record.updatedAt).toLocaleString()}
    </div>
    <DatabaseRecordActions
      record={record}
      onUse={onUse}
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
  onUse: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => void
}> = ({ record, onUse }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300">
    <div className="font-semibold text-gray-800 mb-2">{record.name}</div>
    <div className="text-xs text-gray-500 mb-3 truncate">
      文件路径: {record.source}
    </div>
    <FileRecordActions
      record={record}
      onUse={onUse}
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
 *   onDeleteResume={handleDeleteResume}
 * />
 * ```
 */
export const DatabaseResumeList: React.FC<DatabaseResumeListProps> = ({
  resumes,
  loading,
  onUse,
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
    <div className="space-y-3">
      {/* 简历列表 */}
      {resumes.map((resume) => (
        <ResumeRecordCard
          key={resume.id}
          record={resume}
          onUse={onUse}
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
 * />
 * ```
 */
export const FileResumeList: React.FC<FileResumeListProps> = ({
  fileRecords,
  loading,
  onUse
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
        />
      ))}
    </div>
  )
}

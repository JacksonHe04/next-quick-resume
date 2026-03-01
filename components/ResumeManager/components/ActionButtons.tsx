/**
 * 操作按钮组件
 * 统一管理简历记录的各种操作按钮
 */

import React from 'react'
import { Button } from '@/components/ui'
import { ResumeData, ResumeDisplayConfig } from '@/types'
import { ResumeRecord } from '@/utils/indexedDB'

/**
 * 数据库记录操作按钮组件属性
 */
export interface DatabaseRecordActionsProps {
  /** 简历记录 */
  record: ResumeRecord
  /** 使用简历回调 */
  onUse: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => void
  /** 删除简历回调 */
  onDelete: (id: string) => void
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 文件记录操作按钮组件属性
 */
export interface FileRecordActionsProps {
  /** 文件记录 */
  record: {
    id: string
    name: string
    data: ResumeData
    source: string
  }
  /** 使用简历回调 */
  onUse: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig) => void
}

/**
 * 数据库记录操作按钮组件
 * 提供使用、删除功能（编辑功能已移至侧边栏）
 */
export const DatabaseRecordActions: React.FC<DatabaseRecordActionsProps> = ({
  record,
  onUse,
  onDelete,
  loading = false
}) => {
  /**
   * 处理删除操作
   */
  const handleDelete = () => {
    if (confirm('确定要删除这份简历吗？')) {
      onDelete(record.id)
    }
  }

  /**
   * 处理使用操作 - 传递配置信息
   */
  const handleUse = () => {
    onUse(record.data, record.id, record.config)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="success"
        size="xs"
        onClick={handleUse}
        disabled={loading}
      >
        使用
      </Button>

      <Button
        variant="danger"
        size="xs"
        onClick={handleDelete}
        disabled={loading}
      >
        删除
      </Button>
    </div>
  )
}

/**
 * 文件记录操作按钮组件
 * 提供使用功能
 */
export const FileRecordActions: React.FC<FileRecordActionsProps> = ({
  record,
  onUse
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="success"
        size="xs"
        onClick={() => onUse(record.data)}
      >
        使用
      </Button>
    </div>
  )
}

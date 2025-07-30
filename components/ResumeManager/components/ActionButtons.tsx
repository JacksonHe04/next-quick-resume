/**
 * 操作按钮组件
 * 统一管理简历记录的各种操作按钮
 */

import React from 'react'
import { Button } from '@/components/ui'
import { ResumeData } from '@/types'
import { UnifiedRecord } from '../hooks'

/**
 * 数据库记录操作按钮组件属性
 */
export interface DatabaseRecordActionsProps {
  /** 简历记录 */
  record: UnifiedRecord
  /** 使用简历回调 */
  onUse: (data: ResumeData) => void
  /** 编辑简历回调 */
  onEdit: (record: UnifiedRecord) => void
  /** 复制简历回调 */
  onCopy: (record: UnifiedRecord) => void
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
  record: UnifiedRecord
  /** 使用简历回调 */
  onUse: (data: ResumeData) => void
  /** 复制到数据库回调 */
  onCopyToDatabase: (record: UnifiedRecord) => void
}

/**
 * 编辑器操作按钮组件属性
 */
export interface EditorActionsProps {
  /** 保存回调 */
  onSave: () => void
  /** 取消回调 */
  onCancel: () => void
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 数据库记录操作按钮组件
 * 提供使用、编辑、复制、删除功能
 */
export const DatabaseRecordActions: React.FC<DatabaseRecordActionsProps> = ({
  record,
  onUse,
  onEdit,
  onCopy,
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

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="success"
        size="xs"
        onClick={() => onUse(record.data)}
        disabled={loading}
      >
        使用
      </Button>
      
      <Button
        variant="primary"
        size="xs"
        onClick={() => onEdit(record)}
        disabled={loading}
      >
        编辑
      </Button>
      
      <Button
        variant="info"
        size="xs"
        onClick={() => onCopy(record)}
        disabled={loading}
      >
        复制
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
 * 提供使用、复制到数据库功能
 */
export const FileRecordActions: React.FC<FileRecordActionsProps> = ({
  record,
  onUse,
  onCopyToDatabase
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
      
      <Button
        variant="info"
        size="xs"
        onClick={() => onCopyToDatabase(record)}
      >
        复制到数据库
      </Button>
    </div>
  )
}

/**
 * 编辑器操作按钮组件
 * 提供保存、取消功能
 */
export const EditorActions: React.FC<EditorActionsProps> = ({
  onSave,
  onCancel,
  loading = false
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="success"
        onClick={onSave}
        loading={loading}
        disabled={loading}
      >
        {loading ? '保存中...' : '保存'}
      </Button>
      
      <Button
        variant="secondary"
        onClick={onCancel}
        disabled={loading}
      >
        取消
      </Button>
    </div>
  )
}
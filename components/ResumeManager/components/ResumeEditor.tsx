/**
 * 简历编辑器组件
 * 提供简历数据的编辑界面
 */

import React from 'react'
import { EditorActions } from './ActionButtons'
import { UnifiedRecord } from '../hooks'

/**
 * 简历编辑器组件属性接口
 */
export interface ResumeEditorProps {
  /** 是否处于编辑状态 */
  isEditing: boolean
  /** 当前选中的记录（null 表示新建） */
  selectedRecord: UnifiedRecord | null
  /** 编辑中的名称 */
  editingName: string
  /** 编辑中的数据 */
  editingData: string
  /** 错误信息 */
  error: string
  /** 是否加载中 */
  loading: boolean
  /** 名称变更回调 */
  onNameChange: (name: string) => void
  /** 数据变更回调 */
  onDataChange: (data: string) => void
  /** 保存回调 */
  onSave: () => void
  /** 取消回调 */
  onCancel: () => void
}

/**
 * 错误提示组件
 */
const ErrorAlert: React.FC<{ error: string }> = ({ error }) => (
  <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg mb-4">
    <div className="flex items-center">
      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {error}
    </div>
  </div>
)

/**
 * 空状态组件
 */
const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center h-full text-slate-500">
    <div className="text-center">
      <div className="text-lg mb-2">选择一个操作</div>
      <div className="text-sm">
        点击左侧的&quot;新建&quot;按钮创建简历，或选择现有简历进行编辑
      </div>
    </div>
  </div>
)

/**
 * 表单字段组件
 */
const FormField: React.FC<{
  label: string
  children: React.ReactNode
  className?: string
}> = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium mb-2 text-slate-700">{label}</label>
    {children}
  </div>
)

/**
 * 简历编辑器组件
 * 
 * @example
 * ```tsx
 * <ResumeEditor
 *   isEditing={isEditing}
 *   selectedRecord={selectedRecord}
 *   editingName={editingName}
 *   editingData={editingData}
 *   error={error}
 *   loading={loading}
 *   onNameChange={setEditingName}
 *   onDataChange={setEditingData}
 *   onSave={handleSave}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  isEditing,
  selectedRecord,
  editingName,
  editingData,
  error,
  loading,
  onNameChange,
  onDataChange,
  onSave,
  onCancel
}) => {
  // 如果不在编辑状态，显示空状态
  if (!isEditing) {
    return <EmptyState />
  }

  // 判断是编辑模式还是新建模式
  const isEditMode = selectedRecord !== null && 'createdAt' in selectedRecord
  const title = isEditMode ? '编辑简历' : '新建简历'

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg text-slate-900">{title}</h3>
        <EditorActions
          onSave={onSave}
          onCancel={onCancel}
          loading={loading}
        />
      </div>

      {/* 错误提示 */}
      {error && <ErrorAlert error={error} />}

      {/* 表单内容 */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* 简历名称输入 */}
        <FormField label="简历名称">
          <input
            type="text"
            value={editingName}
            onChange={(e) => onNameChange(e.target.value)}
            className={[
              'w-full border border-slate-200 rounded-lg px-3 py-2 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300',
              'disabled:bg-slate-50 disabled:cursor-not-allowed'
            ].join(' ')}
            placeholder="请输入简历名称"
            disabled={loading}
          />
        </FormField>

        {/* JSON 数据编辑 */}
        <FormField label="简历数据 (JSON格式)" className="flex-1 flex flex-col">
          <textarea
            value={editingData}
            onChange={(e) => onDataChange(e.target.value)}
            className={[
              'flex-1 border border-slate-200 rounded-lg px-3 py-2 font-mono text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300',
              'disabled:bg-slate-50 disabled:cursor-not-allowed',
              'resize-none'
            ].join(' ')}
            placeholder="请输入JSON格式的简历数据"
            disabled={loading}
          />
        </FormField>
      </div>

      {/* 底部提示 */}
      <div className="mt-4 text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <span>💡 提示：请确保JSON格式正确</span>
          <span>📝 支持多行编辑</span>
          <span>⌨️ 使用 Ctrl+A 全选内容</span>
        </div>
      </div>
    </div>
  )
}

export default ResumeEditor

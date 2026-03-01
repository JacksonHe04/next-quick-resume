/**
 * 简历编辑器组件
 * 
 * 注意：此组件已不再使用，编辑功能已移至 ResumeSidebar 组件。
 * 保留此文件以备将来可能需要。
 */

import React from 'react'

/**
 * 简历编辑器组件属性接口
 */
export interface ResumeEditorProps {
  /** 是否处于编辑状态 */
  isEditing: boolean
  /** 当前选中的记录（null 表示新建） */
  selectedRecord: unknown
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
 * 简历编辑器组件
 * 
 * @deprecated 编辑功能已移至 ResumeSidebar 组件
 */
export default function ResumeEditor(_props: ResumeEditorProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <div className="text-lg mb-2">编辑功能已移至侧边栏</div>
        <div className="text-sm text-gray-400">
          请在主界面左侧边栏中进行简历编辑
        </div>
      </div>
    </div>
  )
}

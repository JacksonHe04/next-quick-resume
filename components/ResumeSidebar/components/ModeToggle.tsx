'use client'

import React from 'react'
import { Eye, Edit3 } from 'lucide-react'

/**
 * 显示模式类型
 */
type ViewMode = 'preview' | 'edit'

/**
 * 模式切换组件属性接口
 */
interface ModeToggleProps {
  /** 当前模式 */
  mode: ViewMode
  /** 模式切换回调 */
  onChange: (mode: ViewMode) => void
}

/**
 * 模式切换组件
 * 
 * 提供预览/编辑两种模式的切换功能
 */
export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('preview')}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
          mode === 'preview'
            ? 'bg-white text-gray-800 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Eye className="w-4 h-4" />
        形式
      </button>
      <button
        onClick={() => onChange('edit')}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
          mode === 'edit'
            ? 'bg-white text-gray-800 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Edit3 className="w-4 h-4" />
        内容
      </button>
    </div>
  )
}

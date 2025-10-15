'use client'

import React from 'react'
import { Button } from '@/components/ui'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

/**
 * 通用弹窗组件
 * 支持点击外部区域关闭弹窗
 */
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
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
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="!w-8 !h-8 !p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            ×
          </Button>
        </div>

        {/* 主体内容（可为空） */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
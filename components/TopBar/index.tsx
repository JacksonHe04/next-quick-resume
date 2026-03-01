'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ModeToggle } from '../ResumeSidebar/components/ModeToggle'
import { updateResumeName } from '@/utils/indexedDB'
import { setCurrentResumeName } from '@/config/data'

/**
 * 顶部顶栏组件属性
 */
interface TopBarProps {
  /** 当前视图模式 */
  viewMode: 'preview' | 'edit'
  /** 模式切换回调 */
  onModeChange: (mode: 'preview' | 'edit') => void
  /** 创建简历回调 */
  onCreateResume: () => void
  /** AI优化回调 */
  onAiOptimize: () => void
  /** 导出PDF回调 */
  onExportPDF: () => void
  /** 导出Markdown回调 */
  onExportMarkdown: () => void
  /** 当前简历名称 */
  resumeName?: string
  /** 当前简历记录ID */
  recordId?: string
  /** 是否为模板简历 */
  isTemplate: boolean
  /** 刷新回调 */
  onRefresh: () => void
  /** 简历列表刷新回调 */
  onResumesRefresh?: () => void
  /** 切换左侧边栏（移动端） */
  onToggleLeftSidebar?: () => void
  /** 切换右侧边栏（移动端） */
  onToggleRightSidebar?: () => void
  /** 左侧边栏是否显示（移动端） */
  showLeftSidebar?: boolean
}

/**
 * 顶部顶栏组件
 * 包含模式切换、简历名称编辑、操作按钮等功能
 */
export default function TopBar({
  viewMode,
  onModeChange,
  onCreateResume,
  onAiOptimize,
  onExportPDF,
  onExportMarkdown,
  resumeName,
  recordId,
  isTemplate,
  onRefresh,
  onResumesRefresh,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  showLeftSidebar = false
}: TopBarProps) {
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // 简历名称编辑状态
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState(resumeName || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameError, setNameError] = useState('')

  // 同步外部名称变化 - 只在非编辑状态下同步，避免干扰用户输入
  useEffect(() => {
    if (!isEditingName) {
      setEditingName(resumeName || '')
    }
  }, [resumeName, isEditingName])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * 开始编辑名称
   */
  const handleStartEditName = () => {
    if (isTemplate) {
      setNameError('模板简历无法修改名称')
      return
    }
    setIsEditingName(true)
    setEditingName(resumeName || '')
    setNameError('')
  }

  /**
   * 保存名称
   */
  const handleSaveName = async () => {
    if (!recordId) {
      setNameError('未找到简历记录')
      return
    }

    const trimmedName = editingName.trim()
    if (!trimmedName) {
      setNameError('名称不能为空')
      return
    }

    if (trimmedName === resumeName) {
      setIsEditingName(false)
      return
    }

    try {
      setIsSavingName(true)
      setNameError('')
      await updateResumeName(recordId, trimmedName)
      setCurrentResumeName(trimmedName)
      setIsEditingName(false)
      onRefresh()
      onResumesRefresh?.()
    } catch (error) {
      console.error('保存名称失败:', error)
      setNameError('保存失败，请重试')
    } finally {
      setIsSavingName(false)
    }
  }

  /**
   * 取消编辑名称
   */
  const handleCancelEditName = () => {
    setIsEditingName(false)
    setEditingName(resumeName || '')
    setNameError('')
  }

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      handleCancelEditName()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center justify-between px-2 sm:px-4 print:hidden">
      {/* 左侧：移动端菜单按钮 + 模式切换 + 简历名称编辑 */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* 移动端左侧边栏切换按钮 */}
        <button
          onClick={onToggleLeftSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="切换左侧边栏"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* 模式切换 - 移动端：左侧栏打开时显示；桌面端：始终显示 */}
        <div className="flex-shrink-0">
          <div className={`${showLeftSidebar ? 'block' : 'hidden'} lg:block`}>
            <ModeToggle mode={viewMode} onChange={onModeChange} />
          </div>
        </div>
        
        {/* 移动端导出按钮 - 左侧栏关闭时显示 */}
        <div className="lg:hidden relative" ref={dropdownRef}>
          {!showLeftSidebar && (
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              title="导出"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
          )}

          {showExportDropdown && !showLeftSidebar && (
            <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  onExportPDF()
                  setShowExportDropdown(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                导出为 PDF
              </button>
              <button
                onClick={() => {
                  onExportMarkdown()
                  setShowExportDropdown(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                导出为 Markdown
              </button>
            </div>
          )}
        </div>
        
        {/* 分隔线 - 仅桌面端显示 */}
        <div className="hidden sm:block h-8 w-px bg-gray-300" />
        
        {/* 简历名称编辑 - 仅桌面端显示 */}
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSavingName}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                placeholder="输入简历名称"
                autoFocus
              />
              <button
                onClick={handleCancelEditName}
                disabled={isSavingName}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveName}
                disabled={isSavingName}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSavingName ? '保存中...' : '确认'}
              </button>
            </div>
          ) : (
            <div 
              onClick={handleStartEditName}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200
                ${isTemplate 
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                  : 'bg-white border-gray-300 hover:border-blue-400 cursor-pointer group'
                }
              `}
              title={isTemplate ? '模板简历无法修改名称' : '点击编辑名称'}
            >
              <span className={`text-sm font-medium truncate max-w-[200px] ${isTemplate ? 'text-gray-500' : 'text-gray-800'}`}>
                {resumeName || '未命名简历'}
              </span>
              {!isTemplate && (
                <svg 
                  className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </div>
          )}
          
          {/* 错误提示 */}
          {nameError && (
            <span className="text-xs text-red-600">{nameError}</span>
          )}
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* 移动端右侧边栏切换按钮 */}
        <button
          onClick={onToggleRightSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="切换右侧边栏"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* 创建简历按钮 - 移动端隐藏文字 */}
        <button
          onClick={onCreateResume}
          className="hidden sm:flex px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          创建简历
        </button>
        
        {/* AI优化按钮 - 移动端简化 */}
        <button
          onClick={onAiOptimize}
          className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="hidden sm:inline">AI 简历优化</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* 导出下拉菜单 - 仅桌面端显示 */}
        <div className="hidden md:block relative">
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            导出
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showExportDropdown && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  onExportPDF()
                  setShowExportDropdown(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                导出为 PDF
              </button>
              <button
                onClick={() => {
                  onExportMarkdown()
                  setShowExportDropdown(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                导出为 Markdown
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

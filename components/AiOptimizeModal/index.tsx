'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui'
import { ResumeData } from '@/types'
import { getCurrentResumeData, setCurrentResumeData } from '@/config/data'
import { optimizeResumeWithAI } from '@/api/ai-optimize'

interface AiOptimizeModalProps {
  isOpen: boolean
  onClose: () => void
  onOptimized?: (resumeData: ResumeData) => void
}

/**
 * AI简历优化弹窗组件
 * 支持基于修改建议和JD进行AI优化
 */
export default function AiOptimizeModal({ isOpen, onClose, onOptimized }: AiOptimizeModalProps) {
  // 输入状态
  const [suggestions, setSuggestions] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  
  // JSON编辑状态
  const [currentResumeJson, setCurrentResumeJson] = useState('')
  const [editedResumeJson, setEditedResumeJson] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // 初始化当前简历数据
  useEffect(() => {
    if (isOpen) {
      const currentData = getCurrentResumeData()
      const jsonString = JSON.stringify(currentData, null, 2)
      setCurrentResumeJson(jsonString)
      setEditedResumeJson(jsonString)
      setJsonError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  /**
   * 处理背景点击关闭弹窗
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  /**
   * 验证输入是否有效
   */
  const isInputValid = () => {
    return suggestions.trim() !== '' || jobDescription.trim() !== ''
  }

  /**
   * 处理AI优化
   */
  const handleOptimize = async () => {
    if (!isInputValid()) return

    setIsOptimizing(true)
    try {
      // 调用AI优化API
      const response = await optimizeResumeWithAI({
        currentResume: JSON.parse(currentResumeJson),
        suggestions: suggestions.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined
      })

      if (response.success && response.data) {
        // 更新右侧JSON显示
        const optimizedJsonString = JSON.stringify(response.data, null, 2)
        setEditedResumeJson(optimizedJsonString)
        setJsonError('')
      } else {
        setJsonError(response.error || 'AI优化失败，请稍后重试')
      }

    } catch (error) {
      console.error('AI优化失败:', error)
      setJsonError('AI优化失败，请稍后重试')
    } finally {
      setIsOptimizing(false)
    }
  }

  /**
   * 处理JSON编辑
   */
  const handleJsonChange = (value: string) => {
    setEditedResumeJson(value)
    
    // 实时验证JSON格式
    try {
      JSON.parse(value)
      setJsonError('')
    } catch (_error) {
      void _error // 故意忽略错误详情
      setJsonError('JSON格式错误')
    }
  }

  /**
   * 保存优化后的简历
   */
  const handleSave = async () => {
    try {
      const parsedData = JSON.parse(editedResumeJson)
      setIsSaving(true)

      // 更新当前简历数据
      setCurrentResumeData(parsedData)
      
      // 通知父组件
      onOptimized?.(parsedData)
      
      // 关闭弹窗
      onClose()

    } catch (_error) {
      void _error // 故意忽略错误详情
      setJsonError('JSON格式错误，无法保存')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 取消编辑，恢复原始数据
   */
  const handleCancel = () => {
    setEditedResumeJson(currentResumeJson)
    setJsonError('')
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI 简历优化</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 弹窗内容 - 左右两栏布局 */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* 左侧输入区域 */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">优化输入</h3>
                <p className="text-sm text-gray-600 mb-4">
                  请输入修改建议或目标岗位JD，AI将根据您的输入优化简历内容（至少填写一项）
                </p>
              </div>

              {/* 修改建议输入框 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  修改建议 <span className="text-gray-400">(选填)</span>
                </label>
                <textarea
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="请输入您希望AI优化的具体建议，例如：
• 突出技术栈相关经验
• 增强项目成果描述
• 优化工作职责表述
• 调整技能重点..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* JD输入框 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标岗位JD <span className="text-gray-400">(选填)</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="请粘贴目标岗位的职位描述(JD)，AI将根据JD要求优化您的简历内容..."
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* AI优化按钮 */}
              <div>
                <Button
                  onClick={handleOptimize}
                  disabled={!isInputValid() || isOptimizing}
                  className="w-full"
                  variant="primary"
                >
                  {isOptimizing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      AI优化中...
                    </div>
                  ) : (
                    'AI 优化简历'
                  )}
                </Button>
                {!isInputValid() && (
                  <p className="text-sm text-gray-500 mt-2">
                    请至少填写修改建议或目标岗位JD中的一项
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 右侧JSON编辑区域 */}
          <div className="w-1/2 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">简历数据</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                  disabled={isSaving}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="sm"
                  disabled={!!jsonError || isSaving}
                >
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>

            {/* JSON编辑器 */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={editedResumeJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                className={`flex-1 w-full px-3 py-2 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  jsonError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="简历JSON数据将显示在这里..."
              />
              
              {/* 错误提示 */}
              {jsonError && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {jsonError}
                </div>
              )}
              
              {/* 提示信息 */}
              <div className="mt-2 text-xs text-gray-500">
                您可以直接编辑JSON数据，修改后点击&ldquo;保存&rdquo;按钮应用到简历
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
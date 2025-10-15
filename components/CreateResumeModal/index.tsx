'use client'

import React, { useState } from 'react'
import { Button } from '../ui'
import { ResumeData } from '@/types'
import PdfUpload from './components/PdfUpload'
import ResumeForm from './components/ResumeForm'
import JsonPreview from './components/JsonPreview'

interface CreateResumeModalProps {
  isOpen: boolean
  onClose: () => void
  onResumeCreated?: (resumeData: ResumeData) => void
}

/**
 * 创建简历弹窗组件
 * 支持两种创建方式：PDF上传解析和手动填写表单
 */
export default function CreateResumeModal({ isOpen, onClose, onResumeCreated }: CreateResumeModalProps) {
  // 当前选择的创建方式：'select' | 'upload' | 'form' | 'preview'
  const [currentStep, setCurrentStep] = useState<'select' | 'upload' | 'form' | 'preview'>('select')
  // 简历数据状态
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)

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
   * 重置到选择界面
   */
  const handleBackToSelect = () => {
    setCurrentStep('select')
    setResumeData(null)
  }

  /**
   * 处理PDF上传解析完成
   */
  const handlePdfParsed = (data: ResumeData) => {
    setResumeData(data)
    setCurrentStep('preview')
  }

  /**
   * 处理表单填写完成
   */
  const handleFormCompleted = (data: ResumeData) => {
    setResumeData(data)
    setCurrentStep('preview')
  }

  /**
   * 处理简历确认保存
   */
  const handleResumeConfirmed = (data: ResumeData) => {
    onResumeCreated?.(data)
  }

  /**
   * 渲染选择创建方式的界面
   */
  const renderSelectMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">选择创建方式</h3>
        <p className="text-sm text-gray-600">请选择您希望使用的简历创建方式</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF上传方式 */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200"
          onClick={() => setCurrentStep('upload')}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h4 className="text-md font-medium text-gray-900 mb-2">上传PDF简历</h4>
            <p className="text-sm text-gray-600">上传现有的PDF简历文件，系统将自动解析内容并转换为结构化数据</p>
          </div>
        </div>

        {/* 手动填写方式 */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all duration-200"
          onClick={() => setCurrentStep('form')}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h4 className="text-md font-medium text-gray-900 mb-2">手动填写表单</h4>
            <p className="text-sm text-gray-600">通过填写详细的表单来创建简历，可以精确控制每个字段的内容</p>
          </div>
        </div>
      </div>
    </div>
  )

  /**
   * 渲染PDF上传界面
   */
  const renderUploadMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">PDF上传解析</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleBackToSelect}
          className="text-gray-600 hover:text-gray-800"
        >
          返回选择
        </Button>
      </div>
      
      <PdfUpload 
        onSuccess={handlePdfParsed} 
        onError={(error) => console.error('PDF解析失败:', error)}
      />
    </div>
  )

  /**
   * 渲染表单填写界面
   */
  const renderFormMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">手动填写简历</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleBackToSelect}
          className="text-gray-600 hover:text-gray-800"
        >
          返回选择
        </Button>
      </div>
      
      <ResumeForm onSuccess={handleFormCompleted} />
    </div>
  )

  /**
   * 渲染预览确认界面
   */
  const renderPreviewMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">预览简历</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleBackToSelect}
          className="text-gray-600 hover:text-gray-800"
        >
          返回选择
        </Button>
      </div>
      
      {resumeData && (
        <JsonPreview 
          resumeData={resumeData}
          onConfirm={() => handleResumeConfirmed(resumeData)}
          onEdit={() => setCurrentStep('form')}
          onCancel={handleBackToSelect}
        />
      )}
    </div>
  )

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">创建简历</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {currentStep === 'select' && renderSelectMode()}
          {currentStep === 'upload' && renderUploadMode()}
          {currentStep === 'form' && renderFormMode()}
          {currentStep === 'preview' && renderPreviewMode()}
        </div>
      </div>
    </div>
  )
}
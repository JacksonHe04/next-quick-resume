'use client'

import React, { useState, useRef } from 'react'
import { Button } from '../../ui'
import { ResumeData } from '@/types'

interface PdfUploadProps {
  onSuccess: (resumeData: ResumeData) => void
  onError: (error: string) => void
}

/**
 * PDF上传组件
 * 支持文件选择、上传进度显示和OCR解析
 */
export default function PdfUpload({ onSuccess, onError }: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [ocrText, setOcrText] = useState('')
  const [parsedData, setParsedData] = useState<ResumeData | null>(null)
  const [step, setStep] = useState<'upload' | 'ocr' | 'parse' | 'preview'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        onError('请选择PDF文件')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB限制
        onError('文件大小不能超过10MB')
        return
      }
      setFile(selectedFile)
    }
  }

  /**
   * 处理文件上传和OCR解析
   */
  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setStep('upload')

    try {
      // 模拟上传进度
      const uploadInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // TODO: 实际的文件上传API调用
      const formData = new FormData()
      formData.append('file', file)

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProgress(100)
      setStep('ocr')

      // TODO: 调用OCR API解析PDF文本
      const ocrResult = await mockOcrApi(file)
      setOcrText(ocrResult)
      setStep('parse')

      // TODO: 调用AI API将文本解析为JSON
      const parsedResult = await mockParseApi(ocrResult)
      setParsedData(parsedResult)
      setStep('preview')

    } catch (error) {
      console.error('上传失败:', error)
      onError('文件上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  /**
   * 确认解析结果
   */
  const handleConfirm = () => {
    if (parsedData) {
      onSuccess(parsedData)
    }
  }

  /**
   * 重新选择文件
   */
  const handleReset = () => {
    setFile(null)
    setProgress(0)
    setOcrText('')
    setParsedData(null)
    setStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * 渲染文件选择界面
   */
  const renderFileSelect = () => (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">选择PDF文件</h4>
        <p className="text-sm text-gray-600 mb-4">点击选择或拖拽PDF文件到此处</p>
        <p className="text-xs text-gray-500">支持PDF格式，文件大小不超过10MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {file && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReset}
            >
              移除
            </Button>
          </div>
        </div>
      )}

      {file && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={uploading}
          >
            {uploading ? '处理中...' : '开始解析'}
          </Button>
        </div>
      )}
    </div>
  )

  /**
   * 渲染处理进度
   */
  const renderProgress = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-lg font-medium text-gray-900 mb-2">正在处理您的简历</h4>
        <p className="text-sm text-gray-600">请稍候，系统正在解析PDF内容...</p>
      </div>

      {/* 进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 步骤指示器 */}
      <div className="flex justify-between text-sm">
        <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : step === 'ocr' || step === 'parse' || step === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-4 h-4 rounded-full mr-2 ${step === 'upload' ? 'bg-blue-600' : step === 'ocr' || step === 'parse' || step === 'preview' ? 'bg-green-600' : 'bg-gray-400'}`} />
          上传文件
        </div>
        <div className={`flex items-center ${step === 'ocr' ? 'text-blue-600' : step === 'parse' || step === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-4 h-4 rounded-full mr-2 ${step === 'ocr' ? 'bg-blue-600' : step === 'parse' || step === 'preview' ? 'bg-green-600' : 'bg-gray-400'}`} />
          OCR识别
        </div>
        <div className={`flex items-center ${step === 'parse' ? 'text-blue-600' : step === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-4 h-4 rounded-full mr-2 ${step === 'parse' ? 'bg-blue-600' : step === 'preview' ? 'bg-green-600' : 'bg-gray-400'}`} />
          AI解析
        </div>
        <div className={`flex items-center ${step === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-4 h-4 rounded-full mr-2 ${step === 'preview' ? 'bg-green-600' : 'bg-gray-400'}`} />
          预览确认
        </div>
      </div>
    </div>
  )

  /**
   * 渲染解析结果预览
   */
  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-lg font-medium text-gray-900 mb-2">解析完成</h4>
        <p className="text-sm text-gray-600">请检查解析结果，确认无误后保存</p>
      </div>

      {/* OCR文本预览 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-2">识别的文本内容：</h5>
        <div className="max-h-32 overflow-y-auto text-xs text-gray-700 whitespace-pre-wrap">
          {ocrText}
        </div>
      </div>

      {/* 解析结果预览 */}
      {parsedData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">解析的结构化数据：</h5>
          <div className="max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={handleReset}
        >
          重新上传
        </Button>
        <Button
          variant="success"
          onClick={handleConfirm}
        >
          确认保存
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {step === 'upload' && renderFileSelect()}
      {(step === 'ocr' || step === 'parse') && renderProgress()}
      {step === 'preview' && renderPreview()}
    </div>
  )
}

/**
 * 模拟OCR API调用
 * TODO: 替换为实际的OCR服务调用
 */
async function mockOcrApi(_file: File): Promise<string> {
  void _file // 故意忽略文件参数，使用模拟数据
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 返回模拟的OCR结果
  return `张三
软件工程师
电话：138-0000-0000
邮箱：zhangsan@example.com
微信：zhangsan123

教育背景
2018-2022 北京大学 计算机科学与技术 本科

技能专长
• JavaScript/TypeScript
• React/Vue.js
• Node.js
• Python
• MySQL/MongoDB

工作经历
2022.07-至今 ABC科技有限公司 前端工程师
• 负责公司主要产品的前端开发工作
• 参与系统架构设计和技术选型
• 优化页面性能，提升用户体验

项目经验
在线教育平台
技术栈：React + TypeScript + Node.js
• 开发了完整的在线学习系统
• 实现了视频播放、在线测试等功能
• 支持多端适配，用户体验良好`
}

/**
 * 模拟AI解析API调用
 * TODO: 替换为实际的AI服务调用
 */
async function mockParseApi(_text: string): Promise<ResumeData> {
  void _text // 故意忽略文本参数，使用模拟数据
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 返回模拟的解析结果
  return {
    header: {
      name: "张三",
      contact: {
        phone: "138-0000-0000",
        email: "zhangsan@example.com",
        wechat: "zhangsan123",
        age: "",
        github: {
          text: "",
          url: ""
        },
        homepage: {
          text: "",
          url: ""
        }
      },
      jobInfo: {
        position: "软件工程师",
        duration: "",
        availability: ""
      }
    },
    about: {
      title: "个人简介",
      content: ""
    },
    education: {
      title: "教育背景",
      school: "北京大学",
      period: "2018-2022",
      details: "计算机科学与技术 本科"
    },
    skills: {
      title: "技能专长",
      items: [
        "JavaScript/TypeScript",
        "React/Vue.js", 
        "Node.js",
        "Python",
        "MySQL/MongoDB",
        ""
      ]
    },
    intern: {
      title: "工作经历",
      items: [
        {
          company: "ABC科技有限公司",
          position: "前端工程师",
          period: "2022.07-至今",
          description: "",
          responsibilities: [
            "负责公司主要产品的前端开发工作",
            "参与系统架构设计和技术选型",
            "优化页面性能，提升用户体验"
          ],
          show: true
        }
      ]
    },
    projects: {
      title: "项目经验",
      items: [
        {
          name: "在线教育平台",
          github: "",
          demo: "",
          techStack: "React + TypeScript + Node.js",
          description: "",
          features: [
            "开发了完整的在线学习系统",
            "实现了视频播放、在线测试等功能",
            "支持多端适配，用户体验良好",
            "",
            "",
            ""
          ],
          show: true
        }
      ]
    }
  }
}
'use client'

import React, { useState } from 'react'
import { Button } from '../../ui'
import { ResumeData } from '@/types'

interface JsonPreviewProps {
  resumeData: ResumeData
  onConfirm: () => void
  onEdit: () => void
  onCancel: () => void
}

/**
 * JSON预览和确认组件
 * 用于最终确认和保存简历数据
 */
export default function JsonPreview({ resumeData, onConfirm, onEdit, onCancel }: JsonPreviewProps) {
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('formatted')

  /**
   * 处理保存确认
   */
  const handleConfirm = async () => {
    setSaving(true)
    try {
      // TODO: 调用保存API
      await mockSaveApi(resumeData)
      onConfirm()
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 渲染格式化预览
   */
  const renderFormattedPreview = () => (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">基本信息</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">姓名：</span>{resumeData.header.name || '未填写'}</div>
          <div><span className="font-medium">职位：</span>{resumeData.header.jobInfo.position || '未填写'}</div>
          <div><span className="font-medium">手机：</span>{resumeData.header.contact.phone || '未填写'}</div>
          <div><span className="font-medium">邮箱：</span>{resumeData.header.contact.email || '未填写'}</div>
          <div><span className="font-medium">微信：</span>{resumeData.header.contact.wechat || '未填写'}</div>
          <div><span className="font-medium">年龄：</span>{resumeData.header.contact.age || '未填写'}</div>
          {resumeData.header.contact.github.url && (
            <div><span className="font-medium">GitHub：</span>
              <a href={resumeData.header.contact.github.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {resumeData.header.contact.github.url}
              </a>
            </div>
          )}
          {resumeData.header.contact.homepage.url && (
            <div><span className="font-medium">主页：</span>
              <a href={resumeData.header.contact.homepage.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {resumeData.header.contact.homepage.url}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 个人简介 */}
      {resumeData.about.content && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">{resumeData.about.title}</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{resumeData.about.content}</p>
        </div>
      )}

      {/* 教育背景 */}
      {(resumeData.education.school || resumeData.education.period || resumeData.education.details) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">{resumeData.education.title}</h4>
          <div className="text-sm text-gray-700">
            <div><span className="font-medium">学校：</span>{resumeData.education.school || '未填写'}</div>
            <div><span className="font-medium">时间：</span>{resumeData.education.period || '未填写'}</div>
            <div><span className="font-medium">专业：</span>{resumeData.education.details || '未填写'}</div>
          </div>
        </div>
      )}

      {/* 技能专长 */}
      {resumeData.skills.items.some(item => item.trim()) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">{resumeData.skills.title}</h4>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.items.filter(item => item.trim()).map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 工作经历 */}
      {resumeData.intern.items.some(item => item.company || item.position) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">{resumeData.intern.title}</h4>
          <div className="space-y-4">
            {resumeData.intern.items.filter(item => item.company || item.position).map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{item.position || '未填写职位'}</h5>
                    <p className="text-sm text-gray-600">{item.company || '未填写公司'}</p>
                  </div>
                  <span className="text-sm text-gray-500">{item.period || '未填写时间'}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                )}
                {item.responsibilities.some(resp => resp.trim()) && (
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    {item.responsibilities.filter(resp => resp.trim()).map((resp, respIndex) => (
                      <li key={respIndex}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 项目经验 */}
      {resumeData.projects.items.some(item => item.name || item.techStack) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">{resumeData.projects.title}</h4>
          <div className="space-y-4">
            {resumeData.projects.items.filter(item => item.name || item.techStack).map((item, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{item.name || '未填写项目名'}</h5>
                  <span className="text-sm text-gray-500">{item.techStack || '未填写技术栈'}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                )}
                <div className="flex space-x-4 mb-2">
                  {item.github && (
                    <a href={item.github} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      GitHub
                    </a>
                  )}
                  {item.demo && (
                    <a href={item.demo} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      演示
                    </a>
                  )}
                </div>
                {item.features.some(feature => feature.trim()) && (
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    {item.features.filter(feature => feature.trim()).map((feature, featureIndex) => (
                      <li key={featureIndex}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  /**
   * 渲染JSON预览
   */
  const renderJsonPreview = () => (
    <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
      <pre className="text-green-400 text-sm whitespace-pre-wrap">
        {JSON.stringify(resumeData, null, 2)}
      </pre>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">预览简历数据</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'formatted' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('formatted')}
          >
            格式化预览
          </Button>
          <Button
            variant={viewMode === 'json' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('json')}
          >
            JSON预览
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
        {viewMode === 'formatted' ? renderFormattedPreview() : renderJsonPreview()}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">确认提示</h4>
            <p className="text-sm text-yellow-700 mt-1">
              请仔细检查以上信息，确认无误后点击&ldquo;保存简历&rdquo;。保存后的简历将存储到数据库中，您可以在简历管理中查看和编辑。
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            取消
          </Button>
          <Button
            variant="info"
            onClick={onEdit}
          >
            继续编辑
          </Button>
        </div>
        <Button
          variant="success"
          onClick={handleConfirm}
          loading={saving}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存简历'}
        </Button>
      </div>
    </div>
  )
}

/**
 * 模拟保存API调用
 * TODO: 替换为实际的保存服务调用
 */
async function mockSaveApi(resumeData: ResumeData): Promise<void> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 模拟保存到数据库
  console.log('保存简历数据:', resumeData)
  
  // 这里应该调用实际的API
  // const response = await fetch('/api/resumes', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(resumeData),
  // })
  // 
  // if (!response.ok) {
  //   throw new Error('保存失败')
  // }
}
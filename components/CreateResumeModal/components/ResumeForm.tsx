'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../ui'
import { ResumeData } from '@/types'

interface ResumeFormProps {
  onSuccess: (resumeData: ResumeData) => void
  initialData?: ResumeData
}

/**
 * 简历表单组件
 * 基于JSON模板生成的完整表单，支持所有字段的输入和编辑
 */
export default function ResumeForm({ onSuccess, initialData }: ResumeFormProps) {
  const [formData, setFormData] = useState<ResumeData>({
    header: {
      name: "",
      contact: {
        phone: "",
        email: "",
        wechat: "",
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
        position: "",
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
      school: "",
      period: "",
      details: ""
    },
    skills: {
      title: "技能专长",
      items: ["", "", "", "", "", ""]
    },
    intern: {
      title: "工作经历",
      items: [
        {
          company: "",
          position: "",
          period: "",
          description: "",
          responsibilities: ["", "", ""],
          show: true
        }
      ]
    },
    projects: {
      title: "项目经验",
      items: [
        {
          name: "",
          github: "",
          demo: "",
          techStack: "",
          description: "",
          features: ["", "", "", "", "", ""],
          show: true
        }
      ]
    }
  })

  const [currentSection, setCurrentSection] = useState<'header' | 'about' | 'education' | 'skills' | 'intern' | 'projects'>('header')

  // 如果有初始数据，使用初始数据填充表单
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  /**
   * 更新表单数据
   */
  const updateFormData = (section: string, field: string, value: string | string[] | boolean, index?: number, subField?: string) => {
    setFormData(prev => {
      const newData = { ...prev }
      
      if (index !== undefined && subField) {
        // 处理数组中对象的字段更新
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(newData as any)[section][field][index][subField] = value
      } else if (index !== undefined) {
        // 处理数组字段更新
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(newData as any)[section][field][index] = value
      } else if (field.includes('.')) {
        // 处理嵌套字段更新
        const fields = field.split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current = (newData as any)[section]
        for (let i = 0; i < fields.length - 1; i++) {
          current = current[fields[i]]
        }
        current[fields[fields.length - 1]] = value
      } else {
        // 处理普通字段更新
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(newData as any)[section][field] = value
      }
      
      return newData
    })
  }

  /**
   * 添加技能项
   */
  const addSkillItem = () => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        items: [...prev.skills.items, ""]
      }
    }))
  }

  /**
   * 删除技能项
   */
  const removeSkillItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        items: prev.skills.items.filter((_, i) => i !== index)
      }
    }))
  }

  /**
   * 添加工作经历
   */
  const addInternItem = () => {
    setFormData(prev => ({
      ...prev,
      intern: {
        ...prev.intern,
        items: [...prev.intern.items, {
          company: "",
          position: "",
          period: "",
          description: "",
          responsibilities: ["", "", ""],
          show: true
        }]
      }
    }))
  }

  /**
   * 删除工作经历
   */
  const removeInternItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      intern: {
        ...prev.intern,
        items: prev.intern.items.filter((_, i) => i !== index)
      }
    }))
  }

  /**
   * 添加项目经验
   */
  const addProjectItem = () => {
    setFormData(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        items: [...prev.projects.items, {
          name: "",
          github: "",
          demo: "",
          techStack: "",
          description: "",
          features: ["", "", "", "", "", ""],
          show: true
        }]
      }
    }))
  }

  /**
   * 删除项目经验
   */
  const removeProjectItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        items: prev.projects.items.filter((_, i) => i !== index)
      }
    }))
  }

  /**
   * 提交表单
   */
  const handleSubmit = () => {
    // 简单验证
    if (!formData.header.name.trim()) {
      alert('请填写姓名')
      setCurrentSection('header')
      return
    }
    
    onSuccess(formData)
  }

  /**
   * 渲染基本信息表单
   */
  const renderHeaderForm = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">基本信息</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
          <input
            type="text"
            value={formData.header.name}
            onChange={(e) => updateFormData('header', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入姓名"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">求职岗位</label>
          <input
            type="text"
            value={formData.header.jobInfo.position}
            onChange={(e) => updateFormData('header', 'jobInfo.position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入求职岗位"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
          <input
            type="tel"
            value={formData.header.contact.phone}
            onChange={(e) => updateFormData('header', 'contact.phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入手机号码"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
          <input
            type="email"
            value={formData.header.contact.email}
            onChange={(e) => updateFormData('header', 'contact.email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入邮箱地址"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">微信号</label>
          <input
            type="text"
            value={formData.header.contact.wechat}
            onChange={(e) => updateFormData('header', 'contact.wechat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入微信号"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
          <input
            type="text"
            value={formData.header.contact.age}
            onChange={(e) => updateFormData('header', 'contact.age', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入年龄"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
          <input
            type="url"
            value={formData.header.contact.github.url}
            onChange={(e) => updateFormData('header', 'contact.github.url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="GitHub链接"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">个人主页</label>
          <input
            type="url"
            value={formData.header.contact.homepage.url}
            onChange={(e) => updateFormData('header', 'contact.homepage.url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="个人主页链接"
          />
        </div>
      </div>
    </div>
  )

  /**
   * 渲染个人简介表单
   */
  const renderAboutForm = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">个人简介</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介内容</label>
        <textarea
          value={formData.about.content}
          onChange={(e) => updateFormData('about', 'content', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入个人简介..."
        />
      </div>
    </div>
  )

  /**
   * 渲染教育背景表单
   */
  const renderEducationForm = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">教育背景</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">学校名称</label>
          <input
            type="text"
            value={formData.education.school}
            onChange={(e) => updateFormData('education', 'school', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入学校名称"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">就读时间</label>
          <input
            type="text"
            value={formData.education.period}
            onChange={(e) => updateFormData('education', 'period', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="如：2018-2022"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">专业详情</label>
        <input
          type="text"
          value={formData.education.details}
          onChange={(e) => updateFormData('education', 'details', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="如：计算机科学与技术 本科"
        />
      </div>
    </div>
  )

  /**
   * 渲染技能专长表单
   */
  const renderSkillsForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">技能专长</h4>
        <Button variant="primary" size="sm" onClick={addSkillItem}>
          添加技能
        </Button>
      </div>
      
      <div className="space-y-2">
        {formData.skills.items.map((skill, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={skill}
              onChange={(e) => updateFormData('skills', 'items', e.target.value, index)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`技能 ${index + 1}`}
            />
            {formData.skills.items.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeSkillItem(index)}
              >
                删除
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  /**
   * 渲染工作经历表单
   */
  const renderInternForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">工作经历</h4>
        <Button variant="primary" size="sm" onClick={addInternItem}>
          添加经历
        </Button>
      </div>
      
      {formData.intern.items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-md font-medium text-gray-800">工作经历 {index + 1}</h5>
            {formData.intern.items.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeInternItem(index)}
              >
                删除
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
              <input
                type="text"
                value={item.company}
                onChange={(e) => updateFormData('intern', 'items', e.target.value, index, 'company')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入公司名称"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职位名称</label>
              <input
                type="text"
                value={item.position}
                onChange={(e) => updateFormData('intern', 'items', e.target.value, index, 'position')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入职位名称"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">工作时间</label>
              <input
                type="text"
                value={item.period}
                onChange={(e) => updateFormData('intern', 'items', e.target.value, index, 'period')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：2022.07-至今"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">工作职责</label>
            {item.responsibilities.map((resp, respIndex) => (
              <input
                key={respIndex}
                type="text"
                value={resp}
                onChange={(e) => {
                  const newResponsibilities = [...item.responsibilities]
                  newResponsibilities[respIndex] = e.target.value
                  updateFormData('intern', 'items', newResponsibilities, index, 'responsibilities')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                placeholder={`职责 ${respIndex + 1}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  /**
   * 渲染项目经验表单
   */
  const renderProjectsForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">项目经验</h4>
        <Button variant="primary" size="sm" onClick={addProjectItem}>
          添加项目
        </Button>
      </div>
      
      {formData.projects.items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-md font-medium text-gray-800">项目 {index + 1}</h5>
            {formData.projects.items.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeProjectItem(index)}
              >
                删除
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateFormData('projects', 'items', e.target.value, index, 'name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入项目名称"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">技术栈</label>
              <input
                type="text"
                value={item.techStack}
                onChange={(e) => updateFormData('projects', 'items', e.target.value, index, 'techStack')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：React + TypeScript + Node.js"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub链接</label>
              <input
                type="url"
                value={item.github}
                onChange={(e) => updateFormData('projects', 'items', e.target.value, index, 'github')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="GitHub项目链接"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">演示链接</label>
              <input
                type="url"
                value={item.demo}
                onChange={(e) => updateFormData('projects', 'items', e.target.value, index, 'demo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="项目演示链接"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
            <textarea
              value={item.description}
              onChange={(e) => updateFormData('projects', 'items', e.target.value, index, 'description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入项目描述..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目特色</label>
            {item.features.map((feature, featureIndex) => (
              <input
                key={featureIndex}
                type="text"
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...item.features]
                  newFeatures[featureIndex] = e.target.value
                  updateFormData('projects', 'items', newFeatures, index, 'features')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                placeholder={`特色 ${featureIndex + 1}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const sections = [
    { key: 'header', label: '基本信息', component: renderHeaderForm },
    { key: 'about', label: '个人简介', component: renderAboutForm },
    { key: 'education', label: '教育背景', component: renderEducationForm },
    { key: 'skills', label: '技能专长', component: renderSkillsForm },
    { key: 'intern', label: '工作经历', component: renderInternForm },
    { key: 'projects', label: '项目经验', component: renderProjectsForm },
  ]

  return (
    <div className="flex h-full">
      {/* 左侧导航 */}
      <div className="w-48 border-r border-gray-200 pr-4">
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setCurrentSection(section.key as 'header' | 'about' | 'education' | 'skills' | 'intern' | 'projects')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentSection === section.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 右侧表单内容 */}
      <div className="flex-1 pl-6">
        <div className="max-h-96 overflow-y-auto">
          {sections.find(s => s.key === currentSection)?.component()}
        </div>
        
        {/* 底部操作按钮 */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <Button
            variant="success"
            onClick={handleSubmit}
          >
            生成简历
          </Button>
        </div>
      </div>
    </div>
  )
}
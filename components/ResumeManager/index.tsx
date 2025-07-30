'use client'

import React, { useState, useEffect } from 'react'
import { ResumeRecord, getAllResumes, addResume, updateResume, deleteResume } from '@/utils/indexedDB'
import { ResumeData } from '@/types'

// 定义文件记录接口
interface FileRecord {
  id: string
  name: string
  data: ResumeData
  type: 'file'
  source: string
}

// 统一的记录类型
type UnifiedRecord = ResumeRecord | FileRecord

interface ResumeManagerProps {
  isOpen: boolean
  onClose: () => void
  onSelectResume: (resumeData: ResumeData) => void
}

/**
 * 简历管理组件 - 提供IndexedDB中简历数据的增删改查功能
 * @param isOpen - 弹窗是否打开
 * @param onClose - 关闭弹窗回调
 * @param onSelectResume - 选择简历回调
 */
export default function ResumeManager({ isOpen, onClose, onSelectResume }: ResumeManagerProps) {
  const [resumes, setResumes] = useState<ResumeRecord[]>([])
  const [fileRecords, setFileRecords] = useState<FileRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<UnifiedRecord | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [editingData, setEditingData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'database' | 'files'>('database')

  /**
   * 加载所有简历记录
   */
  const loadResumes = async () => {
    try {
      setLoading(true)
      const allResumes = await getAllResumes()
      setResumes(allResumes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
    } catch (err) {
      setError('加载简历列表失败')
      console.error('Error loading resumes:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载data目录中的JSON文件记录
   */
  const loadFileRecords = async () => {
    try {
      const response = await fetch('/api/data-files')
      if (response.ok) {
        const records = await response.json()
        setFileRecords(records)
      } else {
        console.error('Failed to load file records:', response.statusText)
      }
    } catch (err) {
      console.error('Error loading file records:', err)
    }
  }

  /**
   * 获取空简历模板
   * @returns 空简历模板对象
   */
  const getEmptyResumeTemplate = async (): Promise<ResumeData> => {
    try {
      const response = await fetch('/data/resume-template.json')
      if (response.ok) {
        return await response.json()
      }
    } catch (err) {
      console.warn('Failed to load template from file, using fallback:', err)
    }
    
    // 如果文件加载失败，使用默认模板
    return {
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
      education: {
        title: "教育经历",
        school: "",
        period: "",
        details: ""
      },
      skills: {
        title: "专业技能",
        items: []
      },
      projects: {
        title: "项目经历",
        items: []
      },
      about: {
        title: "关于我",
        content: ""
      },
    }
  }

  /**
   * 开始编辑简历
   * @param record - 要编辑的记录，null表示新建
   */
  const startEditing = async (record: UnifiedRecord | null = null) => {
    setSelectedRecord(record)
    setEditingName(record?.name || '')
    if (record) {
      setEditingData(JSON.stringify(record.data, null, 2))
    } else {
      const template = await getEmptyResumeTemplate()
      setEditingData(JSON.stringify(template, null, 2))
    }
    setIsEditing(true)
    setError('')
  }

  /**
   * 从模板创建新记录
   * @param template - 模板记录（可以是文件记录或数据库记录）
   */
  const createFromTemplate = async (template: UnifiedRecord) => {
    setSelectedRecord(null) // 设置为null表示新建
    setEditingName(`${template.name} - 副本`)
    setEditingData(JSON.stringify(template.data, null, 2))
    setIsEditing(true)
    setError('')
  }

  /**
   * 保存简历
   */
  const saveResume = async () => {
    try {
      setLoading(true)
      setError('')

      if (!editingName.trim()) {
        setError('请输入简历名称')
        return
      }

      let resumeData: ResumeData
      try {
        resumeData = JSON.parse(editingData)
      } catch {
        setError('JSON格式错误，请检查数据格式')
        return
      }

      if (selectedRecord && 'createdAt' in selectedRecord) {
        // 更新现有数据库简历
        await updateResume(selectedRecord.id, editingName, resumeData)
      } else {
        // 创建新简历（总是保存到数据库）
        await addResume(editingName, resumeData)
      }

      setIsEditing(false)
      setSelectedRecord(null)
      await loadResumes()
    } catch (err) {
      setError('保存简历失败')
      console.error('Error saving resume:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除简历（仅限数据库记录）
   * @param id - 简历ID
   */
  const handleDeleteResume = async (id: string) => {
    if (!confirm('确定要删除这份简历吗？')) return

    try {
      setLoading(true)
      await deleteResume(id)
      await loadResumes()
    } catch (err) {
      setError('删除简历失败')
      console.error('Error deleting resume:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 使用选中的简历
   * @param resumeData - 简历数据
   */
  const handleUseResume = (resumeData: ResumeData) => {
    onSelectResume(resumeData)
    onClose()
  }

  /**
   * 取消编辑
   */
  const cancelEditing = () => {
    setIsEditing(false)
    setSelectedRecord(null)
    setEditingName('')
    setEditingData('')
    setError('')
  }

  // 当弹窗打开时加载数据
  useEffect(() => {
    if (isOpen) {
      loadResumes()
      loadFileRecords()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">简历管理</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* 左侧：记录列表 */}
          <div className="w-1/3 border-r p-4 overflow-y-auto">
            {/* 标签页切换 */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab('database')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'database'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                数据库记录
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                文件记录
              </button>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                {activeTab === 'database' ? '数据库简历' : '文件简历'}
              </h3>
              {activeTab === 'database' && (
                <button
                  onClick={() => startEditing()}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  disabled={loading}
                >
                  新建
                </button>
              )}
            </div>

            {/* 数据库记录列表 */}
            {activeTab === 'database' && (
              loading && resumes.length === 0 ? (
                <div className="text-center text-gray-500 py-8">加载中...</div>
              ) : resumes.length === 0 ? (
                <div className="text-center text-gray-500 py-8">暂无数据库记录</div>
              ) : (
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="border rounded p-3 hover:bg-gray-50"
                    >
                      <div className="font-medium text-sm mb-1">{resume.name}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        更新时间: {new Date(resume.updatedAt).toLocaleString()}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleUseResume(resume.data)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        >
                          使用
                        </button>
                        <button
                          onClick={() => startEditing(resume)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => createFromTemplate(resume)}
                          className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                        >
                          复制
                        </button>
                        <button
                          onClick={() => handleDeleteResume(resume.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        disabled={loading}
                      >
                        删除
                      </button>
                     </div>
                   </div>
                 ))}
               </div>
             ))
            }

            {/* 文件记录列表 */}
            {activeTab === 'files' && (
              loading && fileRecords.length === 0 ? (
                <div className="text-center text-gray-500 py-8">加载中...</div>
              ) : fileRecords.length === 0 ? (
                <div className="text-center text-gray-500 py-8">暂无文件记录</div>
              ) : (
                <div className="space-y-2">
                  {fileRecords.map((file) => (
                    <div
                      key={file.id}
                      className="border rounded p-3 hover:bg-gray-50"
                    >
                      <div className="font-medium text-sm mb-1">{file.name}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        文件路径: {file.source}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleUseResume(file.data)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        >
                          使用
                        </button>
                        <button
                          onClick={() => createFromTemplate(file)}
                          className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                        >
                          复制到数据库
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* 右侧：编辑区域 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {isEditing ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">
                    {selectedRecord ? '编辑简历' : '新建简历'}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={saveResume}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      disabled={loading}
                    >
                      {loading ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">简历名称</label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入简历名称"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium mb-2">简历数据 (JSON格式)</label>
                  <textarea
                    value={editingData}
                    onChange={(e) => setEditingData(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="请输入JSON格式的简历数据"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-lg mb-2">选择一个操作</div>
                  <div className="text-sm">点击左侧的&quot;新建&quot;按钮创建简历，或选择现有简历进行编辑</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
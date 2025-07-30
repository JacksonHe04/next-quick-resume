/**
 * 简历编辑器 Hook
 * 封装简历编辑相关的状态和逻辑
 */

import { useState, useCallback } from 'react'
import { ResumeData } from '@/types'
import { ResumeRecord } from '@/utils/indexedDB'
import { FileRecord } from './useFileRecords'

/**
 * 统一的记录类型
 */
export type UnifiedRecord = ResumeRecord | FileRecord

/**
 * 简历编辑器状态接口
 */
export interface UseResumeEditorState {
  isEditing: boolean
  selectedRecord: UnifiedRecord | null
  editingName: string
  editingData: string
  error: string
}

/**
 * 简历编辑器操作接口
 */
export interface UseResumeEditorActions {
  startEditing: (record?: UnifiedRecord | null) => Promise<void>
  startEditingFromTemplate: (template: UnifiedRecord) => void
  updateEditingName: (name: string) => void
  updateEditingData: (data: string) => void
  validateAndParseData: () => { isValid: boolean; data?: ResumeData; error?: string }
  saveResume: (createResume: (name: string, data: ResumeData) => Promise<void>, updateResume: (id: string, name: string, data: ResumeData) => Promise<void>) => Promise<boolean>
  cancelEditing: () => void
  setError: (error: string) => void
  clearError: () => void
}

/**
 * 简历编辑器 Hook 返回值
 */
export interface UseResumeEditorReturn extends UseResumeEditorState, UseResumeEditorActions {}

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
 * 简历编辑器 Hook
 * 
 * @example
 * ```tsx
 * const {
 *   isEditing,
 *   selectedRecord,
 *   editingName,
 *   editingData,
 *   error,
 *   startEditing,
 *   startEditingFromTemplate,
 *   updateEditingName,
 *   updateEditingData,
 *   validateAndParseData,
 *   cancelEditing,
 *   setError,
 *   clearError
 * } = useResumeEditor()
 * 
 * // 开始编辑
 * const handleEdit = () => {
 *   startEditing(selectedResume)
 * }
 * 
 * // 验证数据
 * const handleSave = () => {
 *   const { isValid, data, error } = validateAndParseData()
 *   if (isValid && data) {
 *     // 保存数据
 *   } else {
 *     setError(error || '数据格式错误')
 *   }
 * }
 * ```
 */
export const useResumeEditor = (): UseResumeEditorReturn => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<UnifiedRecord | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingData, setEditingData] = useState('')
  const [error, setError] = useState('')

  /**
   * 开始编辑简历
   * @param record - 要编辑的记录，null 表示新建
   */
  const startEditing = useCallback(async (record: UnifiedRecord | null = null) => {
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
  }, [])

  /**
   * 从模板创建新记录
   * @param template - 模板记录（可以是文件记录或数据库记录）
   */
  const startEditingFromTemplate = useCallback((template: UnifiedRecord) => {
    setSelectedRecord(null) // 设置为 null 表示新建
    setEditingName(`${template.name} - 副本`)
    setEditingData(JSON.stringify(template.data, null, 2))
    setIsEditing(true)
    setError('')
  }, [])

  /**
   * 更新编辑中的名称
   * @param name - 新的名称
   */
  const updateEditingName = useCallback((name: string) => {
    setEditingName(name)
  }, [])

  /**
   * 更新编辑中的数据
   * @param data - 新的数据
   */
  const updateEditingData = useCallback((data: string) => {
    setEditingData(data)
  }, [])

  /**
   * 验证并解析编辑中的数据
   * @returns 验证结果
   */
  const validateAndParseData = useCallback(() => {
    // 验证名称
    if (!editingName.trim()) {
      return {
        isValid: false,
        error: '请输入简历名称'
      }
    }

    // 验证并解析 JSON 数据
    try {
      const data: ResumeData = JSON.parse(editingData)
      return {
        isValid: true,
        data
      }
    } catch {
      return {
        isValid: false,
        error: 'JSON格式错误，请检查数据格式'
      }
    }
  }, [editingName, editingData])

  /**
   * 取消编辑
   */
  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setSelectedRecord(null)
    setEditingName('')
    setEditingData('')
    setError('')
  }, [])

  /**
   * 设置错误信息
   * @param errorMessage - 错误信息
   */
  const setErrorMessage = useCallback((errorMessage: string) => {
    setError(errorMessage)
  }, [])

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError('')
  }, [])

  /**
   * 保存简历
   */
  const saveResume = useCallback(async (
    createResume: (name: string, data: ResumeData) => Promise<void>,
    updateResume: (id: string, name: string, data: ResumeData) => Promise<void>
  ): Promise<boolean> => {
    try {
      setError('')
      
      const { isValid, data, error } = validateAndParseData()
      if (!isValid) {
        setError(error || '数据格式错误')
        return false
      }
      
      if (selectedRecord && 'createdAt' in selectedRecord) {
        // 更新现有数据库简历
        await updateResume(selectedRecord.id, editingName, data!)
      } else {
        // 创建新简历
        await createResume(editingName, data!)
      }
      
      // 重置编辑状态
      cancelEditing()
      return true
    } catch (err) {
      setError('保存简历失败')
      console.error('Error saving resume:', err)
      return false
    }
  }, [editingName, validateAndParseData, selectedRecord, cancelEditing])

  return {
    // 状态
    isEditing,
    selectedRecord,
    editingName,
    editingData,
    error,
    // 操作
    startEditing,
    startEditingFromTemplate,
    updateEditingName,
    updateEditingData,
    validateAndParseData,
    saveResume,
    cancelEditing,
    setError: setErrorMessage,
    clearError
  }
}
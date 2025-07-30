/**
 * 简历数据管理 Hook
 * 封装 IndexedDB 简历数据的增删改查逻辑
 */

import { useState, useCallback } from 'react'
import { 
  ResumeRecord, 
  getAllResumes, 
  addResume, 
  updateResume, 
  deleteResume 
} from '@/utils/indexedDB'
import { ResumeData } from '@/types'

/**
 * 简历数据管理状态接口
 */
export interface UseResumeDataState {
  resumes: ResumeRecord[]
  loading: boolean
  error: string
}

/**
 * 简历数据管理操作接口
 */
export interface UseResumeDataActions {
  loadResumes: () => Promise<void>
  createResume: (name: string, data: ResumeData) => Promise<void>
  updateResumeData: (id: string, data: ResumeData) => Promise<void>
  updateResumeComplete: (id: string, name: string, data: ResumeData) => Promise<void>
  removeResume: (id: string) => Promise<void>
  deleteResumeById: (id: string) => Promise<boolean>
  clearError: () => void
}

/**
 * 简历数据管理 Hook 返回值
 */
export interface UseResumeDataReturn extends UseResumeDataState, UseResumeDataActions {}

/**
 * 简历数据管理 Hook
 * 
 * @example
 * ```tsx
 * const {
 *   resumes,
 *   loading,
 *   error,
 *   loadResumes,
 *   createResume,
 *   updateResumeData,
 *   removeResume,
 *   clearError
 * } = useResumeData()
 * 
 * // 加载简历列表
 * useEffect(() => {
 *   loadResumes()
 * }, [])
 * 
 * // 创建新简历
 * const handleCreate = async () => {
 *   const id = await createResume('新简历', resumeData)
 *   console.log('创建成功，ID:', id)
 * }
 * ```
 */
export const useResumeData = (): UseResumeDataReturn => {
  const [resumes, setResumes] = useState<ResumeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * 加载所有简历记录
   */
  const loadResumes = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const allResumes = await getAllResumes()
      // 按更新时间倒序排列
      const sortedResumes = allResumes.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setResumes(sortedResumes)
    } catch (err) {
      const errorMessage = '加载简历列表失败'
      setError(errorMessage)
      console.error('Error loading resumes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 创建新简历
   * @param name - 简历名称
   * @param data - 简历数据
   */
  const createResume = useCallback(async (name: string, data: ResumeData): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      
      if (!name.trim()) {
        throw new Error('请输入简历名称')
      }
      
      await addResume(name, data)
      await loadResumes() // 重新加载列表
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建简历失败'
      setError(errorMessage)
      console.error('Error creating resume:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadResumes])

  /**
   * 更新简历数据
   * @param id - 简历ID
   * @param data - 新的简历数据
   */
  const updateResumeData = useCallback(async (id: string, data: ResumeData): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      
      // 查找要更新的简历
      const existingResume = resumes.find(resume => resume.id === id)
      if (!existingResume) {
        throw new Error('简历不存在')
      }
      
      await updateResume(id, existingResume.name, data)
      await loadResumes() // 重新加载列表
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新简历失败'
      setError(errorMessage)
      console.error('Error updating resume data:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [resumes, loadResumes])

  /**
   * 更新简历（包括名称和数据）
   * @param id - 简历ID
   * @param name - 简历名称
   * @param data - 简历数据
   */
  const updateResumeComplete = useCallback(async (id: string, name: string, data: ResumeData): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      
      if (!name.trim()) {
        throw new Error('请输入简历名称')
      }
      
      await updateResume(id, name, data)
      await loadResumes() // 重新加载列表
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新简历失败'
      setError(errorMessage)
      console.error('Error updating resume:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadResumes])

  /**
   * 删除简历
   * @param id - 简历ID
   */
  const removeResume = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      await deleteResume(id)
      await loadResumes() // 重新加载列表
    } catch (err) {
      const errorMessage = '删除简历失败'
      setError(errorMessage)
      console.error('Error deleting resume:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadResumes])

  /**
   * 删除简历（带确认）
   * @param id - 简历ID
   */
  const deleteResumeById = useCallback(async (id: string): Promise<boolean> => {
    if (!confirm('确定要删除这份简历吗？')) {
      return false
    }
    
    try {
      setLoading(true)
      setError('')
      await deleteResume(id)
      await loadResumes() // 重新加载列表
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除简历失败'
      setError(errorMessage)
      console.error('Error deleting resume:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadResumes])

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError('')
  }, [])

  return {
    // 状态
    resumes,
    loading,
    error,
    // 操作
    loadResumes,
    createResume,
    updateResumeData,
    updateResumeComplete,
    removeResume,
    deleteResumeById,
    clearError
  }
}
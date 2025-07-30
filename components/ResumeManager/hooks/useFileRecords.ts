/**
 * 文件记录管理 Hook
 * 封装从 data 目录加载 JSON 文件的逻辑
 */

import { useState, useCallback } from 'react'
import { ResumeData } from '@/types'

/**
 * 文件记录接口
 */
export interface FileRecord {
  id: string
  name: string
  data: ResumeData
  type: 'file'
  source: string
}

/**
 * 文件记录管理状态接口
 */
export interface UseFileRecordsState {
  fileRecords: FileRecord[]
  loading: boolean
  error: string
}

/**
 * 文件记录管理操作接口
 */
export interface UseFileRecordsActions {
  loadFileRecords: () => Promise<void>
  clearError: () => void
}

/**
 * 文件记录管理 Hook 返回值
 */
export interface UseFileRecordsReturn extends UseFileRecordsState, UseFileRecordsActions {}

/**
 * 文件记录管理 Hook
 * 
 * @example
 * ```tsx
 * const {
 *   fileRecords,
 *   loading,
 *   error,
 *   loadFileRecords,
 *   clearError
 * } = useFileRecords()
 * 
 * // 加载文件记录
 * useEffect(() => {
 *   loadFileRecords()
 * }, [])
 * ```
 */
export const useFileRecords = (): UseFileRecordsReturn => {
  const [fileRecords, setFileRecords] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * 加载 data 目录中的 JSON 文件记录
   */
  const loadFileRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/data-files')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const records: FileRecord[] = await response.json()
      setFileRecords(records)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `加载文件记录失败: ${err.message}`
        : '加载文件记录失败'
      setError(errorMessage)
      console.error('Error loading file records:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError('')
  }, [])

  return {
    // 状态
    fileRecords,
    loading,
    error,
    // 操作
    loadFileRecords,
    clearError
  }
}
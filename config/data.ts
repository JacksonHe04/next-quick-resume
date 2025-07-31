/**
 * 数据配置文件
 * 统一管理简历数据源，支持从JSON文件或IndexedDB加载数据
 */

import { ResumeData } from '@/types'

// 数据源类型
export type DataSource = 'json' | 'indexeddb'

// 当前使用的数据源类型
export const CURRENT_DATA_SOURCE: DataSource = 'json'

// 静态导入的简历数据（用于JSON数据源）
// 默认导入标准数据源，避免构建时模块解析错误
import defaultResumeData from '@/data/resume.json'

/**
 * 检查当前是否运行在3000端口
 * @returns 如果是3000端口返回true，否则返回false
 */
const getIsPort3000 = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.location.port === '3000'
  }
  // 服务器端检查环境变量或默认端口
  return process.env.PORT === '3000' || process.env.NODE_ENV === 'development'
}

/**
 * 动态加载简历数据
 * @returns Promise<ResumeData> 简历数据
 */
const loadResumeData = async (): Promise<ResumeData> => {
  const isPort3000 = getIsPort3000()
  
  if (isPort3000) {
    try {
      // 尝试动态导入本地数据文件
      const localData = await import('@/data_local/this.json')
      return localData.default
    } catch (error) {
      // 如果本地文件不存在，回退到默认数据
      console.warn('本地数据文件不存在，使用默认数据源')
      return defaultResumeData
    }
  }
  
  return defaultResumeData
}

// 初始化静态数据
let staticResumeData: ResumeData = defaultResumeData

// 异步加载数据并更新
loadResumeData().then(data => {
  staticResumeData = data
  currentResumeData = data
}).catch(() => {
  // 加载失败时使用默认数据
  staticResumeData = defaultResumeData
  currentResumeData = defaultResumeData
})

// 当前使用的简历数据（可以通过setCurrentResumeData动态更新）
let currentResumeData: ResumeData = staticResumeData

/**
 * 获取当前简历数据（同步）
 * @returns 当前简历数据对象
 */
export const getCurrentResumeData = (): ResumeData => {
  return currentResumeData
}

/**
 * 异步获取简历数据（确保获取最新数据）
 * @returns Promise<ResumeData> 简历数据
 */
export const getResumeDataAsync = async (): Promise<ResumeData> => {
  try {
    const data = await loadResumeData()
    setCurrentResumeData(data)
    return data
  } catch (error) {
    console.error('加载简历数据失败:', error)
    return currentResumeData
  }
}

/**
 * 设置当前简历数据
 * @param data - 新的简历数据
 */
export const setCurrentResumeData = (data: ResumeData): void => {
  currentResumeData = data
}

/**
 * 重置为默认简历数据
 */
export const resetToDefaultResumeData = (): void => {
  currentResumeData = staticResumeData
}

// 导出当前简历数据（保持向后兼容）
export const resumeData = currentResumeData
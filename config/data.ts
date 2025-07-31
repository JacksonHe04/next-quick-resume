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
// 根据端口号动态选择导入路径
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

const isPort3000 = getIsPort3000()
const staticResumeData = isPort3000 
  ? require('@/data_local/this.json')
  : require('@/data/resume.json')

// 当前使用的简历数据（可以通过setCurrentResumeData动态更新）
let currentResumeData: ResumeData = staticResumeData

/**
 * 获取当前简历数据
 * @returns 当前简历数据对象
 */
export const getCurrentResumeData = (): ResumeData => {
  return currentResumeData
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
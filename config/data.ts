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
import staticResumeData from '@/data/resume.json'
// import staticResumeData from '@/data_local/this.json'

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
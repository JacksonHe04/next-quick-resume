/**
 * 数据配置文件
 * 统一管理简历数据源，支持从JSON文件或IndexedDB加载数据
 */

import { ResumeData, ResumeConfig } from '@/types'

// 数据源类型
export type DataSource = 'json' | 'indexeddb'

// 当前使用的数据源类型
export const CURRENT_DATA_SOURCE: DataSource = 'json'

// 首页默认显示的 JSON 数据源
// GitHub 公开的 JSON 模板
import defaultResumeData from '@/data/resume-template-cn.json'

// 默认模块顺序
export const DEFAULT_SECTION_ORDER: string[] = ['header', 'education', 'intern', 'projects', 'skills', 'about']

// 默认模块标签映射
export const SECTION_LABELS: Record<string, string> = {
  header: '个人信息',
  education: '教育经历',
  intern: '实习经历',
  projects: '项目经历',
  skills: '专业技能',
  about: '关于我',
}

/**
 * 获取默认简历配置
 * @returns 包含默认模块顺序、全部模块可见、serif 字体、1.5 倍行距、16px 字号的配置对象
 */
export const getDefaultConfig = (): ResumeConfig => ({
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  sectionVisibility: Object.fromEntries(DEFAULT_SECTION_ORDER.map(key => [key, true])),
  fontFamily: 'serif',
  lineHeight: 1.5,
  fontSize: 16,
})

// 当前使用的简历数据（可以通过setCurrentResumeData动态更新）
let currentResumeData: ResumeData = defaultResumeData

// 导出默认数据源
export { defaultResumeData }

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
  currentResumeData = defaultResumeData
}

// 导出当前简历数据（保持向后兼容）
export const resumeData = currentResumeData
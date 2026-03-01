/**
 * 数据配置文件
 * 统一管理简历数据源，支持从JSON文件或IndexedDB加载数据
 */

import { ResumeData, ResumeDisplayConfig, CurrentResumeState } from '@/types'
import { getDefaultResumeConfig } from '@/utils/indexedDB'

// 数据源类型
export type DataSource = 'json' | 'indexeddb'

// 当前使用的数据源类型
export const CURRENT_DATA_SOURCE: DataSource = 'json'

// 首页默认显示的 JSON 数据源
// GitHub 公开的 JSON 模板
import defaultResumeData from '@/data/resume-template-cn.json'

// 当前简历状态（包含数据和配置）
let currentResumeState: CurrentResumeState = {
  data: defaultResumeData as ResumeData,
  config: getDefaultResumeConfig(),
  source: 'template',
  name: '模板简历'
}

// 导出默认数据源
export { defaultResumeData }

/**
 * 获取当前简历状态
 * @returns 当前简历状态对象
 */
export const getCurrentResumeState = (): CurrentResumeState => {
  return { ...currentResumeState }
}

/**
 * 获取当前简历数据
 * @returns 当前简历数据对象
 */
export const getCurrentResumeData = (): ResumeData => {
  return currentResumeState.data
}

/**
 * 获取当前简历配置
 * @returns 当前简历显示配置
 */
export const getCurrentResumeConfig = (): ResumeDisplayConfig => {
  return currentResumeState.config
}

/**
 * 设置当前简历状态（完整）
 * @param state - 新的简历状态
 */
export const setCurrentResumeState = (state: Partial<CurrentResumeState>): void => {
  currentResumeState = { ...currentResumeState, ...state }
}

/**
 * 设置当前简历数据
 * @param data - 新的简历数据
 */
export const setCurrentResumeData = (data: ResumeData): void => {
  currentResumeState.data = data
}

/**
 * 设置当前简历配置
 * @param config - 新的简历显示配置
 */
export const setCurrentResumeConfig = (config: ResumeDisplayConfig): void => {
  currentResumeState.config = config
}

/**
 * 设置当前简历名称
 * @param name - 新的简历名称
 */
export const setCurrentResumeName = (name: string): void => {
  currentResumeState.name = name
}

/**
 * 更新简历配置中的模块可见性
 * @param key - 模块键名
 * @param visible - 是否可见
 */
export const updateSectionVisibility = (key: string, visible: boolean): void => {
  const section = currentResumeState.config.sections.find(s => s.key === key)
  if (section) {
    section.visible = visible
  }
}

/**
 * 更新简历模块排序
 * @param newOrder - 新的模块顺序
 */
export const updateSectionOrder = (newOrder: string[]): void => {
  currentResumeState.config.sectionOrder = newOrder as ResumeDisplayConfig['sectionOrder']
}

/**
 * 重置为默认简历数据
 */
export const resetToDefaultResumeData = (): void => {
  currentResumeState = {
    data: defaultResumeData as ResumeData,
    config: getDefaultResumeConfig(),
    source: 'template'
  }
}

/**
 * 检查当前是否为模板简历
 * @returns 是否为模板简历
 */
export const isTemplateResume = (): boolean => {
  return currentResumeState.source === 'template'
}

/**
 * 获取当前简历记录ID（如果是数据库简历）
 * @returns 记录ID或undefined
 */
export const getCurrentResumeId = (): string | undefined => {
  return currentResumeState.recordId
}

// 导出当前简历数据（保持向后兼容）
export const resumeData = currentResumeState.data

/**
 * ResumeManager 子组件统一导出文件
 */

// 标签导航组件
export { default as TabNavigation } from './TabNavigation'
export type { TabNavigationProps, TabType } from './TabNavigation'

// 操作按钮组件
export {
  DatabaseRecordActions,
  FileRecordActions,
  EditorActions
} from './ActionButtons'
export type {
  DatabaseRecordActionsProps,
  FileRecordActionsProps,
  EditorActionsProps
} from './ActionButtons'

// 简历列表组件
export {
  DatabaseResumeList,
  FileResumeList
} from './ResumeList'
export type {
  DatabaseResumeListProps,
  FileResumeListProps
} from './ResumeList'

// 简历编辑器组件
export { default as ResumeEditor } from './ResumeEditor'
export type { ResumeEditorProps } from './ResumeEditor'
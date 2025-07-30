/**
 * ResumeManager Hooks 统一导出文件
 */

// 简历数据管理 Hook
export { useResumeData } from './useResumeData'
export type { 
  UseResumeDataState, 
  UseResumeDataActions, 
  UseResumeDataReturn 
} from './useResumeData'

// 文件记录管理 Hook
export { useFileRecords } from './useFileRecords'
export type { 
  FileRecord,
  UseFileRecordsState, 
  UseFileRecordsActions, 
  UseFileRecordsReturn 
} from './useFileRecords'

// 简历编辑器 Hook
export { useResumeEditor } from './useResumeEditor'
export type { 
  UnifiedRecord,
  UseResumeEditorState, 
  UseResumeEditorActions, 
  UseResumeEditorReturn 
} from './useResumeEditor'
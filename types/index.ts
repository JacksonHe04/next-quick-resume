/**
 * 全局类型定义文件
 * 统一管理所有组件的数据类型接口
 */

// 联系方式信息接口
export interface ContactInfo {
  phone: string
  email: string
  wechat?: string
  age?: string
  github?: {
    text: string
    url: string
  }
  homepage?: {
    text: string
    url: string
  }
}

// 工作信息接口
export interface JobInfo {
  position?: string
  duration?: string
  availability?: string
}

// 头部组件数据接口
export interface HeaderData {
  name: string
  contact: ContactInfo
  jobInfo: JobInfo
}

// 教育经历数据接口
export interface EducationData {
  title: string
  school: string
  base?: string
  period: string
  details: string
  image?: string
}

// 技能数据接口
export interface SkillsData {
  title: string
  items: string[]
}

// 项目信息接口
export interface ProjectItem {
  name: string
  github: string
  demo?: string
  techStack?: string
  description: string
  features: string[]
  show?: boolean
}

// 实习经历项目接口
export interface InternItem {
  company: string
  position: string
  period: string
  base: string
  description: string
  responsibilities: string[]
  show?: boolean
  image?: string
}

// 实习经历数据接口
export interface InternData {
  title: string
  items: InternItem[]
}

// 项目数据接口
export interface ProjectsData {
  title: string
  items: ProjectItem[]
}

// 关于我数据接口
export interface AboutData {
  title: string
  content: string
}

// 统一简历数据接口
export interface ResumeData {
  header: HeaderData
  about?: AboutData
  education?: EducationData
  skills?: SkillsData
  intern?: InternData
  projects?: ProjectsData
}

// 通用节标题组件属性接口
export interface SectionTitleProps {
  children: React.ReactNode
  className?: string
}

// 通用节容器组件属性接口
export interface SectionContainerProps {
  children: React.ReactNode
  className?: string
}

// 通用链接组件属性接口
export interface LinkProps {
  href: string
  children: React.ReactNode
  className?: string
  target?: '_blank' | '_self'
  underline?: boolean
}

// 简历模块类型
export type ResumeSectionKey = 'header' | 'education' | 'intern' | 'projects' | 'skills' | 'about'

// 简历模块配置项
export interface ResumeSectionConfig {
  key: ResumeSectionKey
  label: string
  visible: boolean
}

// 头部区域对齐方式
export type HeaderAlignment = 'left' | 'center'

// 照片配置
export interface PhotoConfig {
  /** 是否显示照片 */
  showPhoto: boolean
  /** 照片数据（Base64） */
  photoData?: string
}

// 简历显示配置
export interface ResumeDisplayConfig {
  sections: ResumeSectionConfig[]
  sectionOrder: ResumeSectionKey[]
  /** 头部区域对齐方式 */
  headerAlignment: HeaderAlignment
  /** 照片配置 */
  photo: PhotoConfig
}

// 服务端持久化使用的版本化简历文档。后续数据结构升级必须新增版本，
// 不能在不变更 schemaVersion 的情况下改变既有字段语义。
export interface ResumeDocumentV1 {
  schemaVersion: 1
  data: ResumeData
  displayConfig: ResumeDisplayConfig
}

// 带配置的简历数据
export interface ResumeDataWithConfig {
  data: ResumeData
  config: ResumeDisplayConfig
}

// 扩展的简历记录（带配置）
export interface ResumeRecordWithConfig {
  id: string
  name: string
  data: ResumeData
  config: ResumeDisplayConfig
  createdAt: Date
  updatedAt: Date
}

// 当前简历状态
export interface CurrentResumeState {
  data: ResumeData
  config: ResumeDisplayConfig
  source: 'template' | 'database'
  recordId?: string
  name?: string
}

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

// 简历配置接口 - 控制简历展示样式和布局
export interface ResumeConfig {
  /** 模块显示顺序 */
  sectionOrder: string[]
  /** 模块显隐控制 */
  sectionVisibility: Record<string, boolean>
  /** 字体 */
  fontFamily?: string
  /** 行间距 (倍数, 如 1.5) */
  lineHeight?: number
  /** 字体大小 (px) */
  fontSize?: number
}

// 统一简历数据接口
export interface ResumeData {
  header: HeaderData
  about?: AboutData
  education: EducationData
  skills?: SkillsData
  intern?: InternData
  projects?: ProjectsData
  /** 简历配置（模块顺序、显隐、字体、行间距等） */
  config?: ResumeConfig
  /** 头像照片 (base64 编码) */
  avatarBase64?: string
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

// AI优化相关类型定义
export interface AiOptimizeRequest {
  currentResume: ResumeData
  suggestions?: string
  jobDescription?: string
}

export interface AiOptimizeResponse {
  success: boolean
  data?: ResumeData
  error?: string
}
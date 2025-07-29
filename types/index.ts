/**
 * 全局类型定义文件
 * 统一管理所有组件的数据类型接口
 */

// 联系方式信息接口
export interface ContactInfo {
  phone: string
  email: string
  wechat: string
  age: string
  github: {
    text: string
    url: string
  }
  homepage: {
    text: string
    url: string
  }
}

// 工作信息接口
export interface JobInfo {
  position: string
  duration: string
  availability: string
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
  demo: string
  techStack: string
  description: string
  features: string[]
  show: boolean
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
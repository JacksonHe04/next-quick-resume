/**
 * 样式常量文件
 * 统一管理所有组件的样式类名，提高复用性和一致性
 */

// 容器样式
export const CONTAINER_STYLES = {
  // 主要内容容器
  section: 'mb-4',
  // 项目容器
  project: 'mb-3',
  // 头部容器
  header: 'mb-4',
} as const

// 标题样式
export const TITLE_STYLES = {
  // 主标题（姓名）
  main: 'text-4xl font-bold m-0',
  // 副标题（职位）
  subtitle: 'text-xl text-gray-600 mt-2',
  // 节标题
  section: 'text-xl font-bold text-black py-1 mb-2 border-b border-black',
  // 项目标题
  project: 'font-bold text-lg',
} as const

// 文本样式
export const TEXT_STYLES = {
  // 基础文本
  base: 'text-base',
  // 描述文本
  description: 'text-gray-700 text-base mb-1.5',
  // 技术栈文本
  techStack: 'text-black text-base',
  // 时间文本
  period: 'text-gray-600 text-base',
} as const

// 链接样式
export const LINK_STYLES = {
  // 带下划线链接
  underlined: 'text-black underline',
  // 无下划线链接
  plain: 'text-black no-underline',
  // 小尺寸链接
  small: 'text-black underline text-base',
} as const

// 列表样式
export const LIST_STYLES = {
  // 基础列表
  base: 'list-disc list-inside pl-2.5 ml-0 text-base space-y-1',
} as const

// 布局样式
export const LAYOUT_STYLES = {
  // 网格布局
  grid: 'grid grid-cols-2 gap-8',
  // 弹性布局 - 两端对齐
  flexBetween: 'flex justify-between items-center',
  // 弹性布局 - 两端对齐（带间距）
  flexBetweenMb: 'flex justify-between items-center mb-1.5',
  // 弹性布局 - 两端对齐（小间距）
  flexBetweenSmall: 'flex justify-between mb-1.5 text-base',
  // 文本居中
  textCenter: 'text-center',
  // 文本右对齐
  textRight: 'text-right',
  // 文本左对齐
  textLeft: 'text-left',
} as const

// 组合样式（常用样式组合）
export const COMBINED_STYLES = {
  // 节容器完整样式
  sectionContainer: `${CONTAINER_STYLES.section}`,
  // 节标题完整样式
  sectionTitle: `${TITLE_STYLES.section}`,
  // 项目标题行样式
  projectTitleRow: `${LAYOUT_STYLES.flexBetweenMb}`,
  // 项目信息行样式
  projectInfoRow: `${LAYOUT_STYLES.flexBetweenSmall}`,
} as const
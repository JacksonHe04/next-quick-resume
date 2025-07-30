/**
 * 标签导航组件
 * 用于在数据库记录和文件记录之间切换
 */

import React from 'react'
import { cn } from '@/utils/cn'

/**
 * 标签类型
 */
export type TabType = 'database' | 'files'

/**
 * 标签导航组件属性接口
 */
export interface TabNavigationProps {
  /** 当前激活的标签 */
  activeTab: TabType
  /** 标签切换回调 */
  onTabChange: (tab: TabType) => void
  /** 数据库记录数量 */
  databaseCount: number
  /** 文件记录数量 */
  fileCount: number
  /** 自定义类名 */
  className?: string
}

/**
 * 标签配置
 */
const tabs = [
  {
    key: 'database' as const,
    label: '数据库记录',
    description: '存储在浏览器本地数据库中的简历'
  },
  {
    key: 'files' as const,
    label: '文件记录',
    description: '从 data 目录加载的 JSON 文件'
  }
]

/**
 * 获取标签样式类名
 * @param isActive - 是否为激活状态
 * @returns 样式类名
 */
const getTabClassName = (isActive: boolean): string => {
  const baseClasses = [
    'px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200',
    'hover:text-gray-700 focus:outline-none focus:text-gray-700'
  ]

  if (isActive) {
    baseClasses.push('border-blue-500 text-blue-600')
  } else {
    baseClasses.push('border-transparent text-gray-500')
  }

  return baseClasses.join(' ')
}

/**
 * 标签导航组件
 * 
 * @example
 * ```tsx
 * const [activeTab, setActiveTab] = useState<TabType>('database')
 * 
 * <TabNavigation 
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   databaseCount={5}
 *   fileCount={3}
 * />
 * ```
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  databaseCount,
  fileCount,
  className
}) => {
  return (
    <div className={cn('flex border-b mb-4', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={getTabClassName(activeTab === tab.key)}
          title={tab.description}
          aria-selected={activeTab === tab.key}
          role="tab"
        >
          {tab.label}
          {tab.key === 'database' && databaseCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {databaseCount}
            </span>
          )}
          {tab.key === 'files' && fileCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {fileCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation
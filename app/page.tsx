'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Intern from '@/components/Intern'
import Projects from '@/components/Projects'
import About from '@/components/About'
import CreateResumeModal from '@/components/CreateResumeModal'
import AiOptimizeModal from '@/components/AiOptimizeModal'
import ResumeSidebar from '@/components/ResumeSidebar'
import ResumeRightSidebar, { ResumeRightSidebarRef } from '@/components/ResumeRightSidebar'
import TopBar from '@/components/TopBar'
import {
  setCurrentResumeData,
  getCurrentResumeData,
  setCurrentResumeConfig,
  setCurrentResumeState,
  getCurrentResumeState
} from '@/config/data'
import { ResumeData, ResumeDisplayConfig } from '@/types'
import { getDefaultResumeConfig } from '@/utils/indexedDB'

/**
 * 简历主页面组件 - 整合所有简历模块
 * 
 * 布局结构：
 * - 顶部顶栏（固定）：模式切换、简历名称编辑、操作按钮
 * - 主体区域（flex）：
 *   - 左侧管理栏（可调整宽度）：模块控制/JSON编辑、保存/克隆
 *   - 中间简历内容（自适应）：简历展示
 *   - 右侧列表栏（可调整宽度）：简历列表、删除功能
 */
export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  // 当前简历状态和配置
  const [currentConfig, setCurrentConfig] = useState<ResumeDisplayConfig>(getDefaultResumeConfig())
  const [currentData, setCurrentData] = useState<ResumeData>(getCurrentResumeData())
  const [isTemplate, setIsTemplate] = useState(true)
  const [currentRecordId, setCurrentRecordId] = useState<string | undefined>(undefined)
  const [currentResumeName, setCurrentResumeName] = useState<string>('')
  
  // 视图模式状态
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview')

  // 侧边栏宽度状态
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  
  // 移动端侧边栏显示状态
  const [showLeftSidebar, setShowLeftSidebar] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(false)

  // 用于拖拽调整的 ref
  const containerRef = useRef<HTMLDivElement>(null)
  // 右侧边栏 ref，用于刷新简历列表
  const rightSidebarRef = useRef<ResumeRightSidebarRef>(null)

  /**
   * 同步全局状态到本地状态
   */
  const syncGlobalState = useCallback(() => {
    const state = getCurrentResumeState()
    setCurrentData(state.data)
    setCurrentConfig(state.config)
    setIsTemplate(state.source === 'template')
    setCurrentRecordId(state.recordId)
    setCurrentResumeName(state.name || '')
  }, [])

  /**
   * 初始化状态
   */
  useEffect(() => {
    syncGlobalState()
  }, [syncGlobalState, refreshKey])

  /**
   * 处理左侧拖拽调整
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft && containerRef.current) {
        const newWidth = e.clientX
        if (newWidth >= 200 && newWidth <= 500) {
          setLeftSidebarWidth(newWidth)
        }
      }
      if (isResizingRight && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const newWidth = containerWidth - e.clientX
        if (newWidth >= 200 && newWidth <= 500) {
          setRightSidebarWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizingLeft(false)
      setIsResizingRight(false)
    }

    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingLeft, isResizingRight])

  /**
   * 关闭所有弹窗
   */
  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowAiModal(false)
  }

  /**
   * 打开创建简历弹窗
   */
  const openCreateModal = () => {
    closeAllModals()
    setShowCreateModal(true)
  }

  /**
   * 打开AI简历优化弹窗
   */
  const openAiModal = () => {
    closeAllModals()
    setShowAiModal(true)
  }

  /**
   * 打印简历功能
   */
  const handlePrintResume = () => {
    window.print()
  }

  /**
   * 处理导出为PDF
   */
  const handleExportPDF = () => {
    handlePrintResume()
  }

  /**
   * 处理导出为Markdown
   */
  const handleExportMarkdown = () => {
    const data = getCurrentResumeData()
    let markdown = `# ${data.header.name}\n\n`

    // 添加联系方式
    markdown += `## 联系方式\n`
    markdown += `- 电话/微信：${data.header.contact.phone}\n`
    markdown += `- 邮箱：${data.header.contact.email}\n`
    if (data.header.contact.github) {
      markdown += `- GitHub：[${data.header.contact.github.text}](${data.header.contact.github.url})\n`
    }
    if (data.header.contact.homepage) {
      markdown += `- 主页：[${data.header.contact.homepage.text}](${data.header.contact.homepage.url})\n`
    }
    markdown += `\n`

    // 添加教育背景
    if (data.education) {
      markdown += `## ${data.education.title}\n`
      markdown += `- 学校：${data.education.school}\n`
      markdown += `- 时间：${data.education.period}\n`
      markdown += `- 详情：${data.education.details}\n`
      markdown += `\n`
    }

    // 添加技能
    if (data.skills) {
      markdown += `## ${data.skills.title}\n`
      data.skills.items.forEach(skill => {
        markdown += `- ${skill}\n`
      })
      markdown += `\n`
    }

    // 添加实习经历
    if (data.intern) {
      markdown += `## ${data.intern.title}\n`
      data.intern.items.forEach(item => {
        markdown += `### ${item.company} - ${item.position}\n`
        markdown += `- 时间：${item.period}\n`
        markdown += `- 地点：${item.base}\n`
        markdown += `- 描述：${item.description}\n`
        if (item.responsibilities && item.responsibilities.length > 0) {
          markdown += `- 职责：\n`
          item.responsibilities.forEach(responsibility => {
            markdown += `  - ${responsibility}\n`
          })
        }
        markdown += `\n`
      })
    }

    // 添加项目经历
    if (data.projects) {
      markdown += `## ${data.projects.title}\n`
      data.projects.items.forEach(item => {
        markdown += `### ${item.name}\n`
        markdown += `- GitHub：${item.github}\n`
        if (item.demo) {
          markdown += `- 演示：${item.demo}\n`
        }
        if (item.techStack) {
          markdown += `- 技术栈：${item.techStack}\n`
        }
        markdown += `- 描述：${item.description}\n`
        if (item.features && item.features.length > 0) {
          markdown += `- 功能：\n`
          item.features.forEach(feature => {
            markdown += `  - ${feature}\n`
          })
        }
        markdown += `\n`
      })
    }

    // 添加关于我
    if (data.about) {
      markdown += `## ${data.about.title}\n`
      markdown += `${data.about.content}\n`
    }

    // 复制到剪贴板
    navigator.clipboard.writeText(markdown).then(() => {
      setShowCopySuccess(true)
      setTimeout(() => {
        setShowCopySuccess(false)
      }, 3000)
    }).catch(err => {
      console.error('无法复制内容: ', err)
    })
  }

  /**
   * 处理配置变更
   */
  const handleConfigChange = useCallback((config: ResumeDisplayConfig) => {
    setCurrentConfig(config)
    setCurrentResumeConfig(config)
  }, [])

  /**
   * 处理数据变更（编辑模式）
   */
  const handleDataChange = useCallback((data: ResumeData) => {
    setCurrentData(data)
    setCurrentResumeData(data)
    // 触发重新渲染
    setRefreshKey(prev => prev + 1)
  }, [])

  /**
   * 处理简历选择
   */
  const handleSelectResume = useCallback((resumeData: ResumeData, recordId?: string, config?: ResumeDisplayConfig, name?: string) => {
    if (recordId) {
      // 从数据库加载的简历
      setCurrentResumeState({
        data: resumeData,
        config: config || getDefaultResumeConfig(),
        source: 'database',
        recordId,
        name: name || '未命名简历'
      })
    } else {
      // 模板简历或其他
      setCurrentResumeData(resumeData)
    }
    closeAllModals()
    setRefreshKey(prev => prev + 1)
  }, [])

  /**
   * 强制刷新
   */
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  /**
   * 处理模式切换
   */
  const handleModeChange = useCallback((mode: 'preview' | 'edit') => {
    setViewMode(mode)
  }, [])

  /**
   * 切换左侧边栏（移动端）
   */
  const toggleLeftSidebar = useCallback(() => {
    setShowLeftSidebar(prev => !prev)
  }, [])

  /**
   * 切换右侧边栏（移动端）
   */
  const toggleRightSidebar = useCallback(() => {
    setShowRightSidebar(prev => !prev)
  }, [])

  // 组件映射表
  const componentMap: Record<string, React.ComponentType> = {
    header: Header,
    education: Education,
    intern: Intern,
    projects: Projects,
    skills: Skills,
    about: About
  }

  /**
   * 获取可见且按顺序排列的组件列表
   */
  const getVisibleComponents = () => {
    const visibleSections = currentConfig.sections
      .filter(s => s.visible)
      .map(s => s.key)

    return currentConfig.sectionOrder
      .filter(key => visibleSections.includes(key))
      .filter(key => currentData[key as keyof ResumeData])
      .map(key => {
        const Component = componentMap[key]
        return Component ? <Component key={key} /> : null
      })
      .filter(Boolean)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden print:h-auto print:overflow-visible print:rounded-none print:border-0">
      {/* 顶部顶栏 */}
      <TopBar
        viewMode={viewMode}
        onModeChange={handleModeChange}
        onCreateResume={openCreateModal}
        onAiOptimize={openAiModal}
        onExportPDF={handleExportPDF}
        onExportMarkdown={handleExportMarkdown}
        resumeName={currentResumeName}
        recordId={currentRecordId}
        isTemplate={isTemplate}
        onRefresh={handleRefresh}
        onResumesRefresh={() => rightSidebarRef.current?.refresh()}
        onToggleLeftSidebar={toggleLeftSidebar}
        onToggleRightSidebar={toggleRightSidebar}
        showLeftSidebar={showLeftSidebar}
      />

      {/* 主体内容区域 */}
      <main ref={containerRef} className="flex flex-1 overflow-hidden print:block print:overflow-visible pt-12 print:pt-0">
        {/* 移动端左侧边栏遮罩层 */}
        {showLeftSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setShowLeftSidebar(false)}
          />
        )}

        {/* 移动端右侧边栏遮罩层 */}
        {showRightSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setShowRightSidebar(false)}
          />
        )}

        {/* 左侧边栏 - 简历管理 */}
        <aside
          className={`
            fixed lg:relative lg:top-0 inset-y-0 left-0 z-40
            flex-shrink-0 bg-white border-r border-gray-200 shadow-lg flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            print:hidden
            top-16 lg:top-0 h-[calc(100%-64px)] lg:h-full
          `}
          style={{ width: leftSidebarWidth }}
        >
          <ResumeSidebar
            resumeData={currentData}
            config={currentConfig}
            isTemplate={isTemplate}
            recordId={currentRecordId}
            viewMode={viewMode}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
            onRefresh={handleRefresh}
          />
        </aside>

        {/* 左侧调整条 - 仅桌面端显示 */}
        <div
          className="hidden lg:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize z-50 transition-colors print:hidden"
          onMouseDown={() => setIsResizingLeft(true)}
          title="拖动调整左侧边栏宽度"
        />

        {/* 中间主内容区域 */}
        <div className="flex-1 overflow-y-auto relative bg-gray-50 print:bg-transparent">
          {/* 复制成功提示 */}
          {showCopySuccess && (
            <div className="fixed top-20 right-4 sm:right-20 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in print:hidden">
              Markdown 已复制到剪贴板！
            </div>
          )}

          {/* 简历内容 - 根据配置动态渲染组件 */}
          <div key={refreshKey} className="p-4 sm:p-6 md:p-8 print:p-0">
            {getVisibleComponents()}
          </div>

          {/* 创建简历弹窗 */}
          <CreateResumeModal
            isOpen={showCreateModal}
            onClose={closeAllModals}
            onResumeCreated={(resumeData: ResumeData) => {
              setCurrentResumeData(resumeData)
              closeAllModals()
              setRefreshKey(prev => prev + 1)
            }}
          />

          {/* AI 简历优化弹窗 */}
          <AiOptimizeModal
            isOpen={showAiModal}
            onClose={closeAllModals}
            onOptimized={(resumeData: ResumeData) => {
              setCurrentResumeData(resumeData)
              closeAllModals()
              setRefreshKey(prev => prev + 1)
            }}
          />
        </div>

        {/* 右侧调整条 - 仅桌面端显示 */}
        <div
          className="hidden lg:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize z-50 transition-colors print:hidden"
          onMouseDown={() => setIsResizingRight(true)}
          title="拖动调整右侧边栏宽度"
        />

        {/* 右侧边栏 - 简历列表 */}
        <aside
          className={`
            fixed lg:relative lg:top-0 inset-y-0 right-0 z-40
            flex-shrink-0 bg-white border-l border-gray-200 shadow-lg
            transform transition-transform duration-300 ease-in-out
            ${showRightSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            print:hidden
            top-16 lg:top-0 h-[calc(100%-64px)] lg:h-full
          `}
          style={{ width: rightSidebarWidth }}
        >
          <ResumeRightSidebar
            ref={rightSidebarRef}
            onSelectResume={handleSelectResume}
            currentRecordId={currentRecordId}
            onRefresh={handleRefresh}
          />
        </aside>
      </main>
    </div>
  )
}

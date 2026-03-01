'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Intern from '@/components/Intern'
import Projects from '@/components/Projects'
import About from '@/components/About'
import ResumeManager from '@/components/ResumeManager'
import CreateResumeModal from '@/components/CreateResumeModal'
import AiOptimizeModal from '@/components/AiOptimizeModal'
import ConfigSidebar from '@/components/ConfigSidebar'
import { setCurrentResumeData, getCurrentResumeData, defaultResumeData, getDefaultConfig, DEFAULT_SECTION_ORDER } from '@/config/data'
import { ResumeData, ResumeConfig } from '@/types'

/**
 * 简历主页面组件 - 整合所有简历模块
 */
export default function Home() {
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showConfigSidebar, setShowConfigSidebar] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  // 简历配置状态
  const [config, setConfig] = useState<ResumeConfig>(() => {
    const data = getCurrentResumeData()
    return data.config || getDefaultConfig()
  })

  // 头像状态
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(() => {
    return getCurrentResumeData().avatarBase64
  })

  // 简历内容区域引用（用于一键一页计算）
  const resumeRef = useRef<HTMLDivElement>(null)

  /**
   * 关闭所有弹窗
   */
  const closeAllModals = () => {
    setShowResumeManager(false)
    setShowCreateModal(false)
    setShowAiModal(false)
    setShowExportDropdown(false)
  }

  /**
   * 同步配置和头像到当前简历数据
   */
  const syncConfigToResumeData = useCallback((newConfig: ResumeConfig, newAvatar?: string) => {
    const currentData = getCurrentResumeData()
    const updatedData: ResumeData = {
      ...currentData,
      config: newConfig,
      avatarBase64: newAvatar,
    }
    setCurrentResumeData(updatedData)
  }, [])

  /**
   * 处理配置变更
   */
  const handleConfigChange = useCallback((newConfig: ResumeConfig) => {
    setConfig(newConfig)
    syncConfigToResumeData(newConfig, avatarBase64)
    setRefreshKey(prev => prev + 1)
  }, [avatarBase64, syncConfigToResumeData])

  /**
   * 处理头像变更
   */
  const handleAvatarChange = useCallback((base64: string | undefined) => {
    setAvatarBase64(base64)
    syncConfigToResumeData(config, base64)
    setRefreshKey(prev => prev + 1)
  }, [config, syncConfigToResumeData])

  /**
   * 一键适配一页 - 智能调整字体大小和行间距
   */
  const handleFitOnePage = useCallback(() => {
    if (!resumeRef.current) return

    const A4_HEIGHT_PX = 1122 // A4 纸高度 (96dpi 下约 297mm)
    let newFontSize = config.fontSize || 16
    let newLineHeight = config.lineHeight || 1.5

    // 逐步减小字体大小和行间距直到内容适合一页
    const tryFit = () => {
      if (!resumeRef.current) return false
      return resumeRef.current.scrollHeight <= A4_HEIGHT_PX
    }

    // 先尝试减少行间距
    while (newLineHeight > 1.0 && !tryFit()) {
      newLineHeight = Math.round((newLineHeight - 0.1) * 10) / 10
      const tempConfig = { ...config, lineHeight: newLineHeight, fontSize: newFontSize }
      setConfig(tempConfig)
      syncConfigToResumeData(tempConfig, avatarBase64)
    }

    // 如果行间距已到最低还不够，再减字体大小
    while (newFontSize > 12 && !tryFit()) {
      newFontSize -= 1
      const tempConfig = { ...config, lineHeight: newLineHeight, fontSize: newFontSize }
      setConfig(tempConfig)
      syncConfigToResumeData(tempConfig, avatarBase64)
    }

    const finalConfig = { ...config, lineHeight: newLineHeight, fontSize: newFontSize }
    setConfig(finalConfig)
    syncConfigToResumeData(finalConfig, avatarBase64)
    setRefreshKey(prev => prev + 1)
  }, [config, avatarBase64, syncConfigToResumeData])

  /**
   * 打印简历功能
   */
  const handlePrintResume = () => {
    window.print()
  }

  /**
   * 切换导出下拉菜单
   */
  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown)
  }

  /**
   * 处理导出为PDF
   */
  const handleExportPDF = () => {
    handlePrintResume()
    setShowExportDropdown(false)
  }

  /**
   * 处理导出为Markdown
   */
  const handleExportMarkdown = () => {
    const currentData = getCurrentResumeData()
    let markdown = `# ${currentData.header.name}\n\n`
    
    // 添加联系方式
    markdown += `## 联系方式\n`
    markdown += `- 电话/微信：${currentData.header.contact.phone}\n`
    markdown += `- 邮箱：${currentData.header.contact.email}\n`
    if (currentData.header.contact.github) {
      markdown += `- GitHub：[${currentData.header.contact.github.text}](${currentData.header.contact.github.url})\n`
    }
    if (currentData.header.contact.homepage) {
      markdown += `- 主页：[${currentData.header.contact.homepage.text}](${currentData.header.contact.homepage.url})\n`
    }
    markdown += `\n`
    
    // 添加教育背景
    if (currentData.education) {
      markdown += `## ${currentData.education.title}\n`
      markdown += `- 学校：${currentData.education.school}\n`
      markdown += `- 时间：${currentData.education.period}\n`
      markdown += `- 详情：${currentData.education.details}\n`
      markdown += `\n`
    }
    
    // 添加技能
    if (currentData.skills) {
      markdown += `## ${currentData.skills.title}\n`
      currentData.skills.items.forEach(skill => {
        markdown += `- ${skill}\n`
      })
      markdown += `\n`
    }
    
    // 添加实习经历
    if (currentData.intern) {
      markdown += `## ${currentData.intern.title}\n`
      currentData.intern.items.forEach(item => {
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
    if (currentData.projects) {
      markdown += `## ${currentData.projects.title}\n`
      currentData.projects.items.forEach(item => {
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
    if (currentData.about) {
      markdown += `## ${currentData.about.title}\n`
      markdown += `${currentData.about.content}\n`
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
    
    setShowExportDropdown(false)
  }

  /**
   * 加载简历后同步配置和头像状态
   */
  const handleSelectResume = useCallback((resumeData: ResumeData) => {
    setCurrentResumeData(resumeData)
    setConfig(resumeData.config || getDefaultConfig())
    setAvatarBase64(resumeData.avatarBase64)
    closeAllModals()
    setRefreshKey(prev => prev + 1)
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

  // 使用配置中的模块顺序（回退到默认顺序）
  const sectionOrder = config.sectionOrder || DEFAULT_SECTION_ORDER

  // 动态样式（字体、行间距、字体大小）
  const resumeStyle: React.CSSProperties = {
    fontFamily: config.fontFamily || 'serif',
    lineHeight: config.lineHeight || 1.5,
    fontSize: config.fontSize ? `${config.fontSize}px` : undefined,
  }

  return (
    <main>
      {/* 左侧配置按钮 */}
      <div
        style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}
        className="no-print"
      >
        <button
          onClick={() => setShowConfigSidebar(true)}
          className="bg-white text-gray-800 rounded-lg px-4 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
        >
          ⚙ 简历配置
        </button>
      </div>

      {/* 顶部右侧按钮组 */}
      <div
        style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}
        className="no-print"
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { closeAllModals(); setShowResumeManager(true) }}
            className="bg-white text-gray-800 rounded-lg px-5 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
          >
            简历管理
          </button>
          <button
            onClick={() => { closeAllModals(); setShowCreateModal(true) }}
            className="bg-white text-gray-800 rounded-lg px-5 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
          >
            创建简历
          </button>
          <button
            onClick={() => { closeAllModals(); setShowAiModal(true) }}
            className="relative bg-white text-gray-800 rounded-lg px-5 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
          >
            AI 简历优化
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              NEW
            </span>
          </button>
          <div className="relative">
            <button
              onClick={toggleExportDropdown}
              className="bg-white text-gray-800 rounded-lg px-5 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200 w-full text-left"
            >
              导出
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-40 z-50">
                <button
                  onClick={handleExportPDF}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                >
                  导出为 PDF
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors"
                >
                  导出为 Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 简历内容 - A4 打印预览边框 + 动态样式 */}
      <div
        ref={resumeRef}
        key={refreshKey}
        className="resume-a4-preview"
        style={resumeStyle}
      >
        {/* 根据配置中的顺序和显隐渲染组件 */}
        {(() => {
          const currentData = getCurrentResumeData()
          return sectionOrder
            .filter(key => config.sectionVisibility[key] !== false)
            .filter(key => currentData[key as keyof ResumeData])
            .map(key => {
              const Component = componentMap[key]
              return Component ? <Component key={key} /> : null
            })
        })()}
      </div>

      {/* 简历配置侧边栏 */}
      <ConfigSidebar
        isOpen={showConfigSidebar}
        onClose={() => setShowConfigSidebar(false)}
        config={config}
        onConfigChange={handleConfigChange}
        avatarBase64={avatarBase64}
        onAvatarChange={handleAvatarChange}
        onFitOnePage={handleFitOnePage}
      />

      {/* 简历管理弹窗 */}
      {showResumeManager && (
        <ResumeManager 
          isOpen={showResumeManager}
          onClose={closeAllModals}
          onSelectResume={handleSelectResume}
        />
      )}

      {/* 创建简历弹窗 */}
      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        onResumeCreated={handleSelectResume}
      />

      {/* AI 简历优化弹窗 */}
      <AiOptimizeModal
        isOpen={showAiModal}
        onClose={closeAllModals}
        onOptimized={handleSelectResume}
      />

      {/* 复制成功提示 */}
      {showCopySuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">复制成功</h3>
              <p className="text-sm text-gray-500 mb-5">Markdown 内容已复制到剪贴板</p>
              <button
                onClick={() => setShowCopySuccess(false)}
                className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

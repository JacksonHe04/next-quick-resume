'use client'

import { useRef, useState } from 'react'
import Header from '@/components/Header'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Intern from '@/components/Intern'
import Projects from '@/components/Projects'
import About from '@/components/About'
import ResumeManager from '@/components/ResumeManager'
import CreateResumeModal from '@/components/CreateResumeModal'
import AiOptimizeModal from '@/components/AiOptimizeModal'
import { setCurrentResumeData, getCurrentResumeData } from '@/config/data'
import ResumeSettingsSidebar from '@/components/ResumeSettingsSidebar'
import { Button } from '@/components/ui'
import { ResumeData, ResumeMeta, ResumeSectionKey, ResumeSettings } from '@/types'
import { getResumeById, updateResume } from '@/utils/indexedDB'
import { mergeResumeSettings, normalizeResumeSettings } from '@/utils/resumeSettings'

/**
 * 简历主页面组件 - 整合所有简历模块
 */
export default function Home() {
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [currentResumeMeta, setCurrentResumeMeta] = useState<ResumeMeta | null>(null)
  const resumePageRef = useRef<HTMLDivElement | null>(null)
  const resumeContentRef = useRef<HTMLDivElement | null>(null)

  /**
   * 关闭所有弹窗
   */
  const closeAllModals = () => {
    setShowResumeManager(false)
    setShowCreateModal(false)
    setShowAiModal(false)
    setShowSettingsSidebar(false)
    setShowExportDropdown(false)
  }

  /**
   * 打开简历管理弹窗（关闭其他弹窗）
   */
  const openResumeManager = () => {
    closeAllModals()
    setShowResumeManager(true)
  }

  /**
   * 打开创建简历弹窗（关闭其他弹窗）
   */
  const openCreateModal = () => {
    closeAllModals()
    setShowCreateModal(true)
  }

  /**
   * 打开AI简历优化弹窗（关闭其他弹窗）
   */
  const openAiModal = () => {
    closeAllModals()
    setShowAiModal(true)
  }

  /**
   * 打开简历配置侧边栏
   */
  const openSettingsSidebar = () => {
    closeAllModals()
    setShowSettingsSidebar(true)
  }

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
   * 持久化更新当前简历（仅数据库记录）
   */
  const persistResumeUpdate = async (data: ResumeData) => {
    if (!currentResumeMeta || currentResumeMeta.source !== 'database') return
    try {
      const latestRecord = await getResumeById(currentResumeMeta.id)
      const safeName = latestRecord?.name || currentResumeMeta.name
      await updateResume(currentResumeMeta.id, safeName, data)
    } catch (error) {
      console.error('保存简历配置失败:', error)
    }
  }

  /**
   * 应用简历数据并触发刷新
   */
  const applyResumeData = (data: ResumeData, persist = false) => {
    setCurrentResumeData(data)
    setRefreshKey(prev => prev + 1)
    if (persist) {
      void persistResumeUpdate(data)
    }
  }

  /**
   * 更新简历配置设置
   */
  const handleSettingsChange = (nextSettings: ResumeSettings) => {
    const currentData = getCurrentResumeData()
    const normalizedSettings = normalizeResumeSettings(nextSettings)
    applyResumeData({ ...currentData, settings: normalizedSettings }, true)
  }

  /**
   * 更新头像
   */
  const handleAvatarChange = (avatar: string | null) => {
    const currentData = getCurrentResumeData()
    applyResumeData({
      ...currentData,
      header: {
        ...currentData.header,
        avatar: avatar || undefined
      }
    }, true)
  }

  /**
   * 一键适配一页 A4
   */
  const handleFitOnePage = () => {
    const pageElement = resumePageRef.current
    const contentElement = resumeContentRef.current
    if (!pageElement || !contentElement) return

    const currentData = getCurrentResumeData()
    const currentSettings = normalizeResumeSettings(currentData.settings)
    const pageHeight = pageElement.getBoundingClientRect().height
    const contentHeight = contentElement.scrollHeight

    let nextLineHeight = currentSettings.typography.lineHeight
    let nextScale = Math.min(1, pageHeight / contentHeight)

    if (nextScale < 0.92) {
      nextLineHeight = Math.max(1.2, currentSettings.typography.lineHeight - 0.12)
    }

    const updatedSettings = mergeResumeSettings(currentSettings, {
      typography: {
        lineHeight: nextLineHeight
      }
    })

    applyResumeData({ ...currentData, settings: updatedSettings }, true)

    requestAnimationFrame(() => {
      const updatedElement = resumeContentRef.current
      if (!updatedElement) return
      const updatedContentHeight = updatedElement.scrollHeight
      const finalScale = Math.min(1, pageHeight / updatedContentHeight)
      const finalSettings = mergeResumeSettings(updatedSettings, {
        layout: { scale: Number(finalScale.toFixed(3)) }
      })
      applyResumeData({ ...currentData, settings: finalSettings }, true)
    })
  }

  // 组件映射表
  const componentMap: Record<ResumeSectionKey, React.ComponentType> = {
    header: Header,
    education: Education,
    intern: Intern,
    projects: Projects,
    skills: Skills,
    about: About
  }

  const currentData = getCurrentResumeData()
  const resumeSettings = normalizeResumeSettings(currentData.settings)
  const orderedSections = resumeSettings.sectionOrder
    .filter(section => resumeSettings.sectionVisibility[section])
    .filter(section => section === 'header' || currentData[section as keyof ResumeData])

  return (
    <main>
      {/* 左侧配置按钮组 */}
      <div
        style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}
        className="no-print"
      >
        <div className="flex flex-col gap-2">
          <Button
            onClick={openSettingsSidebar}
            variant="secondary"
            shadow
            className="px-4 py-3 text-sm"
          >
            简历配置
          </Button>
        </div>
      </div>

      {/* 顶部右侧按钮组 */}
      <div
        style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}
        className="no-print"
      >
        <div className="flex flex-col gap-2">
          <Button
            onClick={openResumeManager}
            variant="secondary"
            shadow
            className="px-5 py-3 text-sm"
          >
            简历管理
          </Button>
          <Button
            onClick={openCreateModal}
            variant="secondary"
            shadow
            className="px-5 py-3 text-sm"
          >
            创建简历
          </Button>
          <Button
            onClick={openAiModal}
            variant="secondary"
            shadow
            className="px-5 py-3 text-sm flex items-center justify-between gap-2"
          >
            <span>AI 简历优化</span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              NEW
            </span>
          </Button>
          <div className="relative">
            <Button
              onClick={toggleExportDropdown}
              variant="secondary"
              shadow
              className="w-full px-5 py-3 text-sm text-left"
            >
              导出
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 w-44 z-50 overflow-hidden">
                <button
                  onClick={handleExportPDF}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  导出为 PDF
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  导出为 Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 简历内容 - 根据JSON配置动态渲染组件 */}
      <div className="resume-stage">
        <div className="resume-page" ref={resumePageRef}>
          <div
            key={refreshKey}
            ref={resumeContentRef}
            className="resume-page-content"
            style={{
              fontFamily: resumeSettings.typography.fontFamily,
              lineHeight: resumeSettings.typography.lineHeight,
              transform: `scale(${resumeSettings.layout.scale})`,
              transformOrigin: 'top left'
            }}
          >
            {orderedSections.map(componentKey => {
              const Component = componentMap[componentKey]
              return Component ? <Component key={componentKey} /> : null
            })}
          </div>
        </div>
      </div>

      {/* 简历管理弹窗 */}
      {showResumeManager && (
        <ResumeManager 
          isOpen={showResumeManager}
          onClose={closeAllModals}
          onSelectResume={(resumeData: ResumeData, meta?: ResumeMeta) => {
            // 当用户选择简历时，更新当前简历数据
            setCurrentResumeMeta(meta && meta.source === 'database' ? meta : null)
            applyResumeData(resumeData)
            closeAllModals()
          }}
        />
      )}

      {/* 创建简历弹窗 */}
      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        onResumeCreated={(resumeData: ResumeData) => {
          // 当简历创建成功时，更新当前简历数据
          setCurrentResumeMeta(null)
          applyResumeData(resumeData)
          closeAllModals()
        }}
      />

      {/* AI 简历优化弹窗 */}
      <AiOptimizeModal
        isOpen={showAiModal}
        onClose={closeAllModals}
        onOptimized={(resumeData: ResumeData) => {
          // 当AI优化完成时，更新当前简历数据
          applyResumeData(resumeData, true)
          closeAllModals()
        }}
      />

      <ResumeSettingsSidebar
        isOpen={showSettingsSidebar}
        onClose={() => setShowSettingsSidebar(false)}
        settings={resumeSettings}
        avatar={currentData.header.avatar}
        onSettingsChange={handleSettingsChange}
        onAvatarChange={handleAvatarChange}
        onFitOnePage={handleFitOnePage}
      />

      {/* 复制成功提示 */}
      {showCopySuccess && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-50">
          <div className="text-center">
            <div className="text-emerald-500 text-2xl mb-2">✓</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">复制成功</h3>
            <p className="text-slate-600 mb-4">Markdown内容已成功复制到剪贴板</p>
            <Button
              onClick={() => setShowCopySuccess(false)}
              variant="secondary"
              size="sm"
            >
              确定
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}

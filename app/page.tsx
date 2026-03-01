'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType } from 'react'
import Header from '@/components/Header'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Intern from '@/components/Intern'
import Projects from '@/components/Projects'
import About from '@/components/About'
import ResumeManager from '@/components/ResumeManager'
import CreateResumeModal from '@/components/CreateResumeModal'
import AiOptimizeModal from '@/components/AiOptimizeModal'
import { setCurrentResumeData, defaultResumeData } from '@/config/data'
import { ResumeData, ResumeSectionKey } from '@/types'

const DEFAULT_SECTION_ORDER: ResumeSectionKey[] = ['header', 'education', 'intern', 'projects', 'skills', 'about']

const SECTION_LABELS: Record<ResumeSectionKey, string> = {
  header: '头部信息',
  education: '教育经历',
  intern: '实习经历',
  projects: '项目经历',
  skills: '专业技能',
  about: '关于我'
}

const FONT_FAMILY_CLASS = {
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono'
} as const

const normalizeResumeData = (data: ResumeData): ResumeData => {
  const existingOrder = data.layoutConfig?.sectionOrder || []
  const uniqueOrder = existingOrder.filter((key, index) => existingOrder.indexOf(key) === index)
  const filledOrder = [...uniqueOrder, ...DEFAULT_SECTION_ORDER.filter((key) => !uniqueOrder.includes(key))]

  return {
    ...data,
    layoutConfig: {
      sectionOrder: filledOrder,
      sectionVisibility: {
        header: true,
        education: true,
        intern: true,
        projects: true,
        skills: true,
        about: true,
        ...data.layoutConfig?.sectionVisibility
      },
      fontFamily: data.layoutConfig?.fontFamily || 'serif',
      lineHeight: data.layoutConfig?.lineHeight || 1.6
    }
  }
}

const baseFloatingButton = 'w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 border shadow-sm hover:-translate-y-0.5 hover:shadow-md'
const secondaryButton = `${baseFloatingButton} bg-white text-slate-700 border-slate-200 hover:bg-slate-50`
const primaryButton = `${baseFloatingButton} bg-slate-900 text-white border-slate-900 hover:bg-slate-800`

/**
 * 简历主页面组件 - 整合所有简历模块
 */
export default function Home() {
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [currentResumeData, setCurrentResumeDataState] = useState<ResumeData>(() => normalizeResumeData(defaultResumeData))
  const resumePageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentResumeData(currentResumeData)
  }, [currentResumeData])

  const updateCurrentResume = (updater: (prev: ResumeData) => ResumeData) => {
    setCurrentResumeDataState((prev) => normalizeResumeData(updater(prev)))
  }

  const componentMap: Record<ResumeSectionKey, ComponentType> = {
    header: Header,
    education: Education,
    intern: Intern,
    projects: Projects,
    skills: Skills,
    about: About
  }

  const effectiveOrder = currentResumeData.layoutConfig?.sectionOrder || DEFAULT_SECTION_ORDER
  const sectionVisibility = currentResumeData.layoutConfig?.sectionVisibility || {}

  const visibleSectionOrder = useMemo(
    () =>
      effectiveOrder.filter((key) => {
        if (!currentResumeData[key]) return false
        return sectionVisibility[key] !== false
      }),
    [effectiveOrder, currentResumeData, sectionVisibility]
  )

  const closeAllModals = () => {
    setShowResumeManager(false)
    setShowCreateModal(false)
    setShowAiModal(false)
    setShowExportDropdown(false)
  }

  const openResumeManager = () => {
    closeAllModals()
    setShowResumeManager(true)
  }

  const openCreateModal = () => {
    closeAllModals()
    setShowCreateModal(true)
  }

  const openAiModal = () => {
    closeAllModals()
    setShowAiModal(true)
  }

  const handlePrintResume = () => {
    window.print()
  }

  const toggleExportDropdown = () => {
    setShowExportDropdown((prev) => !prev)
  }

  const handleExportPDF = () => {
    handlePrintResume()
    setShowExportDropdown(false)
  }

  const handleExportMarkdown = () => {
    const currentData = currentResumeData
    let markdown = `# ${currentData.header.name}\n\n`

    markdown += '## 联系方式\n'
    markdown += `- 电话/微信：${currentData.header.contact.phone}\n`
    markdown += `- 邮箱：${currentData.header.contact.email}\n`
    if (currentData.header.contact.github) {
      markdown += `- GitHub：[${currentData.header.contact.github.text}](${currentData.header.contact.github.url})\n`
    }
    if (currentData.header.contact.homepage) {
      markdown += `- 主页：[${currentData.header.contact.homepage.text}](${currentData.header.contact.homepage.url})\n`
    }
    markdown += '\n'

    if (currentData.education) {
      markdown += `## ${currentData.education.title}\n`
      markdown += `- 学校：${currentData.education.school}\n`
      markdown += `- 时间：${currentData.education.period}\n`
      markdown += `- 详情：${currentData.education.details}\n\n`
    }

    if (currentData.skills) {
      markdown += `## ${currentData.skills.title}\n`
      currentData.skills.items.forEach((skill) => {
        markdown += `- ${skill}\n`
      })
      markdown += '\n'
    }

    if (currentData.intern) {
      markdown += `## ${currentData.intern.title}\n`
      currentData.intern.items.forEach((item) => {
        markdown += `### ${item.company} - ${item.position}\n`
        markdown += `- 时间：${item.period}\n`
        markdown += `- 地点：${item.base}\n`
        markdown += `- 描述：${item.description}\n`
        if (item.responsibilities && item.responsibilities.length > 0) {
          markdown += '- 职责：\n'
          item.responsibilities.forEach((responsibility) => {
            markdown += `  - ${responsibility}\n`
          })
        }
        markdown += '\n'
      })
    }

    if (currentData.projects) {
      markdown += `## ${currentData.projects.title}\n`
      currentData.projects.items.forEach((item) => {
        markdown += `### ${item.name}\n`
        markdown += `- GitHub：${item.github}\n`
        if (item.demo) markdown += `- 演示：${item.demo}\n`
        if (item.techStack) markdown += `- 技术栈：${item.techStack}\n`
        markdown += `- 描述：${item.description}\n`
        if (item.features && item.features.length > 0) {
          markdown += '- 功能：\n'
          item.features.forEach((feature) => {
            markdown += `  - ${feature}\n`
          })
        }
        markdown += '\n'
      })
    }

    if (currentData.about) {
      markdown += `## ${currentData.about.title}\n`
      markdown += `${currentData.about.content}\n`
    }

    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        setShowCopySuccess(true)
        setTimeout(() => setShowCopySuccess(false), 3000)
      })
      .catch((err) => {
        console.error('无法复制内容: ', err)
      })

    setShowExportDropdown(false)
  }

  const moveSection = (target: ResumeSectionKey, direction: 'up' | 'down') => {
    updateCurrentResume((prev) => {
      const order = [...(prev.layoutConfig?.sectionOrder || DEFAULT_SECTION_ORDER)]
      const index = order.indexOf(target)
      if (index === -1) return prev
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= order.length) return prev
      ;[order[index], order[swapIndex]] = [order[swapIndex], order[index]]
      return {
        ...prev,
        layoutConfig: {
          ...prev.layoutConfig,
          sectionOrder: order
        }
      }
    })
  }

  const toggleSectionVisibility = (target: ResumeSectionKey, checked: boolean) => {
    updateCurrentResume((prev) => ({
      ...prev,
      layoutConfig: {
        ...prev.layoutConfig,
        sectionVisibility: {
          ...prev.layoutConfig?.sectionVisibility,
          [target]: checked
        }
      }
    }))
  }

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateCurrentResume((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            photo: reader.result as string
          }
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  const oneClickFitToA4 = () => {
    const limit = 1040
    const pageHeight = resumePageRef.current?.scrollHeight || 0

    updateCurrentResume((prev) => {
      const currentLineHeight = prev.layoutConfig?.lineHeight || 1.6
      const nextLineHeight = pageHeight > limit ? Math.max(1.2, currentLineHeight - 0.15) : currentLineHeight
      return {
        ...prev,
        layoutConfig: {
          ...prev.layoutConfig,
          lineHeight: nextLineHeight,
          fontFamily: pageHeight > limit && nextLineHeight <= 1.35 ? 'sans' : prev.layoutConfig?.fontFamily || 'serif'
        }
      }
    })
  }

  const lineHeight = currentResumeData.layoutConfig?.lineHeight || 1.6
  const fontFamily = currentResumeData.layoutConfig?.fontFamily || 'serif'

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="fixed left-5 top-5 z-40 no-print w-40 space-y-2">
        <button className={primaryButton} onClick={() => setShowConfigPanel(true)}>
          简历配置
        </button>
        <button className={secondaryButton} onClick={oneClickFitToA4}>
          一键变一页
        </button>
      </div>

      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }} className="no-print">
        <div className="flex flex-col gap-2 w-40">
          <button onClick={openResumeManager} className={secondaryButton}>
            简历管理
          </button>
          <button onClick={openCreateModal} className={secondaryButton}>
            创建简历
          </button>
          <button onClick={openAiModal} className={secondaryButton}>
            <span className="flex items-center justify-between gap-2">
              AI 简历优化
              <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">NEW</span>
            </span>
          </button>
          <div className="relative">
            <button onClick={toggleExportDropdown} className={`${secondaryButton} text-left`}>
              导出
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 w-40 z-50 overflow-hidden">
                <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  导出为 PDF
                </button>
                <button onClick={handleExportMarkdown} className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  导出为 Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfigPanel && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 no-print" onClick={() => setShowConfigPanel(false)}>
          <aside
            className="h-full w-[360px] max-w-[90vw] bg-white shadow-2xl border-r border-slate-200 p-5 overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-800">简历配置</h3>
              <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowConfigPanel(false)}>
                关闭
              </button>
            </div>

            <div className="space-y-6">
              <section className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">个人照片</h4>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="block w-full text-sm text-slate-600" />
                <p className="text-xs text-slate-500 mt-2">照片会保存到当前简历数据中（IndexedDB）。</p>
              </section>

              <section className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">版式设置</h4>
                <label className="block text-sm text-slate-600 mb-2">字体</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={fontFamily}
                  onChange={(event) => {
                    const value = event.target.value as 'serif' | 'sans' | 'mono'
                    updateCurrentResume((prev) => ({
                      ...prev,
                      layoutConfig: {
                        ...prev.layoutConfig,
                        fontFamily: value
                      }
                    }))
                  }}
                >
                  <option value="serif">衬线体（默认）</option>
                  <option value="sans">无衬线体</option>
                  <option value="mono">等宽字体</option>
                </select>

                <label className="block text-sm text-slate-600 mt-4 mb-2">行间距：{lineHeight.toFixed(2)}</label>
                <input
                  type="range"
                  min={1.2}
                  max={2}
                  step={0.05}
                  value={lineHeight}
                  onChange={(event) => {
                    updateCurrentResume((prev) => ({
                      ...prev,
                      layoutConfig: {
                        ...prev.layoutConfig,
                        lineHeight: Number(event.target.value)
                      }
                    }))
                  }}
                  className="w-full"
                />
              </section>

              <section className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">模块显隐与排序</h4>
                <div className="space-y-2">
                  {effectiveOrder.map((section, index) => (
                    <div key={section} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
                      <input
                        id={`show-${section}`}
                        type="checkbox"
                        checked={sectionVisibility[section] !== false}
                        onChange={(event) => toggleSectionVisibility(section, event.target.checked)}
                      />
                      <label htmlFor={`show-${section}`} className="text-sm text-slate-700 flex-1">
                        {SECTION_LABELS[section]}
                      </label>
                      <div className="flex gap-1">
                        <button
                          className="rounded border border-slate-200 px-2 py-1 text-xs disabled:opacity-40"
                          onClick={() => moveSection(section, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="rounded border border-slate-200 px-2 py-1 text-xs disabled:opacity-40"
                          onClick={() => moveSection(section, 'down')}
                          disabled={index === effectiveOrder.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}

      <div className="px-6 py-8">
        <div
          ref={resumePageRef}
          className={`resume-print-frame mx-auto bg-white shadow-sm border border-slate-300 p-10 ${FONT_FAMILY_CLASS[fontFamily]}`}
          style={{ lineHeight }}
        >
          {visibleSectionOrder.map((sectionKey) => {
            const Component = componentMap[sectionKey]
            return Component ? <Component key={sectionKey} /> : null
          })}
        </div>
      </div>

      {showResumeManager && (
        <ResumeManager
          isOpen={showResumeManager}
          onClose={closeAllModals}
          onSelectResume={(resumeData: ResumeData) => {
            setCurrentResumeDataState(normalizeResumeData(resumeData))
            closeAllModals()
          }}
        />
      )}

      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        onResumeCreated={(resumeData: ResumeData) => {
          setCurrentResumeDataState(normalizeResumeData(resumeData))
          closeAllModals()
        }}
      />

      <AiOptimizeModal
        isOpen={showAiModal}
        onClose={closeAllModals}
        onOptimized={(resumeData: ResumeData) => {
          setCurrentResumeDataState(normalizeResumeData(resumeData))
          closeAllModals()
        }}
      />

      {showCopySuccess && (
        <div className="fixed inset-0 z-50 no-print bg-slate-900/30 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-[320px]">
            <div className="text-center">
              <div className="text-emerald-500 text-2xl mb-2">✓</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">复制成功</h3>
              <p className="text-slate-600 mb-4 text-sm">Markdown内容已成功复制到剪贴板</p>
              <button onClick={() => setShowCopySuccess(false)} className={secondaryButton}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

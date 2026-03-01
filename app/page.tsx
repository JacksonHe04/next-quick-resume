'use client'

import { useState} from 'react'
import Header from '@/components/Header'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Intern from '@/components/Intern'
import Projects from '@/components/Projects'
import About from '@/components/About'
import ResumeManager from '@/components/ResumeManager'
import CreateResumeModal from '@/components/CreateResumeModal'
import AiOptimizeModal from '@/components/AiOptimizeModal'
import { setCurrentResumeData, getCurrentResumeData, defaultResumeData } from '@/config/data'
import { ResumeData } from '@/types'

// 本地私有未版本管理的 JSON 内容 - 动态导入以处理部署时可能不存在的情况
let localResumeData: any = null

/**
 * 简历主页面组件 - 整合所有简历模块
 */
export default function Home() {
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [localMode, setLocalMode] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)

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

  // 组件映射表
  const componentMap: Record<string, React.ComponentType> = {
    header: Header,
    education: Education,
    intern: Intern,
    projects: Projects,
    skills: Skills,
    about: About
  }

  // 默认组件顺序，可根据JSON中的字段存在情况动态调整
  const defaultComponentOrder: string[] = ['header', 'education', 'intern', 'projects', 'skills', 'about']

  return (
    <main>
      {/* 顶部右侧按钮组 */}
      <div
        style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}
        className="no-print"
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={openResumeManager}
            className="bg-white text-gray-800 rounded-lg px-5 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
          >
            简历管理
          </button>
          <button
            onClick={openCreateModal}
            className="bg-white text-gray-800 rounded-lg px-5 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
          >
            创建简历
          </button>
          <button
            onClick={openAiModal}
            className="bg-white text-gray-800 rounded-lg px-5 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
          >
            AI 简历优化
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
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  导出为 PDF
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                >
                  导出为 Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 简历内容 - 根据JSON配置动态渲染组件 */}
      <div key={refreshKey}>
        {/* 根据数据中存在的字段和默认顺序渲染组件 */}
        {(() => {
          const currentData = getCurrentResumeData()
          return defaultComponentOrder
            .filter(componentKey => currentData[componentKey as keyof ResumeData])
            .map(componentKey => {
              const Component = componentMap[componentKey]
              return Component ? <Component key={componentKey} /> : null
            })
        })()}
      </div>

      {/* 简历管理弹窗 */}
      {showResumeManager && (
        <ResumeManager 
          isOpen={showResumeManager}
          onClose={closeAllModals}
          onSelectResume={(resumeData: ResumeData) => {
            // 当用户选择简历时，更新当前简历数据
            setCurrentResumeData(resumeData)
            closeAllModals()
            // 通过更新key来强制组件重新渲染
            setRefreshKey(prev => prev + 1)
          }}
        />
      )}

      {/* 创建简历弹窗 */}
      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        onResumeCreated={(resumeData: ResumeData) => {
          // 当简历创建成功时，更新当前简历数据
          setCurrentResumeData(resumeData)
          closeAllModals()
          // 通过更新key来强制组件重新渲染
          setRefreshKey(prev => prev + 1)
        }}
      />

      {/* AI 简历优化弹窗 */}
      <AiOptimizeModal
        isOpen={showAiModal}
        onClose={closeAllModals}
        onOptimized={(resumeData: ResumeData) => {
          // 当AI优化完成时，更新当前简历数据
          setCurrentResumeData(resumeData)
          closeAllModals()
          // 通过更新key来强制组件重新渲染
          setRefreshKey(prev => prev + 1)
        }}
      />

      {/* 复制成功提示 */}
      {showCopySuccess && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
          <div className="text-center">
            <div className="text-green-500 text-2xl mb-2">✓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">复制成功</h3>
            <p className="text-gray-600 mb-4">Markdown内容已成功复制到剪贴板</p>
            <button
              onClick={() => setShowCopySuccess(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
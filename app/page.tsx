'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Intern from '@/components/Intern'
import Projects from '@/components/Projects'
import About from '@/components/About'
import ResumeManager from '@/components/ResumeManager'
import CreateResumeModal from '@/components/CreateResumeModal'
import AiOptimizeModal from '@/components/AiOptimizeModal'
import { setCurrentResumeData } from '@/config/data'
import { ResumeData } from '@/types'

/**
 * 简历主页面组件 - 整合所有简历模块
 */
export default function Home() {
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  /**
   * 关闭所有弹窗
   */
  const closeAllModals = () => {
    setShowResumeManager(false)
    setShowCreateModal(false)
    setShowAiModal(false)
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
          <button
            onClick={handlePrintResume}
            className="bg-white text-gray-800 rounded-lg px-5 py-3 text-sm font-medium cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
          >
            打印简历
          </button>
        </div>
      </div>

      {/* 简历内容 */}
      <div key={refreshKey}>
        <Header />
        <Education />
        <Skills />
        <Intern />
        <Projects />
        <About />
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
    </main>
  )
}
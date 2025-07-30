'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import About from '@/components/About'
import ResumeManager from '@/components/ResumeManager'
import { setCurrentResumeData } from '@/config/data'
import { ResumeData } from '@/types'

/**
 * 简历主页面组件 - 整合所有简历模块
 */
export default function Home() {
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <main>
      {/* 简历管理按钮 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }} className="no-print">
        <button
          onClick={() => setShowResumeManager(true)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#0056b3'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          📝 简历管理
        </button>
      </div>

      {/* 简历内容 */}
      <div key={refreshKey}>
        <Header />
        <Education />
        <Skills />
        <Projects />
        <About />
      </div>

      {/* 简历管理弹窗 */}
      {showResumeManager && (
        <ResumeManager 
          isOpen={showResumeManager}
          onClose={() => setShowResumeManager(false)}
          onSelectResume={(resumeData: ResumeData) => {
            // 当用户选择简历时，更新当前简历数据
            setCurrentResumeData(resumeData)
            setShowResumeManager(false)
            // 通过更新key来强制组件重新渲染
            setRefreshKey(prev => prev + 1)
          }}
        />
      )}
    </main>
  )
}
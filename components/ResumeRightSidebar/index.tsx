'use client'

import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { ResumeData, ResumeDisplayConfig } from '@/types'
import { ResumeRecord, getAllResumes, deleteResume } from '@/utils/indexedDB'

/**
 * 简历右侧栏组件暴露的方法
 */
export interface ResumeRightSidebarRef {
  /** 刷新简历列表 */
  refresh: () => void
}

/**
 * 简历右侧栏组件属性
 */
interface ResumeRightSidebarProps {
  /** 选择简历回调 */
  onSelectResume: (data: ResumeData, recordId?: string, config?: ResumeDisplayConfig, name?: string) => void
  /** 当前选中的记录ID */
  currentRecordId?: string
  /** 刷新回调 */
  onRefresh?: () => void
}

/**
 * 简历右侧栏组件
 * 展示数据库中所有简历数据列表，支持点击切换和删除
 */
const ResumeRightSidebar = forwardRef<ResumeRightSidebarRef, ResumeRightSidebarProps>(
  function ResumeRightSidebar({ onSelectResume, currentRecordId, onRefresh }, ref) {
    const [resumes, setResumes] = useState<ResumeRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    /**
     * 加载简历列表
     */
    const loadResumes = useCallback(async () => {
      try {
        setLoading(true)
        setError('')
        const allResumes = await getAllResumes()
        // 按更新时间倒序排列
        const sortedResumes = allResumes.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        setResumes(sortedResumes)
      } catch (err) {
        console.error('加载简历列表失败:', err)
        setError('加载简历列表失败')
      } finally {
        setLoading(false)
      }
    }, [])

    /**
     * 暴露刷新方法给父组件
     */
    useImperativeHandle(ref, () => ({
      refresh: loadResumes
    }))

    /**
     * 组件挂载时加载数据
     */
    useEffect(() => {
      loadResumes()
      
      // 每 5 秒自动刷新一次列表
      const interval = setInterval(loadResumes, 5000)
      return () => clearInterval(interval)
    }, [loadResumes])

    /**
     * 点击外部关闭菜单
     */
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setActiveMenuId(null)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    /**
     * 处理选择简历
     */
    const handleSelect = (resume: ResumeRecord) => {
      onSelectResume(resume.data, resume.id, resume.config, resume.name)
    }

    /**
     * 处理删除简历
     */
    const handleDelete = async (resume: ResumeRecord, e: React.MouseEvent) => {
      e.stopPropagation()
      setActiveMenuId(null)
      
      if (!confirm(`确定要删除简历"${resume.name}"吗？此操作不可恢复。`)) {
        return
      }

      try {
        await deleteResume(resume.id)
        // 如果删除的是当前选中的简历，刷新页面
        if (resume.id === currentRecordId && onRefresh) {
          onRefresh()
        }
        // 刷新列表
        loadResumes()
      } catch (err) {
        console.error('删除简历失败:', err)
        alert('删除简历失败，请重试')
      }
    }

    /**
     * 切换菜单显示
     */
    const toggleMenu = (e: React.MouseEvent, resumeId: string) => {
      e.stopPropagation()
      setActiveMenuId(activeMenuId === resumeId ? null : resumeId)
    }

    /**
     * 格式化日期
     */
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return (
      <div className="h-full flex flex-col bg-white">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">简历列表</h2>
          <button
            onClick={loadResumes}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="刷新列表"
            disabled={loading}
          >
            <svg 
              className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && resumes.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={loadResumes}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                重试
              </button>
            </div>
          )}

          {!loading && !error && resumes.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-2">暂无保存的简历</p>
              <p className="text-gray-400 text-sm">点击顶部&quot;创建简历&quot;按钮添加新简历</p>
            </div>
          )}

          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => handleSelect(resume)}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 group
                  ${currentRecordId === resume.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                  }
                `}
              >
                {/* 更多操作按钮（三点图标） */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => toggleMenu(e, resume.id)}
                    className="p-1.5 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="更多操作"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {/* 下拉菜单 */}
                  {activeMenuId === resume.id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <button
                        onClick={(e) => handleDelete(resume, e)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        删除
                      </button>
                    </div>
                  )}
                </div>

                {/* 选中标记 */}
                {currentRecordId === resume.id && (
                  <div className="absolute top-2 right-10">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                <h3 className="font-medium text-gray-800 mb-1 pr-16 truncate">
                  {resume.name}
                </h3>
                <p className="text-xs text-gray-500">
                  更新于 {formatDate(resume.updatedAt)}
                </p>
                
                {/* 预览信息 */}
                <div className="mt-2 text-xs text-gray-400 truncate">
                  {resume.data.header?.name || '未命名'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            共 {resumes.length} 份简历
          </p>
        </div>
      </div>
    )
  }
)

export default ResumeRightSidebar

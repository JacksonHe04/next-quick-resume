'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ResumeDisplayConfig, ResumeSectionKey, ResumeData, HeaderAlignment, HeaderButtonConfig } from '@/types'
import { updateResumeDataAndConfig, addResume, getDefaultResumeConfig } from '@/utils/indexedDB'

/**
 * useResumeSidebar Hook 配置接口
 */
interface UseResumeSidebarOptions {
  /** 当前配置 */
  config: ResumeDisplayConfig
  /** 当前简历数据 */
  resumeData: ResumeData
  /** 是否为模板简历 */
  isTemplate: boolean
  /** 当前简历记录ID */
  recordId?: string
  /** 配置变更回调 */
  onConfigChange: (config: ResumeDisplayConfig) => void
  /** 强制刷新回调 */
  onRefresh: () => void
}

/**
 * 消息类型
 */
interface Message {
  type: 'success' | 'error'
  text: string
}

/**
 * useResumeSidebar Hook 返回值接口
 */
interface UseResumeSidebarReturn {
  /** 本地配置状态 */
  localConfig: ResumeDisplayConfig
  /** 是否正在保存 */
  isSaving: boolean
  /** 是否正在克隆 */
  isCloning: boolean
  /** 提示消息 */
  saveMessage: Message | null
  /** 更新模块可见性 */
  updateSectionVisibility: (key: ResumeSectionKey, visible: boolean) => void
  /** 更新模块排序 */
  updateSectionOrder: (newOrder: ResumeSectionKey[]) => void
  /** 更新头部对齐方式 */
  updateHeaderAlignment: (alignment: HeaderAlignment) => void
  /** 更新照片配置 */
  updatePhotoConfig: (photoConfig: { showPhoto?: boolean; photoData?: string | undefined }) => void
  /** 更新头部按钮配置 */
  updateHeaderButtonConfig: (buttonConfig: HeaderButtonConfig) => void
  /** 保存配置和数据 */
  saveConfig: () => Promise<void>
  /** 克隆简历 */
  cloneResume: () => Promise<void>
  /** 清除消息 */
  clearMessage: () => void
}

/**
 * 简历侧边栏状态管理 Hook
 * 
 * 管理侧边栏的配置状态、保存和克隆操作
 */
export function useResumeSidebar({
  config,
  resumeData,
  isTemplate,
  recordId,
  onConfigChange,
  onRefresh
}: UseResumeSidebarOptions): UseResumeSidebarReturn {
  const [localConfig, setLocalConfig] = useState<ResumeDisplayConfig>(config)
  const [isSaving, setIsSaving] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [saveMessage, setSaveMessage] = useState<Message | null>(null)
  const isExternalUpdate = useRef(false)

  /**
   * 同步外部配置到本地 - 只在初始加载或 recordId 变化时执行
   */
  useEffect(() => {
    const configCopy = JSON.parse(JSON.stringify(config))
    // 确保新字段有默认值
    const configWithDefaults = {
      ...getDefaultResumeConfig(),
      ...configCopy,
      photo: {
        showPhoto: true,
        ...configCopy.photo
      }
    }
    isExternalUpdate.current = true
    setLocalConfig(configWithDefaults)
  }, [recordId, config])

  /**
   * 当本地配置变化时，通知父组件（跳过外部同步导致的变化）
   */
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false
      return
    }
    onConfigChange(localConfig)
  }, [localConfig, onConfigChange])

  /**
   * 自动清除消息
   */
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  /**
   * 更新模块可见性
   */
  const updateSectionVisibility = useCallback((key: ResumeSectionKey, visible: boolean) => {
    setLocalConfig(prev => {
      const newSections = prev.sections.map(s =>
        s.key === key ? { ...s, visible } : s
      )
      return { ...prev, sections: newSections }
    })
  }, [])

  /**
   * 更新模块排序
   */
  const updateSectionOrder = useCallback((newOrder: ResumeSectionKey[]) => {
    setLocalConfig(prev => {
      return { ...prev, sectionOrder: newOrder }
    })
  }, [])

  /**
   * 更新头部对齐方式
   */
  const updateHeaderAlignment = useCallback((alignment: HeaderAlignment) => {
    setLocalConfig(prev => ({ ...prev, headerAlignment: alignment }))
  }, [])

  /**
   * 更新照片配置
   */
  const updatePhotoConfig = useCallback((photoConfig: { showPhoto?: boolean; photoData?: string | undefined }) => {
    setLocalConfig(prev => ({
      ...prev,
      photo: {
        ...prev.photo,
        ...photoConfig
      }
    }))
  }, [])

  /**
   * 更新头部按钮配置
   */
  const updateHeaderButtonConfig = useCallback((buttonConfig: HeaderButtonConfig) => {
    setLocalConfig(prev => ({
      ...prev,
      headerButton: buttonConfig
    }))
  }, [])

  /**
   * 保存配置和数据到数据库
   * 始终可点击，保存当前所有配置和JSON内容
   */
  const saveConfig = useCallback(async () => {
    if (isTemplate) {
      setSaveMessage({
        type: 'error',
        text: '模板简历无法保存，请先克隆一份'
      })
      return
    }

    if (!recordId) {
      setSaveMessage({
        type: 'error',
        text: '未找到简历记录ID'
      })
      return
    }

    try {
      setIsSaving(true)
      setSaveMessage(null)
      
      console.log('开始保存简历:', { recordId, config: localConfig, data: resumeData })
      
      // 同时保存配置和数据
      await updateResumeDataAndConfig(recordId, resumeData, localConfig)
      
      setSaveMessage({
        type: 'success',
        text: '简历保存成功！'
      })
      
      console.log('简历保存成功')
    } catch (error) {
      console.error('保存简历失败:', error)
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '保存失败，请重试'
      })
    } finally {
      setIsSaving(false)
    }
  }, [isTemplate, recordId, localConfig, resumeData])

  /**
   * 克隆简历
   */
  const cloneResume = useCallback(async () => {
    try {
      setIsCloning(true)
      setSaveMessage(null)

      // 获取当前完整的简历状态
      const { getCurrentResumeState } = await import('@/config/data')
      const currentState = getCurrentResumeState()

      // 生成新名称
      const timestamp = new Date().toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      const newName = `克隆简历 ${timestamp}`

      console.log('开始克隆简历:', { newName, data: currentState.data, config: currentState.config })
      
      // 创建新简历记录
      const newId = await addResume(
        newName,
        JSON.parse(JSON.stringify(currentState.data)),
        JSON.parse(JSON.stringify(currentState.config || getDefaultResumeConfig()))
      )

      setSaveMessage({
        type: 'success',
        text: `简历克隆成功！新ID: ${newId.slice(-6)}`
      })

      // 触发刷新
      onRefresh()

      console.log('简历克隆成功，新ID:', newId)
    } catch (error) {
      console.error('克隆简历失败:', error)
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '克隆失败，请重试'
      })
    } finally {
      setIsCloning(false)
    }
  }, [onRefresh])

  /**
   * 清除消息
   */
  const clearMessage = useCallback(() => {
    setSaveMessage(null)
  }, [])

  return {
    localConfig,
    isSaving,
    isCloning,
    saveMessage,
    updateSectionVisibility,
    updateSectionOrder,
    updateHeaderAlignment,
    updatePhotoConfig,
    updateHeaderButtonConfig,
    saveConfig,
    cloneResume,
    clearMessage
  }
}

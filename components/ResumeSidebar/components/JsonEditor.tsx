'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ResumeData } from '@/types'

/**
 * JSON编辑器组件属性接口
 */
interface JsonEditorProps {
  /** 简历数据 */
  data: ResumeData
  /** 数据变更回调 */
  onChange: (data: ResumeData) => void
}

/**
 * JSON编辑器组件
 * 
 * 提供JSON格式的简历数据编辑功能
 */
export function JsonEditor({ data, onChange }: JsonEditorProps) {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState('')

  /**
   * 初始化JSON文本
   */
  useEffect(() => {
    setJsonText(JSON.stringify(data, null, 2))
    setError('')
  }, [data])

  /**
   * 处理文本变更
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setJsonText(newText)

    try {
      const parsed = JSON.parse(newText)
      setError('')
      onChange(parsed)
    } catch (err) {
      setError('JSON格式错误：' + (err as Error).message)
    }
  }, [onChange])

  /**
   * 格式化JSON
   */
  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonText(formatted)
      setError('')
    } catch (err) {
      setError('无法格式化：' + (err as Error).message)
    }
  }, [jsonText])

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">JSON编辑</h3>
        <button
          onClick={formatJson}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
        >
          格式化
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          {error}
        </div>
      )}

      <textarea
        value={jsonText}
        onChange={handleChange}
        className="flex-1 w-full p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        spellCheck={false}
        placeholder="在此编辑JSON数据..."
      />

      <div className="mt-3 text-xs text-gray-500">
        <p>直接编辑JSON数据，修改后会实时同步到简历预览。</p>
      </div>
    </div>
  )
}

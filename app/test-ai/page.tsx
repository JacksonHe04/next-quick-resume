'use client'

import { useState } from 'react'
import { getCurrentResumeData } from '@/config/data'
import type { AiOptimizeRequest, AiOptimizeResponse } from '@/types'

/**
 * AI优化API测试页面
 */
export default function TestAIPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  /**
   * 测试AI优化API
   */
  const testOptimizeAPI = async () => {
    setLoading(true)
    setResult('正在测试API...')

    try {
      // 准备测试数据
      const currentResume = getCurrentResumeData()
      const testRequest: AiOptimizeRequest = {
        currentResume,
        suggestions: '请优化技术栈描述，突出React和TypeScript经验',
        jobDescription: '招聘前端开发工程师，要求熟练掌握React、TypeScript、Node.js等技术栈'
      }

      // 调用API
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest)
      })

      const apiResult: AiOptimizeResponse = await response.json()
      
      if (apiResult.success) {
        setResult(`✅ API测试成功！\n\n优化结果:\n${JSON.stringify(apiResult.data, null, 2)}`)
      } else {
        setResult(`❌ API测试失败: ${apiResult.error}`)
      }

    } catch (error) {
      setResult(`❌ API测试异常: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 测试数据验证
   */
  const testDataValidation = () => {
    try {
      const currentResume = getCurrentResumeData()
      
      // 验证必要字段
      const requiredFields = ['header', 'about', 'education', 'skills', 'intern', 'projects']
      const missingFields = requiredFields.filter(field => !(field in currentResume))
      
      if (missingFields.length > 0) {
        setResult(`❌ 数据验证失败，缺少字段: ${missingFields.join(', ')}`)
        return
      }
      
      setResult(`✅ 数据验证通过\n\n简历数据结构:\n${JSON.stringify(Object.keys(currentResume), null, 2)}`)
    } catch (error) {
      setResult(`❌ 数据验证失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">AI简历优化API测试</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testDataValidation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
        >
          测试数据验证
        </button>
        
        <button
          onClick={testOptimizeAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试AI优化API'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">测试结果:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result || '点击按钮开始测试'}</pre>
      </div>
    </div>
  )
}
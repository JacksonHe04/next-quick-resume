/**
 * AI简历优化API测试文件
 * 用于测试API功能是否正常工作
 */

import { getCurrentResumeData } from '@/config/data'
import type { AiOptimizeRequest } from '@/types'

/**
 * 测试AI优化API
 */
export async function testOptimizeAPI(): Promise<void> {
  try {
    console.log('开始测试AI优化API...')
    
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

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ API测试成功')
      console.log('优化结果:', result.data)
    } else {
      console.log('❌ API测试失败:', result.error)
    }

  } catch (error) {
    console.error('❌ API测试异常:', error)
  }
}

/**
 * 测试数据验证
 */
export function testDataValidation(): boolean {
  try {
    const currentResume = getCurrentResumeData()
    
    // 验证必要字段
    const requiredFields = ['header', 'about', 'education', 'skills', 'intern', 'projects']
    for (const field of requiredFields) {
      if (!(field in currentResume)) {
        console.error(`❌ 缺少必要字段: ${field}`)
        return false
      }
    }
    
    console.log('✅ 数据验证通过')
    return true
  } catch (error) {
    console.error('❌ 数据验证失败:', error)
    return false
  }
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 将测试函数暴露到全局，方便在控制台调用
  interface WindowWithTestFunctions extends Window {
    testOptimizeAPI?: typeof testOptimizeAPI;
    testDataValidation?: typeof testDataValidation;
  }
  (window as unknown as WindowWithTestFunctions).testOptimizeAPI = testOptimizeAPI;
  (window as unknown as WindowWithTestFunctions).testDataValidation = testDataValidation;
}
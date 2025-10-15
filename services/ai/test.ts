/**
 * AI服务测试文件
 * 用于验证AI配置和服务是否正常工作
 */

import { openaiClient, getCurrentAIConfig, validateAIConfig } from './index'

/**
 * 测试AI配置是否有效
 */
export function testAIConfig(): boolean {
  try {
    const config = getCurrentAIConfig()
    console.log('当前AI配置:', {
      baseUrl: config.baseUrl,
      model: config.model,
      apiKey: config.apiKey.substring(0, 10) + '...',
      timeout: config.timeout,
      maxRetries: config.maxRetries
    })

    const isValid = validateAIConfig(config)
    console.log('配置验证结果:', isValid ? '✅ 有效' : '❌ 无效')
    
    return isValid
  } catch (error) {
    console.error('配置测试失败:', error)
    return false
  }
}

/**
 * 测试简单的AI对话功能
 */
export async function testAIChat(): Promise<boolean> {
  try {
    console.log('开始测试AI对话功能...')
    
    const response = await openaiClient.ask(
      '请简单介绍一下你自己，用一句话回答即可。',
      '你是一个有用的AI助手。',
      { max_tokens: 100, temperature: 0.7 }
    )

    console.log('AI回复:', response)
    
    if (response && response.trim().length > 0) {
      console.log('✅ AI对话测试成功')
      return true
    } else {
      console.log('❌ AI对话测试失败：回复为空')
      return false
    }
  } catch (error) {
    console.error('❌ AI对话测试失败:', error)
    return false
  }
}

/**
 * 运行所有测试
 */
export async function runAllTests(): Promise<void> {
  console.log('=== AI服务测试开始 ===')
  
  // 测试配置
  const configTest = testAIConfig()
  
  if (!configTest) {
    console.log('❌ 配置测试失败，跳过后续测试')
    return
  }

  // 测试对话功能
  await testAIChat()
  
  console.log('=== AI服务测试结束 ===')
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && require.main === module) {
  runAllTests().catch(console.error)
}
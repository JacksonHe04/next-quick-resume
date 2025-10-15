/**
 * 直接测试AI客户端
 */

async function testAIDirect() {
  try {
    console.log('🔍 直接测试AI客户端...')
    
    // 动态导入ES模块
    const { openaiClient } = await import('../services/ai/openai-client.js')
    
    console.log('📡 发送简单请求...')
    
    const response = await openaiClient.ask(
      '请简单回复"测试成功"',
      '你是一个测试助手',
      {
        temperature: 0.1,
        max_tokens: 50
      }
    )
    
    console.log('✅ AI响应:', response)
    
  } catch (error) {
    console.error('💥 测试失败:', error.message)
    console.error('详细错误:', error)
  }
}

// 运行测试
testAIDirect()
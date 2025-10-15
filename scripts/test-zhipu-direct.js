/**
 * 直接测试智谱AI API连接
 */

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const API_KEY = 'fb006984119d45edbe544bc2f84fadcb.SIwkNh5LrS1tckHA'

async function testZhipuAPI() {
  try {
    console.log('🔍 直接测试智谱AI API...')
    console.log('📡 API端点:', API_URL)
    
    const requestBody = {
      model: 'glm-4.5-flash',
      messages: [
        {
          role: 'system',
          content: '你是一个测试助手'
        },
        {
          role: 'user',
          content: '请简单回复"API连接成功"'
        }
      ],
      temperature: 0.1,
      max_tokens: 50
    }
    
    console.log('📤 发送请求...')
    console.log('请求体:', JSON.stringify(requestBody, null, 2))
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    console.log('📡 响应状态:', response.status)
    console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API错误:', errorText)
      return
    }
    
    const result = await response.json()
    console.log('✅ API响应成功!')
    console.log('📄 响应内容:', JSON.stringify(result, null, 2))
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('💥 请求超时 (30秒)')
    } else {
      console.error('💥 测试失败:', error.message)
      console.error('详细错误:', error)
    }
  }
}

// 运行测试
testZhipuAPI()
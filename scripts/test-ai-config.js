/**
 * 测试AI配置和连接
 */

async function testAIConnection() {
  try {
    console.log('🔍 测试AI服务连接...')
    
    const testData = {
      model: 'glm-4.5-flash',
      messages: [
        {
          role: 'user',
          content: '你好，请回复"连接成功"'
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    }

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fb006984119d45edbe544bc2f84fadcb.SIwkNh5LrS1tckHA'
      },
      body: JSON.stringify(testData)
    })

    console.log('📡 响应状态:', response.status)
    console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))
    
    const result = await response.text()
    console.log('📄 响应内容:', result)

    if (response.ok) {
      console.log('✅ AI服务连接成功!')
    } else {
      console.log('❌ AI服务连接失败')
    }

  } catch (error) {
    console.error('💥 连接测试异常:', error.message)
  }
}

// 运行测试
testAIConnection()
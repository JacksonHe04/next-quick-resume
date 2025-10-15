import { ResumeData } from '@/types'

/**
 * AI简历优化请求参数
 */
export interface AiOptimizeRequest {
  currentResume: ResumeData
  suggestions?: string
  jobDescription?: string
}

/**
 * AI简历优化响应
 */
export interface AiOptimizeResponse {
  success: boolean
  data?: ResumeData
  error?: string
}

/**
 * AI简历优化API接口
 * TODO: 实现实际的AI服务调用
 * 
 * 建议的实现步骤：
 * 1. 集成大语言模型API（如OpenAI GPT、Claude等）
 * 2. 设计优化提示词模板
 * 3. 处理API响应和错误
 * 4. 实现结果验证和格式化
 */
export async function optimizeResumeWithAI(request: AiOptimizeRequest): Promise<AiOptimizeResponse> {
  try {
    // TODO: 替换为实际的AI服务调用
    const optimizedResume = await callAiService(request)
    
    return {
      success: true,
      data: optimizedResume
    }
  } catch (error) {
    console.error('AI优化失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 调用AI服务的核心函数
 * TODO: 实现实际的AI服务调用逻辑
 */
async function callAiService(request: AiOptimizeRequest): Promise<ResumeData> {
  // 构建提示词
  const prompt = buildOptimizationPrompt(request)
  
  // TODO: 调用实际的AI API
  // 示例代码（需要根据实际使用的AI服务进行调整）:
  /*
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的简历优化助手...'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })
  
  const result = await response.json()
  const optimizedResumeJson = result.choices[0].message.content
  
  return JSON.parse(optimizedResumeJson)
  */
  
  // 临时返回模拟数据（在实际AI服务接入前使用）
  // 注意：这里暂时忽略prompt，实际接入时会使用
  console.log('AI优化提示词:', prompt) // 临时日志，便于调试
  return mockOptimizeResume(request)
}

/**
 * 构建AI优化提示词
 */
function buildOptimizationPrompt(request: AiOptimizeRequest): string {
  const { currentResume, suggestions, jobDescription } = request
  
  let prompt = `请根据以下信息优化简历内容，返回优化后的JSON格式简历数据：

当前简历数据：
${JSON.stringify(currentResume, null, 2)}

`

  if (suggestions) {
    prompt += `优化建议：
${suggestions}

`
  }

  if (jobDescription) {
    prompt += `目标岗位JD：
${jobDescription}

`
  }

  prompt += `优化要求：
1. 保持JSON结构不变，只优化内容
2. 根据提供的建议和JD要求调整简历内容
3. 突出相关技能和经验
4. 优化语言表达，使其更专业和吸引人
5. 确保信息真实性，不添加虚假内容
6. 返回完整的JSON格式数据

请直接返回优化后的JSON数据，不要包含其他说明文字。`

  return prompt
}

/**
 * 模拟AI优化结果
 * TODO: 在实际AI服务接入后移除此函数
 */
function mockOptimizeResume(request: AiOptimizeRequest): ResumeData {
  const { currentResume, suggestions, jobDescription } = request
  const optimizedResume = JSON.parse(JSON.stringify(currentResume)) // 深拷贝
  
  // 模拟一些优化效果
  if (suggestions?.includes('技术栈') || jobDescription?.includes('React')) {
    optimizedResume.skills.items = [
      'React/Vue.js (精通)',
      'TypeScript/JavaScript (熟练)',
      'Node.js/Express (熟练)', 
      'Python/Django (了解)',
      'MySQL/MongoDB (熟练)',
      'Git/Docker (熟练)'
    ]
  }

  if (suggestions?.includes('项目成果') || jobDescription?.includes('性能')) {
    if (optimizedResume.projects.items[0]) {
      optimizedResume.projects.items[0].features = [
        '实现了完整的用户管理系统，支持10万+并发用户',
        '优化页面加载速度，首屏渲染时间减少60%',
        '集成第三方支付系统，交易成功率达99.5%',
        '实现响应式设计，支持多端适配',
        '建立完善的错误监控和日志系统',
        '通过代码分割和懒加载优化包体积50%'
      ]
    }
  }

  if (suggestions?.includes('工作经验') || jobDescription?.includes('团队')) {
    if (optimizedResume.intern.items[0]) {
      optimizedResume.intern.items[0].responsibilities = [
        '负责前端架构设计和技术选型，提升团队开发效率30%',
        '主导多个核心功能模块开发，确保项目按时交付',
        '建立代码规范和review流程，提高代码质量',
        '指导初级开发者，提升团队整体技术水平',
        '参与产品需求分析，提供技术可行性建议'
      ]
    }
  }

  return optimizedResume
}

/**
 * 环境变量配置说明
 * TODO: 在实际部署时配置以下环境变量
 * 
 * OPENAI_API_KEY=your_openai_api_key_here
 * AI_MODEL=gpt-4  # 或其他模型
 * AI_MAX_TOKENS=2000
 * AI_TEMPERATURE=0.7
 */
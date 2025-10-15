/**
 * AI简历优化服务
 * 使用AI大模型来优化简历内容
 */

import { openaiClient } from './openai-client'
import type { AiOptimizeRequest, AiOptimizeResponse, ResumeData } from '@/types'

/**
 * AI简历优化主函数
 * @param request - 优化请求参数
 * @returns Promise<AiOptimizeResponse> - 优化结果
 */
export async function optimizeResumeWithAI(request: AiOptimizeRequest): Promise<AiOptimizeResponse> {
  try {
    console.log('开始AI简历优化...')
    console.log('请求数据大小:', JSON.stringify(request).length, '字符')
    
    // 构建优化提示词
    const prompt = buildOptimizationPrompt(request)
    console.log('提示词长度:', prompt.length, '字符')
    
    // 调用AI服务
    console.log('调用AI服务...')
    const optimizedContent = await openaiClient.ask(
      prompt,
      getSystemPrompt(),
      {
        temperature: 0.7,
        max_tokens: 2000  // 减少token数量
      }
    )
    console.log('AI服务响应完成，响应长度:', optimizedContent.length, '字符')

    // 解析AI返回的JSON
    const optimizedResume = parseAIResponse(optimizedContent)
    
    // 验证优化结果
    validateOptimizedResume(optimizedResume)
    
    console.log('AI简历优化完成')
    
    return {
      success: true,
      data: optimizedResume
    }

  } catch (error) {
    console.error('AI简历优化失败:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '优化失败，请稍后重试'
    }
  }
}

/**
 * 获取系统提示词
 * @returns string - 系统提示词
 */
function getSystemPrompt(): string {
  return `你是一个专业的简历优化专家，具有丰富的HR和招聘经验。你的任务是：

1. 分析用户提供的简历内容和优化需求
2. 根据职位描述（如果提供）调整简历重点
3. 优化语言表达，使其更专业、更有吸引力
4. 突出相关技能和成就
5. 保持信息的真实性，不添加虚假内容
6. 返回完整的JSON格式简历数据

注意事项：
- 必须保持原有的JSON结构不变
- 只优化内容，不改变数据格式
- 确保所有字段都有合理的值
- 语言要专业、简洁、有力
- 突出量化成果和具体贡献`
}

/**
 * 构建优化提示词
 * @param request - 优化请求参数
 * @returns string - 完整的提示词
 */
function buildOptimizationPrompt(request: AiOptimizeRequest): string {
  const { currentResume, suggestions, jobDescription } = request
  
  let prompt = `请优化以下简历内容，返回优化后的完整JSON格式数据：

## 当前简历数据：
\`\`\`json
${JSON.stringify(currentResume, null, 2)}
\`\`\`

`

  if (suggestions) {
    prompt += `## 优化建议：
${suggestions}

`
  }

  if (jobDescription) {
    prompt += `## 目标职位描述：
${jobDescription}

请根据职位要求调整简历重点，突出相关技能和经验。

`
  }

  prompt += `## 优化要求：

1. **保持结构**：必须保持原有的JSON结构完全不变
2. **内容优化**：
   - 优化语言表达，使其更专业和吸引人
   - 突出技能匹配度和相关经验
   - 量化成果和贡献（如性能提升、用户增长等）
   - 使用行业术语和关键词
3. **真实性**：不添加虚假信息，基于现有内容进行优化
4. **针对性**：${jobDescription ? '根据职位要求调整重点' : '通用性优化，提升整体质量'}

## 输出格式：
请直接返回优化后的完整JSON数据，不要包含任何其他说明文字或markdown格式。确保JSON格式正确且可以直接解析。`

  return prompt
}

/**
 * 解析AI返回的响应
 * @param response - AI返回的原始响应
 * @returns ResumeData - 解析后的简历数据
 */
function parseAIResponse(response: string): ResumeData {
  try {
    // 清理响应内容，移除可能的markdown格式
    let cleanedResponse = response.trim()
    
    // 移除可能的代码块标记
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // 解析JSON
    const parsedData = JSON.parse(cleanedResponse)
    
    return parsedData as ResumeData
    
  } catch (error) {
    console.error('解析AI响应失败:', error)
    console.error('原始响应:', response)
    throw new Error('AI返回的数据格式无效，请重试')
  }
}

/**
 * 验证优化后的简历数据
 * @param optimizedResume - 优化后的简历数据
 */
function validateOptimizedResume(optimizedResume: ResumeData): void {
  // 验证必要字段是否存在
  const requiredFields = ['header', 'about', 'education', 'skills', 'intern', 'projects']
  
  for (const field of requiredFields) {
    if (!(field in optimizedResume)) {
      throw new Error(`优化结果缺少必要字段: ${field}`)
    }
  }
  
  // 验证数据结构是否正确
  if (!optimizedResume.header?.contact || !optimizedResume.header?.jobInfo) {
    throw new Error('优化结果中头部信息格式错误')
  }
  
  if (!optimizedResume.skills?.items || !Array.isArray(optimizedResume.skills.items)) {
    throw new Error('优化结果中技能信息格式错误')
  }
  
  if (!optimizedResume.projects?.items || !Array.isArray(optimizedResume.projects.items)) {
    throw new Error('优化结果中项目信息格式错误')
  }
  
  if (!optimizedResume.intern?.items || !Array.isArray(optimizedResume.intern.items)) {
    throw new Error('优化结果中实习经历格式错误')
  }
  
  console.log('简历数据验证通过')
}

/**
 * 流式优化简历（支持实时显示优化过程）
 * @param request - 优化请求参数
 * @returns AsyncGenerator<string> - 流式响应生成器
 */
export async function* optimizeResumeStream(request: AiOptimizeRequest): AsyncGenerator<string> {
  try {
    const prompt = buildOptimizationPrompt(request)
    
    const stream = openaiClient.createChatCompletionStream({
      model: 'glm-4.5-flash', // 这会被配置覆盖
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: true
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error) {
    console.error('流式优化失败:', error)
    yield JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '流式优化失败'
    })
  }
}
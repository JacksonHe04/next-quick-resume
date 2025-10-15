/**
 * AI服务使用示例
 * 展示如何在后端服务函数中使用AI配置和客户端
 */

import { openaiClient, chat, ask, type ChatMessage } from './index'

/**
 * 示例1：简历优化服务
 * 使用AI来优化简历内容
 */
export async function optimizeResume(resumeContent: string, jobDescription?: string): Promise<string> {
  const systemPrompt = `你是一个专业的简历优化专家。请帮助用户优化简历内容，使其更加专业、突出重点，并符合现代招聘标准。`
  
  let userPrompt = `请优化以下简历内容：\n\n${resumeContent}`
  
  if (jobDescription) {
    userPrompt += `\n\n目标职位描述：\n${jobDescription}\n\n请根据职位要求调整简历重点。`
  }

  try {
    const optimizedContent = await ask(userPrompt, systemPrompt, {
      temperature: 0.7,
      max_tokens: 2000
    })
    
    return optimizedContent
  } catch (error) {
    console.error('简历优化失败:', error)
    throw new Error('简历优化服务暂时不可用')
  }
}

/**
 * 示例2：技能评估服务
 * 基于简历内容评估技能水平
 */
export async function assessSkills(resumeContent: string): Promise<{
  technicalSkills: string[]
  softSkills: string[]
  recommendations: string[]
}> {
  const systemPrompt = `你是一个技能评估专家。请分析简历内容，提取技术技能和软技能，并给出改进建议。请以JSON格式返回结果。`
  
  const userPrompt = `请分析以下简历内容，提取技能并给出建议：\n\n${resumeContent}\n\n请返回JSON格式：{"technicalSkills": [], "softSkills": [], "recommendations": []}`

  try {
    const response = await ask(userPrompt, systemPrompt, {
      temperature: 0.3,
      max_tokens: 1500
    })
    
    // 尝试解析JSON响应
    const result = JSON.parse(response)
    return result
  } catch (error) {
    console.error('技能评估失败:', error)
    // 返回默认结构
    return {
      technicalSkills: [],
      softSkills: [],
      recommendations: ['技能评估服务暂时不可用，请稍后重试']
    }
  }
}

/**
 * 示例3：面试问题生成服务
 * 根据简历内容生成面试问题
 */
export async function generateInterviewQuestions(
  resumeContent: string,
  position: string,
  difficulty: 'junior' | 'mid' | 'senior' = 'mid'
): Promise<string[]> {
  const systemPrompt = `你是一个面试官，需要根据候选人的简历和目标职位生成合适的面试问题。`
  
  const userPrompt = `
目标职位：${position}
难度级别：${difficulty}
候选人简历：
${resumeContent}

请生成10个针对性的面试问题，涵盖技术能力、项目经验和软技能。请以数组格式返回，每个问题为一个字符串。
`

  try {
    const response = await ask(userPrompt, systemPrompt, {
      temperature: 0.8,
      max_tokens: 1500
    })
    
    // 简单解析响应，提取问题
    const questions = response
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(question => question.length > 10)
    
    return questions.slice(0, 10) // 最多返回10个问题
  } catch (error) {
    console.error('面试问题生成失败:', error)
    return ['面试问题生成服务暂时不可用，请稍后重试']
  }
}

/**
 * 示例4：多轮对话服务
 * 支持上下文的多轮对话
 */
export class ResumeConsultant {
  private conversationHistory: ChatMessage[] = []

  constructor() {
    // 初始化系统提示
    this.conversationHistory.push({
      role: 'system',
      content: '你是一个专业的简历咨询顾问，可以帮助用户改进简历、准备面试、规划职业发展。请提供专业、实用的建议。'
    })
  }

  /**
   * 发送消息并获取回复
   */
  async sendMessage(message: string): Promise<string> {
    try {
      // 添加用户消息到历史
      this.conversationHistory.push({
        role: 'user',
        content: message
      })

      // 获取AI回复
      const response = await chat(this.conversationHistory, {
        temperature: 0.7,
        max_tokens: 1000
      })

      // 添加AI回复到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      })

      return response
    } catch (error) {
      console.error('对话失败:', error)
      throw new Error('咨询服务暂时不可用')
    }
  }

  /**
   * 清除对话历史
   */
  clearHistory(): void {
    this.conversationHistory = [this.conversationHistory[0]] // 保留系统提示
  }

  /**
   * 获取对话历史
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }
}

/**
 * 示例5：流式响应服务
 * 展示如何使用流式API
 */
export async function* streamOptimizeResume(resumeContent: string): AsyncGenerator<string> {
  const systemPrompt = '你是一个专业的简历优化专家。'
  const userPrompt = `请逐步优化以下简历内容：\n\n${resumeContent}`

  try {
    const stream = openaiClient.createChatCompletionStream({
      model: 'glm-4.5-flash', // 这会被配置中的model覆盖
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
    yield '流式优化服务暂时不可用'
  }
}
/**
 * OpenAI API格式的统一客户端
 * 支持多种AI服务提供商，统一使用OpenAI API格式
 */

import { getCurrentAIConfig, validateAIConfig } from '@/config/ai'
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionStreamChunk,
  ChatMessage
} from './types'

/**
 * OpenAI API客户端类
 * 提供统一的聊天完成接口，兼容多种AI服务提供商
 */
export class OpenAIClient {
  private config = getCurrentAIConfig()

  constructor() {
    if (!validateAIConfig(this.config)) {
      throw new Error('AI配置无效：缺少必要的配置项')
    }
  }

  /**
   * 创建聊天完成请求
   * @param request - 聊天完成请求参数
   * @returns Promise<ChatCompletionResponse> - 聊天完成响应
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const maxRetries = this.config.maxRetries || 2
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // 重试前等待，使用指数退避
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          console.log(`第${attempt}次重试，等待${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const response = await this.makeRequest(request)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = this.getErrorMessage(response.status, errorData)
          throw new Error(errorMessage)
        }

        return await response.json() as ChatCompletionResponse
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`聊天完成请求失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`, lastError.message)
        
        // 如果是最后一次尝试，或者是不可重试的错误，直接抛出
        if (attempt === maxRetries || !this.isRetryableError(lastError)) {
          break
        }
      }
    }

    throw lastError || new Error('未知错误')
  }

  /**
   * 创建流式聊天完成请求
   * @param request - 聊天完成请求参数
   * @returns AsyncGenerator<ChatCompletionStreamChunk> - 流式响应生成器
   */
  async* createChatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<ChatCompletionStreamChunk> {
    const streamRequest = { ...request, stream: true }
    
    try {
      const response = await this.makeRequest(streamRequest)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorData.message || '未知错误'}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue
            
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6)
                const chunk = JSON.parse(jsonStr) as ChatCompletionStreamChunk
                yield chunk
              } catch (parseError) {
                console.warn('解析流式响应失败:', parseError, '原始数据:', trimmedLine)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('流式聊天完成请求失败:', error)
      throw error
    }
  }

  /**
   * 发送HTTP请求到AI服务
   * @param request - 请求参数
   * @returns Promise<Response> - HTTP响应
   */
  private async makeRequest(request: ChatCompletionRequest): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { model: _, ...requestWithoutModel } = request
    const body = JSON.stringify({
      model: this.config.model,
      ...requestWithoutModel
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, this.config.timeout || 30000)

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw error
    }
  }

  /**
   * 简化的聊天接口
   * @param messages - 消息列表
   * @param options - 可选参数
   * @returns Promise<string> - AI回复内容
   */
  async chat(
    messages: ChatMessage[],
    options?: Partial<ChatCompletionRequest>
  ): Promise<string> {
    const request: ChatCompletionRequest = {
      model: this.config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      ...options
    }

    const response = await this.createChatCompletion(request)
    return response.choices[0]?.message?.content || ''
  }

  /**
   * 简化的单次问答接口
   * @param prompt - 用户提示
   * @param systemPrompt - 系统提示（可选）
   * @param options - 可选参数
   * @returns Promise<string> - AI回复内容
   */
  async ask(
    prompt: string,
    systemPrompt?: string,
    options?: Partial<ChatCompletionRequest>
  ): Promise<string> {
    const messages: ChatMessage[] = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    return this.chat(messages, options)
  }

  /**
   * 获取错误信息
   * @param status - HTTP状态码
   * @param errorData - 错误数据
   * @returns string - 格式化的错误信息
   */
  private getErrorMessage(status: number, errorData: any): string {
    const statusText = {
      400: '请求参数错误',
      401: 'API密钥无效或已过期',
      403: '访问被拒绝，请检查权限',
      404: '请求的资源不存在',
      429: '请求频率过高，请稍后重试',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时'
    }[status] || '未知错误'

    const message = errorData?.error?.message || errorData?.message || statusText
    return `API请求失败 (${status}): ${message}`
  }

  /**
   * 判断错误是否可以重试
   * @param error - 错误对象
   * @returns boolean - 是否可以重试
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase()
    
    // 网络错误和临时性错误可以重试
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('连接') ||
        message.includes('超时')) {
      return true
    }

    // HTTP状态码相关的重试判断
    if (message.includes('(429)') ||  // 频率限制
        message.includes('(500)') ||  // 服务器错误
        message.includes('(502)') ||  // 网关错误
        message.includes('(503)') ||  // 服务不可用
        message.includes('(504)')) {  // 网关超时
      return true
    }

    return false
  }
}

// 导出默认实例
export const openaiClient = new OpenAIClient()

// 导出便捷函数
export const chatCompletion = (request: ChatCompletionRequest) => 
  openaiClient.createChatCompletion(request)

export const chatCompletionStream = (request: ChatCompletionRequest) => 
  openaiClient.createChatCompletionStream(request)

export const chat = (messages: ChatMessage[], options?: Partial<ChatCompletionRequest>) => 
  openaiClient.chat(messages, options)

export const ask = (prompt: string, systemPrompt?: string, options?: Partial<ChatCompletionRequest>) => 
  openaiClient.ask(prompt, systemPrompt, options)
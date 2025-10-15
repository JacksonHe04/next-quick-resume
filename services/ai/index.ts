/**
 * AI服务统一导出文件
 * 提供所有AI相关功能的统一入口
 */

// 导出类型定义
export type {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionStreamChunk,
  ChatCompletionChoice,
  ChatCompletionUsage,
  APIError
} from './types'

// 导出OpenAI客户端
export {
  OpenAIClient,
  openaiClient,
  chatCompletion,
  chatCompletionStream,
  chat,
  ask
} from './openai-client'

// 导出配置相关
export {
  getCurrentAIConfig,
  validateAIConfig,
  CURRENT_AI_CONFIG,
  ZHIPU_AI_CONFIG
} from '@/config/ai'

export type { AIConfig } from '@/config/ai'
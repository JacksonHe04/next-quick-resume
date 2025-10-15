/**
 * AI服务类型定义
 * 定义OpenAI API格式的请求和响应类型
 */

// OpenAI API消息类型
export interface ChatMessage {
  /** 消息角色 */
  role: 'system' | 'user' | 'assistant'
  /** 消息内容 */
  content: string
}

// OpenAI API请求参数
export interface ChatCompletionRequest {
  /** 模型名称 */
  model: string
  /** 消息列表 */
  messages: ChatMessage[]
  /** 温度参数，控制随机性 */
  temperature?: number
  /** 最大token数 */
  max_tokens?: number
  /** 流式输出 */
  stream?: boolean
  /** 停止词 */
  stop?: string | string[]
  /** 频率惩罚 */
  frequency_penalty?: number
  /** 存在惩罚 */
  presence_penalty?: number
  /** 用户标识 */
  user?: string
}

// OpenAI API响应中的选择项
export interface ChatCompletionChoice {
  /** 消息内容 */
  message: ChatMessage
  /** 完成原因 */
  finish_reason: 'stop' | 'length' | 'content_filter' | null
  /** 选择索引 */
  index: number
}

// OpenAI API使用统计
export interface ChatCompletionUsage {
  /** 提示token数 */
  prompt_tokens: number
  /** 完成token数 */
  completion_tokens: number
  /** 总token数 */
  total_tokens: number
}

// OpenAI API完整响应
export interface ChatCompletionResponse {
  /** 响应ID */
  id: string
  /** 对象类型 */
  object: 'chat.completion'
  /** 创建时间戳 */
  created: number
  /** 模型名称 */
  model: string
  /** 选择列表 */
  choices: ChatCompletionChoice[]
  /** 使用统计 */
  usage: ChatCompletionUsage
}

// 流式响应数据块
export interface ChatCompletionStreamChunk {
  /** 响应ID */
  id: string
  /** 对象类型 */
  object: 'chat.completion.chunk'
  /** 创建时间戳 */
  created: number
  /** 模型名称 */
  model: string
  /** 选择列表 */
  choices: Array<{
    /** 增量消息 */
    delta: Partial<ChatMessage>
    /** 完成原因 */
    finish_reason: 'stop' | 'length' | 'content_filter' | null
    /** 选择索引 */
    index: number
  }>
}

// API错误响应
export interface APIError {
  /** 错误信息 */
  message: string
  /** 错误类型 */
  type: string
  /** 错误参数 */
  param?: string
  /** 错误代码 */
  code?: string
}
/**
 * AI大模型配置文件
 * 统一管理AI服务的配置信息，包括API端点、模型参数等
 */

// AI服务配置接口
export interface AIConfig {
  /** API基础URL */
  baseUrl: string
  /** 模型标识符 */
  model: string
  /** API密钥 */
  apiKey: string
  /** 请求超时时间（毫秒） */
  timeout?: number
  /** 最大重试次数 */
  maxRetries?: number
}

// 智谱AI配置
export const ZHIPU_AI_CONFIG: AIConfig = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4-flash-250414',
  apiKey: 'fb006984119d45edbe544bc2f84fadcb.SIwkNh5LrS1tckHA',
  timeout: 60000, // 60秒超时
  maxRetries: 2
}

// 当前使用的AI配置
export const CURRENT_AI_CONFIG: AIConfig = ZHIPU_AI_CONFIG

/**
 * 获取当前AI配置
 * @returns 当前AI配置对象
 */
export const getCurrentAIConfig = (): AIConfig => {
  return CURRENT_AI_CONFIG
}

/**
 * 验证AI配置是否完整
 * @param config - AI配置对象
 * @returns 配置是否有效
 */
export const validateAIConfig = (config: AIConfig): boolean => {
  return !!(config.baseUrl && config.model && config.apiKey)
}
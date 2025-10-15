import { AiOptimizeRequest, AiOptimizeResponse } from '@/types'
import { optimizeResumeWithAI as optimizeWithAIService } from '@/services/ai/resume-optimizer'

/**
 * AI简历优化API接口
 * 使用智谱AI GLM-4.5-flash模型进行简历优化
 */
export async function optimizeResumeWithAI(request: AiOptimizeRequest): Promise<AiOptimizeResponse> {
  try {
    // 使用新的AI服务进行优化
    const result = await optimizeWithAIService(request)
    return result
  } catch (error) {
    console.error('AI优化失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 注意：原有的模拟函数已迁移到 @/services/ai/resume-optimizer.ts
// 现在使用真实的AI服务进行简历优化
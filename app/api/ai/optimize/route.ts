/**
 * AI简历优化API路由
 * POST /api/ai/optimize
 */

import { NextRequest, NextResponse } from 'next/server'
import { optimizeResumeWithAI } from '@/services/ai/resume-optimizer'
import type { AiOptimizeRequest, AiOptimizeResponse } from '@/types'

/**
 * 处理AI简历优化请求
 * @param request - Next.js请求对象
 * @returns Promise<NextResponse> - API响应
 */
export async function POST(request: NextRequest): Promise<NextResponse<AiOptimizeResponse>> {
  try {
    // 解析请求体
    const body: AiOptimizeRequest = await request.json()
    
    // 验证请求参数
    if (!body.currentResume) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数：currentResume'
      }, { status: 400 })
    }

    // 验证是否提供了优化建议或职位描述
    if (!body.suggestions && !body.jobDescription) {
      return NextResponse.json({
        success: false,
        error: '请提供优化建议或职位描述'
      }, { status: 400 })
    }

    // 调用AI优化服务
    const result = await optimizeResumeWithAI(body)
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 500 })
    }

  } catch (error) {
    console.error('AI优化API错误:', error)
    
    // 处理JSON解析错误
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: '请求格式错误：无效的JSON'
      }, { status: 400 })
    }

    // 处理其他错误
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 })
  }
}

/**
 * 处理OPTIONS请求（CORS预检）
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
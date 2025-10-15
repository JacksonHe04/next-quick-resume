import { NextRequest, NextResponse } from 'next/server'
import { ResumeData } from '@/types'

/**
 * AI文本解析API
 * 将OCR提取的文本解析为结构化的JSON数据
 */
export async function POST(request: NextRequest) {
  try {
    const { text, _template } = await request.json()
    void _template // 故意忽略模板参数，使用默认解析逻辑

    if (!text) {
      return NextResponse.json(
        { error: '缺少待解析的文本内容' },
        { status: 400 }
      )
    }

    // TODO: 实现AI文本解析逻辑
    // 可以使用以下AI服务之一：
    // 1. OpenAI GPT API
    // 2. Claude API
    // 3. 百度文心一言API
    // 4. 阿里通义千问API
    // 5. 腾讯混元API
    // 6. 本地部署的开源模型

    // 示例使用OpenAI API的代码结构：
    // import OpenAI from 'openai'
    // 
    // const openai = new OpenAI({
    //   apiKey: process.env.OPENAI_API_KEY,
    // })
    // 
    // const prompt = `
    // 请将以下简历文本解析为JSON格式，严格按照提供的模板结构：
    // 
    // 模板结构：
    // ${JSON.stringify(template, null, 2)}
    // 
    // 简历文本：
    // ${text}
    // 
    // 要求：
    // 1. 严格按照模板结构返回JSON
    // 2. 如果某个字段在文本中找不到对应信息，保持空字符串
    // 3. 技能、工作职责、项目特色等数组字段，请根据文本内容合理拆分
    // 4. 只返回JSON，不要包含其他说明文字
    // `
    // 
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: "你是一个专业的简历解析助手，能够将非结构化的简历文本转换为结构化的JSON数据。"
    //     },
    //     {
    //       role: "user",
    //       content: prompt
    //     }
    //   ],
    //   temperature: 0.1,
    // })
    // 
    // const parsedData = JSON.parse(completion.choices[0].message.content)

    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 返回模拟的解析结果
    const mockParsedData: ResumeData = {
      header: {
        name: "张三",
        contact: {
          phone: "138-0000-0000",
          email: "zhangsan@example.com",
          wechat: "zhangsan123",
          age: "",
          github: {
            text: "",
            url: ""
          },
          homepage: {
            text: "",
            url: ""
          }
        },
        jobInfo: {
          position: "软件工程师",
          duration: "",
          availability: ""
        }
      },
      about: {
        title: "个人简介",
        content: ""
      },
      education: {
        title: "教育背景",
        school: "北京大学",
        period: "2018-2022",
        details: "计算机科学与技术 本科"
      },
      skills: {
        title: "技能专长",
        items: [
          "JavaScript/TypeScript",
          "React/Vue.js", 
          "Node.js",
          "Python",
          "MySQL/MongoDB",
          ""
        ]
      },
      intern: {
        title: "工作经历",
        items: [
          {
            company: "ABC科技有限公司",
            position: "前端工程师",
            period: "2022.07-至今",
            description: "",
            responsibilities: [
              "负责公司主要产品的前端开发工作",
              "参与系统架构设计和技术选型",
              "优化页面性能，提升用户体验"
            ],
            show: true
          }
        ]
      },
      projects: {
        title: "项目经验",
        items: [
          {
            name: "在线教育平台",
            github: "",
            demo: "",
            techStack: "React + TypeScript + Node.js",
            description: "",
            features: [
              "开发了完整的在线学习系统",
              "实现了视频播放、在线测试等功能",
              "支持多端适配，用户体验良好",
              "",
              "",
              ""
            ],
            show: true
          }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      parsedData: mockParsedData,
      confidence: 0.92, // AI解析置信度
      processingTime: 3000,
      tokensUsed: 1250, // AI API使用的token数量
      message: 'AI解析完成'
    })

  } catch (error) {
    console.error('AI解析失败:', error)
    return NextResponse.json(
      { error: 'AI解析失败' },
      { status: 500 }
    )
  }
}

/**
 * 获取解析任务状态API
 * 用于查询AI解析进度
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId')

  if (!taskId) {
    return NextResponse.json(
      { error: '缺少任务ID参数' },
      { status: 400 }
    )
  }

  // TODO: 实现AI解析任务状态查询逻辑
  // 从缓存或数据库中获取解析状态
  
  return NextResponse.json({
    taskId,
    status: 'completed', // pending | processing | completed | failed
    progress: 100, // 处理进度百分比
    result: null // 解析结果，完成时返回
  })
}
/**
 * 简单的AI优化测试
 */

const simpleTestData = {
  currentResume: {
    header: {
      name: "张三",
      contact: {
        phone: "13800138000",
        email: "zhangsan@example.com",
        wechat: "zhangsan_wx",
        age: "25",
        github: {
          text: "github.com/zhangsan",
          url: "https://github.com/zhangsan"
        },
        homepage: {
          text: "zhangsan.dev",
          url: "https://zhangsan.dev"
        }
      },
      jobInfo: {
        position: "前端开发工程师",
        duration: "3年",
        availability: "随时到岗"
      }
    },
    about: {
      title: "关于我",
      content: "具有3年前端开发经验，熟悉React、Vue等主流框架"
    },
    education: {
      title: "教育经历",
      school: "北京大学",
      period: "2017.09-2021.06",
      details: "计算机科学与技术专业，GPA: 3.8/4.0"
    },
    skills: {
      title: "技能专长",
      items: ["JavaScript", "React", "Vue", "Node.js"]
    },
    intern: {
      title: "实习经历",
      items: [{
        company: "腾讯",
        position: "前端开发实习生",
        period: "2020.06-2020.09",
        description: "负责微信小程序开发",
        responsibilities: ["开发微信小程序", "优化页面性能"],
        show: true
      }]
    },
    projects: {
      title: "项目经历",
      items: [{
        name: "电商网站",
        github: "https://github.com/zhangsan/ecommerce",
        demo: "https://ecommerce.zhangsan.dev",
        techStack: "React, Node.js, MongoDB",
        description: "使用React开发的电商网站",
        features: ["用户管理", "商品展示", "购物车功能"],
        show: true
      }]
    }
  },
  suggestions: "请简单优化一下",
  jobDescription: "前端开发工程师"
}

async function testSimpleOptimize() {
  try {
    console.log('🚀 开始简单优化测试...')
    
    const response = await fetch('http://localhost:3001/api/ai/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleTestData)
    })

    console.log('📡 API响应状态:', response.status)
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ 简单优化测试成功!')
      console.log('📄 优化结果:', JSON.stringify(result.data, null, 2))
    } else {
      console.log('❌ 简单优化测试失败:', result.error)
    }

  } catch (error) {
    console.error('💥 测试异常:', error.message)
  }
}

// 运行测试
testSimpleOptimize()
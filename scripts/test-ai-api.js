/**
 * AI简历优化API测试脚本
 * 使用Node.js直接测试API功能
 */

const testData = {
  currentResume: {
    header: {
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
        duration: "3年经验",
        availability: "随时到岗"
      }
    },
    about: {
      title: "个人简介",
      content: "具有3年前端开发经验，熟练掌握React、Vue等框架"
    },
    education: {
      title: "教育经历",
      school: "北京大学",
      period: "2017.09-2021.06",
      details: "计算机科学与技术专业 | GPA: 3.8/4.0"
    },
    skills: {
      title: "技能专长",
      items: ["JavaScript", "React", "Vue", "Node.js", "TypeScript", "团队协作", "沟通能力"]
    },
    intern: {
      title: "实习经历",
      items: [
        {
          company: "腾讯",
          position: "前端开发实习生",
          period: "2020.06-2020.09",
          description: "负责微信小程序开发",
          responsibilities: ["开发微信小程序功能模块", "优化用户界面交互", "参与代码评审"],
          show: true
        }
      ]
    },
    projects: {
      title: "项目经历",
      items: [
        {
          name: "电商网站",
          github: "https://github.com/zhangsan/ecommerce",
          demo: "https://ecommerce-demo.com",
          techStack: "React + Redux + Ant Design",
          description: "使用React开发的电商平台",
          features: ["用户体验优化", "性能提升30%", "响应式设计"],
          show: true
        }
      ]
    }
  },
  suggestions: "请优化技术栈描述，突出React和TypeScript经验",
  jobDescription: "招聘前端开发工程师，要求熟练掌握React、TypeScript、Node.js等技术栈"
}

async function testAPI() {
  try {
    console.log('🚀 开始测试AI优化API...')
    
    const response = await fetch('http://localhost:3001/api/ai/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    console.log('📡 API响应状态:', response.status)
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ API测试成功!')
      console.log('📄 优化结果:', JSON.stringify(result.data, null, 2))
    } else {
      console.log('❌ API测试失败:', result.error)
    }

  } catch (error) {
    console.error('💥 API测试异常:', error.message)
  }
}

// 运行测试
testAPI()
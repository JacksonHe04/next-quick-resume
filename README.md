<h1 align="center">🚀 Next Quick Resume</h1>
<p align="center">数据驱动的快速配置简历</p

一个基于 Next.js 的现代化简历展示项目，采用数据驱动的设计理念，让您可以通过简单修改 JSON 配置文件来快速定制个人简历。

## ✨ 项目特性

- 🚀 **基于 Next.js 14** - 使用最新的 React 框架，支持 SSR 和 SSG
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **Tailwind CSS** - 现代化的 CSS 框架，快速构建美观界面
- 📊 **数据驱动** - 通过修改 JSON 文件即可更新简历内容
- 🔧 **TypeScript 支持** - 完整的类型安全保障
- 📦 **模块化组件** - 高度可复用的组件架构
- ⚡ **快速部署** - 支持 Vercel、Netlify 等平台一键部署

## 🛠️ 技术栈

- **前端框架**: Next.js 14
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS
- **包管理器**: pnpm
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
jackson-resumes/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 全局布局
│   └── page.tsx           # 主页面
├── components/            # 组件目录
│   ├── Header/           # 头部信息组件
│   │   ├── data.json     # 个人基本信息数据
│   │   └── index.tsx     # 组件实现
│   ├── Education/        # 教育经历组件
│   │   ├── data.json     # 教育信息数据
│   │   └── index.tsx     # 组件实现
│   ├── Skills/           # 专业技能组件
│   │   ├── data.json     # 技能列表数据
│   │   └── index.tsx     # 组件实现
│   └── Projects/         # 项目经历组件
│       ├── data.json     # 项目信息数据
│       └── index.tsx     # 组件实现
├── styles/               # 样式文件
│   └── globals.css       # 全局样式
├── public/               # 静态资源
└── utils/                # 工具函数
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- pnpm 8.0 或更高版本

### 安装依赖

```bash
# 克隆项目
git clone <your-repo-url>
cd jackson-resumes

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 📝 自定义简历内容

### 1. 个人信息配置

编辑 `components/Header/data.json`：

```json
{
  "name": "您的姓名",
  "contact": {
    "phone": "您的电话",
    "email": "您的邮箱",
    "wechat": "您的微信",
    "age": "您的年龄",
    "github": {
      "text": "GitHub用户名",
      "url": "GitHub链接"
    },
    "homepage": {
      "text": "个人主页",
      "url": "主页链接"
    }
  },
  "jobInfo": {
    "position": "目标岗位",
    "duration": "可工作时间",
    "availability": "到岗时间"
  }
}
```

### 2. 教育经历配置

编辑 `components/Education/data.json`：

```json
{
  "title": "教育经历",
  "school": "学校名称",
  "period": "就读时间",
  "details": "专业信息"
}
```

### 3. 专业技能配置

编辑 `components/Skills/data.json`：

```json
{
  "title": "专业技能",
  "items": [
    "技能描述1（支持HTML标签）",
    "技能描述2",
    "技能描述3"
  ]
}
```

### 4. 项目经历配置

编辑 `components/Projects/data.json`：

```json
{
  "title": "项目经历",
  "items": [
    {
      "name": "项目名称",
      "github": "GitHub链接",
      "demo": "演示链接",
      "techStack": "技术栈",
      "features": [
        "项目特性1",
        "项目特性2"
      ]
    }
  ]
}
```

## 🎨 样式自定义

项目使用 Tailwind CSS，您可以：

1. 修改 `styles/globals.css` 调整全局样式
2. 在组件中直接使用 Tailwind 类名
3. 通过 `tailwind.config.js` 自定义主题

## 📦 部署指南

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

### 其他平台

- **Netlify**: 支持拖拽部署
- **GitHub Pages**: 需要配置静态导出
- **自建服务器**: 使用 `pnpm build && pnpm start`

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
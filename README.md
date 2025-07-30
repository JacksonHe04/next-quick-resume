<h1 align="center">🚀 Next Quick Resume</h1>
<p align="center">现代化的数据驱动简历生成器</p>

一个基于 Next.js 15 的现代化简历展示项目，采用数据驱动的设计理念，支持在线编辑、本地存储和多版本管理。通过直观的可视化界面，您可以轻松创建、编辑和管理个人简历。

## ✨ 核心特性

### 🎯 简历管理
- 📝 **可视化编辑器** - 内置简历编辑器，支持实时预览
- 💾 **本地存储** - 基于 IndexedDB 的本地数据存储
- 📁 **多版本管理** - 支持创建和管理多个简历版本
- 🔄 **数据同步** - JSON 文件与数据库双向同步
- 📤 **导入导出** - 支持简历数据的导入和导出

### 🛠️ 技术特性
- 🚀 **Next.js 15** - 最新的 React 框架，支持 App Router
- ⚡ **React 19** - 使用最新的 React 特性
- 🎨 **Tailwind CSS 4** - 现代化的原子化 CSS 框架
- 🔧 **TypeScript** - 完整的类型安全保障
- 📦 **模块化架构** - 高度可复用的组件设计
- 🎯 **响应式设计** - 完美适配桌面端和移动端

### 🏗️ 架构特性
- 🧩 **组件化设计** - 每个简历模块独立组件
- 🎨 **统一样式系统** - 通过常量管理样式，确保一致性
- 🔗 **自定义 Hooks** - 业务逻辑与 UI 分离
- 📊 **数据驱动** - 通过 JSON 配置快速定制内容

## 🛠️ 技术栈

- **前端框架**: Next.js 15.3.4
- **UI 库**: React 19.0.0
- **开发语言**: TypeScript 5+
- **样式框架**: Tailwind CSS 4
- **数据存储**: IndexedDB
- **包管理器**: pnpm
- **代码规范**: ESLint 9 + TypeScript ESLint

## 📁 项目结构

```
next-quick-resume/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── data-files/    # 数据文件 API
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 主页面
│   └── favicon.ico        # 网站图标
├── components/            # 组件目录
│   ├── Header/           # 头部信息组件
│   ├── Education/        # 教育经历组件
│   ├── Skills/           # 专业技能组件
│   ├── Projects/         # 项目经历组件
│   ├── About/            # 关于我组件
│   ├── ResumeManager/    # 简历管理组件
│   │   ├── components/   # 子组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   └── index.tsx     # 主组件
│   ├── common/           # 通用组件
│   │   ├── Link.tsx      # 链接组件
│   │   ├── SectionContainer.tsx  # 节容器
│   │   └── SectionTitle.tsx     # 节标题
│   └── ui/               # UI 组件库
│       └── Button/       # 按钮组件
├── config/               # 配置文件
│   └── data.ts           # 数据配置
├── constants/            # 常量定义
│   └── styles.ts         # 样式常量
├── data/                 # 简历数据
│   ├── resume.json       # 中文简历数据
│   ├── resume-en.json    # 英文简历数据
│   └── resume-template.json  # 简历模板
├── types/                # 类型定义
│   └── index.ts          # 全局类型
├── utils/                # 工具函数
│   ├── indexedDB.ts      # IndexedDB 工具
│   └── cn.ts             # 类名合并工具
├── styles/               # 样式文件
│   └── globals.css       # 全局样式
└── docs/                 # 项目文档
    ├── COMPREHENSIVE_REFACTOR_REPORT.md
    ├── OPTIMIZATION_GUIDE.md
    └── REFACTOR_COMPLETE_REPORT.md
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- pnpm 8.0 或更高版本（推荐）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/JacksonHe04/next-quick-resume.git
cd next-quick-resume

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

# 代码检查
pnpm lint

# 类型检查和代码检查
pnpm check
```

## 📝 使用指南

### 🎯 简历管理功能

项目提供了两种管理简历数据的方式：

#### 1. 可视化简历管理器

点击页面右上角的「简历管理」按钮，可以：

- 📝 **在线编辑**：使用内置编辑器修改简历内容
- 💾 **本地存储**：简历数据自动保存到浏览器 IndexedDB
- 📁 **版本管理**：创建和管理多个简历版本
- 📤 **导入导出**：支持 JSON 格式的数据导入导出
- 🔄 **模板复制**：基于现有简历创建新版本

#### 2. JSON 文件配置

直接编辑 `./data/` 目录下的 JSON 文件：

```json
// ./data/resume.json
{
  "header": {
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
  },
  "about": {
    "title": "关于我",
    "content": "个人简介内容"
  },
  "education": {
    "title": "教育经历",
    "school": "学校名称",
    "period": "就读时间",
    "details": "专业信息"
  },
  "skills": {
    "title": "专业技能",
    "items": [
      "技能描述1",
      "技能描述2"
    ]
  },
  "projects": {
    "title": "项目经历",
    "items": [
      {
        "name": "项目名称",
        "github": "GitHub链接",
        "demo": "演示链接",
        "techStack": "技术栈",
        "description": "项目描述",
        "features": ["功能1", "功能2"],
        "show": true
      }
    ]
  }
}
```

### 🔄 切换简历版本

#### 方法一：修改配置文件

编辑 `./config/data.ts` 文件：

```typescript
// 切换到不同的简历文件
export const RESUME_DATA_PATH = './data/resume.json'        // 中文简历
// export const RESUME_DATA_PATH = './data/resume-en.json'  // 英文简历
```

#### 方法二：使用简历管理器

1. 点击「简历管理」按钮
2. 在「文件记录」标签页查看所有 JSON 文件
3. 点击「使用此简历」切换到对应版本

### 📊 数据结构说明

项目采用统一的数据结构，所有简历数据都遵循 `ResumeData` 接口定义。详细的类型定义请参考 `./types/index.ts` 文件。

## 🎨 样式自定义

### 统一样式系统

项目使用统一的样式常量系统，位于 `./constants/styles.ts`：

```typescript
// 修改标题样式
export const TITLE_STYLES = {
  main: 'text-4xl font-bold m-0',
  section: 'text-xl font-bold text-black py-1 mb-2 border-b border-black'
}

// 修改容器样式
export const CONTAINER_STYLES = {
  section: 'mb-4',
  project: 'mb-3'
}
```

### Tailwind CSS 配置

1. 修改 `./styles/globals.css` 调整全局样式
2. 在组件中直接使用 Tailwind 类名
3. 通过 `./app/layout.tsx` 中的 Tailwind 配置自定义主题

## 🏗️ 开发指南

### 组件开发

项目采用模块化组件设计，每个简历模块都是独立的组件：

```typescript
// 创建新的简历模块组件
import { getCurrentResumeData } from '@/config/data'
import { SectionContainer, SectionTitle } from '@/components/common'

export default function YourSection() {
  const data = getCurrentResumeData().yourSection
  
  return (
    <SectionContainer>
      <SectionTitle>{data.title}</SectionTitle>
      {/* 组件内容 */}
    </SectionContainer>
  )
}
```

### 自定义 Hooks

项目提供了多个自定义 Hooks，位于 `./components/ResumeManager/hooks/`：

- `useResumeData`: IndexedDB 数据管理
- `useFileRecords`: 文件记录管理  
- `useResumeEditor`: 编辑状态管理

### 样式开发

使用统一的样式常量系统：

```typescript
import { TITLE_STYLES, CONTAINER_STYLES } from '@/constants/styles'

// 在组件中使用
<h2 className={TITLE_STYLES.section}>标题</h2>
<div className={CONTAINER_STYLES.section}>内容</div>
```

## 📦 部署指南

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

### 其他平台

- **Netlify**: 支持拖拽部署
- **GitHub Pages**: 需要配置静态导出
- **自建服务器**: 使用 `pnpm build && pnpm start`

### 环境变量

项目无需额外的环境变量配置，开箱即用。

## 🔧 故障排除

### 常见问题

1. **简历数据不显示**
   - 检查 `./data/resume.json` 文件格式是否正确
   - 确认 `./config/data.ts` 中的路径配置

2. **IndexedDB 数据丢失**
   - 浏览器隐私模式下数据不会持久化
   - 清除浏览器数据会删除 IndexedDB 内容

3. **样式显示异常**
   - 确认 Tailwind CSS 正确加载
   - 检查 `./styles/globals.css` 文件

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 配置规范
- 为新功能添加适当的注释
- 保持组件的单一职责原则

## 📚 相关文档

- [重构完成报告](./REFACTOR_COMPLETION_REPORT.md)
- [优化使用指南](./docs/OPTIMIZATION_GUIDE.md)
- [全面重构分析](./docs/COMPREHENSIVE_REFACTOR_REPORT.md)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - 本地数据存储

---

<p align="center">
  <strong>作者：JacksonHe04</strong><br>
</p>
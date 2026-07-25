<h1 align="center">SAYLESS</h1>
<p align="center">把简历、投递、面试和复盘放在一条清晰的求职路径上。</p>

SAYLESS 是一个面向求职全流程的管理工具。它将简历、岗位投递、选拔轮次、面试安排与面试题库集中到同一条路径中，帮助你持续记录进展，并把注意力放在下一步。

线上地址：[sayless.inon.space](https://sayless.inon.space)

## 核心功能

- **求职批次**：按用户自己的时间阶段组织投递分组，记录策略、时间范围与归档状态。
- **简历管理**：维护结构化简历及展示配置，并通过克隆快速创建新版本。
- **投递追踪**：记录公司、职位、JD、渠道、地点、投递时间和当前状态。
- **面试管理**：管理每一轮选拔的阶段、时间、时长、会议链接与复盘笔记。
- **面试题库**：使用 Markdown 沉淀问题与答案，并将题目关联到具体面试。
- **公司与职位目录**：同时使用官方目录和个人私有目录，减少重复录入。
- **数据概览**：集中查看投递统计、阶段转化、近期安排与当前求职批次。
- **账户系统**：支持邮箱验证码注册、登录、密码重置、资料修改与账户注销。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| Web | Next.js 16、React 19、TypeScript 6 |
| UI | Tailwind CSS 4、shadcn、Radix UI、Lucide React、Recharts |
| 表单与状态 | React Hook Form、Zod、TanStack Query、nuqs |
| 数据库 | Cloudflare D1、Drizzle ORM |
| 邮件 | Resend |
| 测试 | Vitest、Testing Library、Playwright |
| 基础设施 | Cloudflare Workers、Wrangler |

## 系统架构

Next.js 应用通过带 Bearer Token 鉴权的 Cloudflare Worker 网关访问 D1：

```text
Browser
   │
   ▼
Next.js App Router
   │  D1_GATEWAY_URL + D1_GATEWAY_TOKEN
   ▼
Cloudflare Worker (workers/d1-gateway.ts)
   │
   ▼
Cloudflare D1
```

应用不会在浏览器中直接访问数据库。所有产品页面均可公开体验，创建、修改和删除数据时才要求登录；认证、业务规则和数据访问均在服务端完成。注册验证码与密码重置邮件由 Resend 发送。

## 快速开始

### 环境要求

- Node.js 24.14.0（项目通过 `.nvmrc` 固定；最低支持 22.12.0）
- pnpm 9.12.0

如果使用 nvm：

```bash
nvm use
corepack enable
```

### 1. 克隆并安装依赖

```bash
git clone https://github.com/JacksonHe04/sayless.git
cd sayless
pnpm install
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

填写以下变量：

| 变量 | 用途 |
| --- | --- |
| `RESEND_API_KEY` | Resend API Key，用于发送注册验证码和密码重置邮件 |
| `RESEND_FROM_EMAIL` | Resend 已验证的发件地址 |
| `SESSION_SECRET` | 会话签名密钥，请使用足够长的随机值 |
| `D1_GATEWAY_URL` | D1 网关地址；本地默认使用 `http://127.0.0.1:8787` |
| `D1_GATEWAY_TOKEN` | Next.js 应用访问 D1 网关的 Bearer Token |
| `SAYLESS_DEV_LOGIN_EMAIL` | 可选；仅开发环境使用的快捷登录邮箱 |
| `SAYLESS_DEV_LOGIN_PASSWORD` | 可选；仅服务端读取的开发快捷登录密码 |

本地 Worker 从 `.dev.vars` 读取同一个 `D1_GATEWAY_TOKEN`。该值必须与 `.env.local` 中的值一致：

```dotenv
D1_GATEWAY_TOKEN=replace-with-a-local-secret
```

> `.env.local` 与 `.dev.vars` 均不会提交到 Git。不要在仓库中保存真实密钥。

如果同时配置两个 `SAYLESS_DEV_LOGIN_*` 变量，开发环境访问
`/login` 时会自动创建该账号的本地会话。快捷登录接口在
Production 构建中始终关闭，密码不会发送到浏览器。建议将个人配置
放在优先级更高且同样被忽略的 `.env.development.local` 中。

### 3. 初始化本地 D1

```bash
pnpm db:seed:local
```

该命令会应用本地迁移、导入官方目录，并创建演示账户。默认凭据为：

```text
邮箱：demo@local.sayless.app
密码：sayless-demo-2026
```

如需自定义，可在执行命令时设置 `SAYLESS_DEMO_EMAIL` 和 `SAYLESS_DEMO_PASSWORD`。

### 4. 启动开发环境

需要同时运行 D1 网关和 Next.js 应用：

```bash
# 终端 1：Cloudflare Worker / D1 网关
pnpm dev:worker

# 终端 2：Next.js
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Next.js 开发服务器 |
| `pnpm dev:worker` | 在 `8787` 端口启动本地 D1 网关 |
| `pnpm build` | 构建 Next.js 应用 |
| `pnpm build:worker` | dry-run 构建 Cloudflare Worker |
| `pnpm start` | 启动 Next.js 生产服务器 |
| `pnpm db:generate` | 根据 Drizzle Schema 生成迁移 |
| `pnpm db:migrate:local` | 将迁移应用到本地 D1 |
| `pnpm db:seed:local` | 迁移并填充本地 D1 |
| `pnpm lint` | 运行 ESLint |
| `pnpm typecheck` | 运行 TypeScript 类型检查 |
| `pnpm check` | 依次运行 lint 与类型检查 |
| `pnpm test` | 运行 Vitest 测试 |
| `pnpm test:watch` | 以监听模式运行 Vitest |
| `pnpm e2e` | 准备本地数据并运行 Playwright E2E 测试 |
| `pnpm e2e:production` | 对 `BASE_URL` 指向的环境运行生产冒烟测试 |
| `pnpm cf-typegen` | 生成 Cloudflare 环境类型 |
| `pnpm deploy:worker` | 部署 D1 网关 Worker |

运行生产冒烟测试时需要指定目标地址：

```bash
BASE_URL=https://example.com pnpm e2e:production
```

## 项目结构

```text
sayless/
├── app/
│   ├── (marketing)/        # 落地页
│   ├── (auth)/             # 登录、注册与密码重置
│   ├── (app)/app/          # 公开可读、写操作需登录的产品页面
│   └── api/                # REST API 路由
├── components/             # 业务组件、应用外壳与基础 UI
├── db/
│   ├── schema/             # Drizzle 数据模型
│   └── seed/               # 官方目录与演示数据
├── drizzle/                # D1 SQL 迁移
├── e2e/                    # Playwright 端到端测试
├── lib/                    # Markdown、HTTP 等通用能力
├── modules/                # 按领域划分的 service、repository 与 schema
├── styles/                 # 全局样式
├── tests/                  # Vitest 测试
└── workers/
    └── d1-gateway.ts       # Cloudflare D1 HTTP 网关
```

## 数据库与 Worker

### 生成迁移

修改 `db/schema/` 后运行：

```bash
pnpm db:generate
```

生成的 SQL 会写入 `drizzle/`，应随代码一起审查。

### 部署 D1 网关

`wrangler.jsonc` 中配置了 Worker、D1 binding 和迁移目录。部署前请先在 Cloudflare 中安全配置 `D1_GATEWAY_TOKEN`，然后执行：

```bash
pnpm deploy:worker
```

Next.js 运行环境中的 `D1_GATEWAY_URL` 应指向部署后的 Worker 地址，并使用相同的 `D1_GATEWAY_TOKEN`。

## 质量检查

提交变更前建议至少运行：

```bash
pnpm check
pnpm test
pnpm build
pnpm build:worker
```

涉及关键用户流程时，再运行：

```bash
pnpm e2e
```

---

<p align="center">
  <strong>把复杂留给系统，把注意力留给下一步。</strong>
</p>

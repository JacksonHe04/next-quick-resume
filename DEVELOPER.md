# SAYLESS 开发指南

本文档面向 SAYLESS 的开发者与维护者，记录当前仓库的实现边界、运行方式和基础设施约束。产品定位与用户能力请先阅读 [README.md](./README.md)。

## 当前实现

SAYLESS 当前围绕个人求职流程实现以下模块：

- **Auth / Account**：邮箱验证码注册、邮箱密码登录、密码重置、资料修改与账户注销。
- **Dashboard**：当前 Batch、投递指标、阶段转化与近期面试。
- **Batches**：创建、编辑、归档求职批次，并设置唯一的 `currentBatchId`。
- **Resumes**：创建、克隆、编辑结构化简历内容和展示配置。
- **Submissions**：记录公司、职位、JD、渠道、地点、投递时间和当前状态。
- **Interviews**：维护 submission 下的选拔轮次、时间安排、结果与复盘。
- **Questions**：独立维护 Markdown 问答，并关联至具体面试。
- **Catalog**：浏览公共公司与职位目录，并维护用户私有记录。

业务数据以 `userId` 归属于单个用户。公共目录可供所有用户读取，用户创建的实体仅对本人可见。面试状态更新会通过领域服务推进对应 submission 的 `directStatus` 和 `statusSource`；相关规则集中在 `modules/interviews/status.ts` 与 `modules/submissions/status.ts`，不要在 UI 中复制状态推导逻辑。

## 系统架构

Next.js 应用部署在 Vercel。Cloudflare 只承担 D1 数据库和带 Bearer Token 鉴权的 Worker 网关；邮件通过 Resend 发送。

```text
Browser
   │
   ▼
Next.js App Router (Vercel)
   │
   ├── Authentication, domain services and REST endpoints
   │
   ├── RESEND_API_KEY ──────────────► Resend
   │
   └── D1_GATEWAY_URL
       + D1_GATEWAY_TOKEN
                    │
                    ▼
       Cloudflare Worker: sayless-api
                    │
                    ▼
            Cloudflare D1
```

浏览器不会持有 D1 gateway token，也不会直接访问数据库。Next.js 服务端通过 `db/remote-d1-binding.ts` 调用 Worker；Worker 在 `workers/d1-gateway.ts` 中验证 Bearer Token 后访问 D1 binding。

Cloudflare 环境保持单一：本地开发与线上 Next.js 默认连接同一个已部署的 Worker 和 Production D1。Playwright E2E 是例外，它通过 Wrangler 使用隔离的本地 D1，并在执行前迁移和填充测试数据。

## 环境要求

- Node.js 24.x（仓库通过 `.nvmrc` 固定版本）
- pnpm 9.12.0

使用 nvm 时：

```bash
nvm use
corepack enable
```

## 本地开发

### 1. 克隆并安装依赖

```bash
git clone https://github.com/JacksonHe04/sayless.git
cd sayless
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

| 变量 | 是否必需 | 用途 |
| --- | --- | --- |
| `RESEND_API_KEY` | 是 | Resend API Key，用于注册验证码和密码重置邮件 |
| `RESEND_FROM_EMAIL` | 是 | Resend 已验证的发件地址 |
| `SESSION_SECRET` | 是 | 服务端会话签名密钥，应使用足够长的随机值 |
| `D1_GATEWAY_URL` | 是 | 已部署的 `sayless-api` Worker 地址 |
| `D1_GATEWAY_TOKEN` | 是 | Next.js 服务端访问 Worker 的 Bearer Token |
| `SAYLESS_DEV_LOGIN_EMAIL` | 否 | development 环境自动创建会话的邮箱 |
| `SAYLESS_DEV_LOGIN_PASSWORD` | 否 | development 环境自动创建会话的密码，仅服务端读取 |

只有两个 `SAYLESS_DEV_LOGIN_*` 变量同时存在时，开发快捷登录才会启用。该能力在 Production 构建中始终关闭，密码不会发送到浏览器。

`.env.local` 仅用于本地 Next.js。不要提交 `.env.local`、`.dev.vars`、真实 API Key、session secret 或 gateway token。

### 3. 启动应用

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。本地无需同时启动 Cloudflare Worker；应用会通过 HTTPS 连接 `D1_GATEWAY_URL` 指向的已部署 Worker。

## 代码结构

```text
sayless/
├── app/
│   ├── (marketing)/        # 落地页
│   ├── (auth)/             # 登录、注册和密码重置
│   ├── (app)/app/          # 主要产品页面
│   └── api/                # REST API 路由
├── components/
│   ├── app/                # 应用外壳、导航和通用工作区
│   ├── ui/                 # 可复用 UI 基础组件
│   └── <domain>/           # 各领域的交互组件
├── modules/<domain>/       # schema、action、service、repository 与领域规则
├── db/
│   ├── schema/             # Drizzle 数据模型
│   └── seed/               # 公共目录、演示和本地测试数据
├── drizzle/                # 版本化 D1 SQL migrations
├── workers/d1-gateway.ts   # Cloudflare D1 HTTP 网关
├── tests/                  # Vitest 与 Testing Library 测试
└── e2e/                    # Playwright 用户流程与生产冒烟测试
```

### 分层约定

- `app/` 负责路由、Server Component 数据读取和 API 入口。
- `components/` 负责界面与交互，不直接实现数据库规则。
- `modules/*/schemas.ts` 定义输入校验，`actions.ts` 连接界面与服务端能力。
- `modules/*/service.ts` 承载业务规则，`repository.ts` 负责数据访问。
- `db/schema/` 是数据库结构的唯一事实来源；结构变化通过 Drizzle migration 落地。
- 公共交互模式优先复用 `components/ui/` 和 `components/app/`，避免在领域组件中复制实现。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Next.js 开发服务器 |
| `pnpm build` | 构建 Next.js 应用 |
| `pnpm start` | 启动生产模式 Next.js 服务器 |
| `pnpm lint` | 运行 ESLint |
| `pnpm typecheck` | 运行 TypeScript 类型检查 |
| `pnpm check` | 依次运行 lint 与类型检查 |
| `pnpm test` | 运行 Vitest 测试 |
| `pnpm test:watch` | 以监听模式运行 Vitest |
| `pnpm db:generate` | 根据 Drizzle schema 生成 migration |
| `pnpm db:migrate:local` | 将 migrations 应用到 Wrangler 本地 D1 |
| `pnpm db:seed:local` | 迁移并填充本地 E2E D1 |
| `pnpm e2e:worker` | 在 8787 端口启动本地 Worker |
| `pnpm e2e:prepare` | 准备 Playwright 所需的隔离数据 |
| `pnpm e2e` | 准备数据并运行 Playwright E2E |
| `pnpm e2e:production` | 对 `BASE_URL` 运行 Chromium 生产冒烟测试 |
| `pnpm build:worker` | dry-run 构建 Cloudflare Worker |
| `pnpm deploy:worker` | 部署 Cloudflare Worker |
| `pnpm cf-typegen` | 生成 Cloudflare 环境类型 |

## 数据库与 Worker

### 修改数据库结构

1. 修改 `db/schema/` 中对应领域的 schema。
2. 生成 migration：

```bash
pnpm db:generate
```

3. 审查 `drizzle/` 中新生成的 SQL 和 metadata。
4. 用隔离的本地 D1 验证 migration：

```bash
pnpm db:seed:local
```

不要直接修改线上 D1 来代替 migration。migration 应与依赖它的代码一起提交和审查。

### Worker 配置

`wrangler.jsonc` 当前配置：

- Worker：`sayless-api`
- 入口：`workers/d1-gateway.ts`
- D1 binding：`DB`
- D1 database：`sayless-production`
- migration 目录：`drizzle`

部署前，在 Cloudflare 中将 `D1_GATEWAY_TOKEN` 配置为 Worker secret；Next.js 运行环境必须使用相同 token，并将 `D1_GATEWAY_URL` 指向部署后的 Worker。

```bash
pnpm build:worker
pnpm deploy:worker
```

`build:worker` 只执行 dry run，不会发布；`deploy:worker` 会更新实际 Worker。

## 测试与验收

### 常规验证

```bash
pnpm check
pnpm test
pnpm build
pnpm build:worker
```

- `check` 覆盖 lint 和 TypeScript。
- `test` 覆盖 service、repository、领域状态、组件、HTTP、安全和 Worker 行为。
- `build` 验证 Next.js production 构建。
- `build:worker` 验证 Worker bundle 和 Cloudflare 配置。

### 用户流程

涉及认证、账户注销、求职全流程、移动端或简历工作区时运行：

```bash
pnpm e2e
```

该命令会先迁移并填充 Wrangler 本地 D1，再运行 Playwright，避免修改 Production 数据。

### 生产冒烟

```bash
BASE_URL=https://sayless.inon.space pnpm e2e:production
```

生产冒烟测试用于验证已部署环境的关键只读和受控流程，不替代本地完整 E2E。

## 工程与安全约束

- Next.js 部署到 Vercel；Cloudflare 仅承担 D1 与 Worker 网关。
- Cloudflare 业务环境唯一，不维护独立 Preview 数据库。
- 所有用户私有查询和写操作必须验证当前 `userId`，不能只依赖客户端过滤。
- 浏览器不能获得 `D1_GATEWAY_TOKEN`、`SESSION_SECRET` 或 Resend API Key。
- 不提交 `.env.local`、`.dev.vars`、真实密钥、个人导入数据或一次性过程脚本。
- 不加入付费、团队协作、外部平台导入或 LLM 能力，除非产品边界先明确变更。
- 修改相似界面或业务规则时优先抽取复用，确保一处修改能够全局生效。

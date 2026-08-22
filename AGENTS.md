# SAYLESS — AGENTS.md

> 本文档基于 `native/26-07-25.md` 的全量对话留痕

SAYLESS 是一个**面向个人求职者的全链路管理工具**：把简历、求职批次、投递、面试轮次、面试题库沉淀到同一条路径上。它最早是「简历项目」，现在彻底转型为「求职项目」。简历只是其中一个功能模块。

| 维度 | 决定 |
| --- | --- |
| 用户范围 | **所有求职方式类似的个人求职者**：大学生、互联网、营销、商科等需要经过「简历 → 投递 → 面试 → Offer」全流程的人群 |
| 协作模型 | **纯个人空间**，不需要多人协作、团队空间、共享工作区 |
| 商业模式 | **完全免费**。不接入付费墙、不做配额、不区分等级 |
| 数据导入 | **不提供 Notion 或任何外部平台的导入**。但是为了我个人使用，需要把我个人的 Notion 数据导进去 |
| AI 能力 | **不做**。不调用任何 LLM、不提供"AI 建议面试答案""AI 润色简历"之类的能力 |
| 公开性 | **公开 SaaS 优先**，不是 demo，不是单机工具。任何注册用户都能立即使用全功能 |
| 部署形态 | Next.js 部署到 Vercel；Cloudflare 仅承担 D1 数据库与 Workers 网关；**环境单一，不区分 Preview/Production** |

SAYLESS 围绕以下实体构建，所有实体都以 `userId`（文本主键）严格归属于一个用户。

### 鉴权

- 注册：Resend + 邮箱 + 验证码
- 登录：邮箱 + 密码

### Batches

- 用户**自定义**的分组概念，不是"秋招 / 春招"等固定词。
- **批次不限制用户在任何页面上的可见范围**。它只是对 submission 的分组，不会让其他模块出现"按批次筛选"的视觉差异。
- 用户**可以拥有多个** Batch，但**只能选一个**作为 `currentBatchId`，用来标识自己目前处在哪一段求职节奏中。

### Resumes

延续既有简历模块的功能，但页面样式**必须统一到 SAYLESS 整体设计风格**。

- **访客（未登录）**：允许基于「新建简历」模板编辑并实时保存。首次访问时由根目录 `proxy.ts` 下发 `sayless_anon`（HttpOnly UUID，一年期）；访客简历落库时 `userId` 保持 `DEMO_USER_ID`（外键安全），同时记录 `guest_device_id` = 该 UUID 做**设备级隔离**。
- 同一浏览器（同一 `sayless_anon`）再次访问 `/resumes` 会自动找回最近编辑的那一份继续编辑；不同设备 / 浏览器之间互不可见；登录用户只读取 `guest_device_id IS NULL` 的行，绝不接触任何访客数据。
- 匿名 UUID 是 122 bit 的 bearer token，服务端只接受严格 UUID 格式（见 `modules/auth/anon-id.ts`）；设备 id 不属于鉴权凭据，仅用于访客数据的水平隔离。

### Submissions

- `submissions` 是核心流转实体，承载一条"我已经把简历投给 X 公司 Y 职位"的完整痕迹。
- **不做"待投递"概念**，只记录"我已投递"的事实。

### Interviews

- `interviews` 是 submission 下挂的轮次记录。
- **更新 `interviews.status` 时必须自动推进对应 submission 的 `directStatus` 与 `statusSource`**：

### Questions

- 问题既可以**提前独立维护**，不绑定任何面试；也可以**反向关联到具体面试**。
- 一份答案在多次面试中被引用，是正常的，**不强制做合并**。
- 答案的更新由用户**就地迭代**，保留历史版本不是这个模块的职责。

## 信息架构与导航

侧栏（左侧）顺序**自上而下**固定为：

1. **SAYLESS**（总览 dashboard）
2. **简历**（Resumes）
3. **投递**（Submissions）
4. **面试**（Interviews）
5. **题库**（Questions）
6. **公司**（Companies）
7. **批次**（Batches）

侧栏底部是个人区域：账号设置 / 登录态信息。

### 首页（SAYLESS）

首页要承担"看一眼就知道下一步做什么"的角色，至少包含：

- **数据概览**：投递总数、按阶段分布、活跃 / 归档批次、近期面试数量——可使用图表（Recharts）。
- **下一场面试提醒 ×3**：未来最近的 3 场面试，按时间升序展示。无面试时显示空态引导。
- 顶部要展示**当前激活的 `currentBatchId`**——让用户知道当前处于哪一个策略节奏。

## 视觉与品牌

**Vercel 官网是 SAYLESS 的视觉范本**，直接照抄成熟样式体系：

- 当前对照站点：`vercel.com/yingyingdontkill`（用户已打开）
- 风格关键词：克制、留白、灰阶 + 中性色强调、几何精准、强排版层级
- 组件库：shadcn（**始终使用项目内已安装的最新版本**），通过 Radix UI 沉淀交互基础
- 图标：lucide-react
- 动效：framer-motion，按需少量使用，避免无意义动画

### 配色

- **主色：绿色系**。绿色作为强调色承担操作、品牌、双状态反馈。
- 避免选择：荧光绿、屎绿色、纯黑色侧边栏。
- 侧边栏**不使用纯黑背景**，用浅灰 / 白色 + 微边框代替，配合整体明亮与克制的视觉调性。
- 中性灰阶承担层级、品牌橙黄红仅在系统状态（成功 / 警告 / 危险）出现，且低饱和。

### 排版

- 字体选择中性、清晰、无衬线为主；**避免花哨或过于风格化的英文字体**。
- 中文优先使用系统默认中文栈或项目内置字体；不要引入新装饰字体。
- 字号阶梯：12 / 14 / 16 / 20 / 24 / 30，每级之间的对比要明确。

### 品牌资产

- Brand name：**SAYLESS**
- 域名：`sayless.inon.space`
- 写 README、邮件、营销文案时，务必使用这个 brand 名而不是 `say less` 或其它拆写。

---

## 技术栈与工程约束

> 来自 `~/Codes/CLAUDE.md` 的项目级技术栈**已经统一**，本项目必须严格遵循，如需要也可引入其他依赖

| 层级 | 选型 |
| --- | --- |
| Web 框架 | Next.js 16.2.10（App Router） |
| UI 库 | React 19.2.7、TypeScript 6.0.3 |
| 样式 | Tailwind CSS 4.3.2 |
| 组件 | shadcn 4.12.0（最新版本）、Radix UI |
| 图标 | lucide-react 1.22.0 |
| 动效 | framer-motion 12.42.2 |
| 状态 | zustand 5.0.14 |
| 数据获取 | @tanstack/react-query 5.101.2 |
| 表单 | react-hook-form 7.80.0 + zod 3.23.8 |
| 主题 | next-themes 0.4.6 |
| URL 状态 | nuqs 2.8.9 |
| 类名合并 | clsx 2.1.1 + tailwind-merge 3.6.0 |
| 数据库 | Cloudflare D1 + Drizzle ORM |
| 邮件 | Resend |
| 测试 | Vitest + Testing Library + Playwright |
| 基础设施 | Cloudflare Workers（仅 D1 网关 + 邮件代理）、Wrangler |
| 部署 | Vercel（Next.js），单一环境 |

### 工程硬约束

- **Next.js + Vercel** 部署 Next.js 应用；Cloudflare 仅承担 D1 + Workers。
- **Cloudflare 环境唯一**：不区分 Preview / Production，本地 `.dev.vars` 与生产 Worker 共享同一套 token 协议。
- `.env.local`、`.dev.vars`、`.superpowers/` 一律不提交。
- 不向仓库提交任何真实密钥、Resend API key、session secret。

## 文档与留痕

- 所有过程中的设计、规划、开发方案、报告、验收、测试结果等文档，放在 `~/.agents/docs/` 下以子目录 `YYMMDD/`（如 `260725`）组织。
- `native/` 是用户最原始的输入，永远保留真实记录，**不允许 AI 主动编辑**。
- README 反映**用户视角**（做什么、怎么用），AGENTS.md 反映**实现视角**（为什么这么做、绝对边界是什么），二者并存。

## 终极验收口径

一个新加入的 SAYLESS 用户，应当能够：

1. 用邮箱 + 验证码注册，进入 dashboard，看到未来 3 场面试卡片和数据概览。
2. 在简历模块创建 / 克隆 / 编辑简历，完全不与投递耦合。
3. 切到投递模块，从官方或私有公司 / 职位库里挑选一条记录，创建一个新的 submission，自动落到某个 batch 内。
4. 在该 submission 下追加一场面试（必须从官方阶段里选），并以两种方式推进 status：手动直接更新，或通过面试 status 自动推进。
5. 在题库模块创建一条问题并反复打磨它的标准答案；在某场面试详情里关联若干条问题。
6. 切到公司模块浏览官方池，确认自己的自定义实体只对自己可见。
7. 在批次模块创建 / 归档 batch，并把任意一个设为 currentBatchId，回到 dashboard 时看到当前节奏已切换。

无需再需要我审阅与批准或决策，请持续 go on。

直到完成整个 Sayless 彻底的完整项目闭环，包括功能的完整实现、测试与验收，也包括与 Cloudflare 的对接，甚至也包括数据的导入。我通过 Codes/okf-anything 在本地的 iNon/Wiki 中拉下了几乎所有的 Notion 文档，所以 Notion 文档是非常本地可读的。

过程中要阶段性的执行 Git commit skill，方便留痕和回滚。记得不要把 personal 信息与过程性质的文档与脚本提交。
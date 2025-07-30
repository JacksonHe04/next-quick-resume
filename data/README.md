# 简历数据管理

这个目录包含了所有的简历数据文件。通过配置文件可以轻松切换不同的简历版本。

## 文件结构

```
data/
├── README.md          # 本说明文件
├── resume.json        # 中文简历数据（默认）
└── resume-en.json     # 英文简历数据（示例）
```

## 如何切换简历数据

1. **修改配置文件**：编辑 `/config/data.ts` 文件中的 `RESUME_DATA_PATH` 常量

```typescript
// 使用中文简历（默认）
export const RESUME_DATA_PATH = '@/data/resume.json'

// 切换到英文简历
// export const RESUME_DATA_PATH = '@/data/resume-en.json'

// 切换到实习版简历
// export const RESUME_DATA_PATH = '@/data/resume-internship.json'
```

2. **重启开发服务器**：修改配置后需要重启 `npm run dev` 以使更改生效

## 创建新的简历版本

1. 在 `data/` 目录下创建新的 JSON 文件，例如 `resume-internship.json`
2. 复制现有简历数据结构并修改内容
3. 在 `/config/data.ts` 中更新 `RESUME_DATA_PATH` 指向新文件
4. 重启开发服务器

## 数据结构

所有简历数据文件都应遵循以下结构：

```json
{
  "header": { /* 个人信息和联系方式 */ },
  "about": { /* 关于我 */ },
  "education": { /* 教育经历 */ },
  "skills": { /* 专业技能 */ },
  "projects": { /* 项目经历 */ }
}
```

详细的类型定义请参考 `/types/index.ts` 文件中的 `ResumeData` 接口。
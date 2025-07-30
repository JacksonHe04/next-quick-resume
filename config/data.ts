/**
 * 数据配置文件
 * 统一管理简历数据文件路径，便于切换不同的简历数据
 */

// 当前使用的简历数据文件路径
export const RESUME_DATA_PATH = '@/data/resume.json'

// 可选的简历数据文件路径（示例）
// export const RESUME_DATA_PATH = '@/data/resume-en.json'
// export const RESUME_DATA_PATH = '@/data/resume-internship.json'

/**
 * 动态导入简历数据
 * @returns 简历数据对象
 */
export const getResumeData = async () => {
  // 注意：在静态导入的情况下，我们使用固定路径
  // 如果需要真正的动态导入，需要使用 dynamic import
  const resumeData = await import(RESUME_DATA_PATH)
  return resumeData.default
}

// 静态导入（推荐用于 Next.js）
import resumeData from '@/data/resume.json'
export { resumeData }
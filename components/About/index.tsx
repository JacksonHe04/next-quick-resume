import { getCurrentResumeData } from '@/config/data'
import { SectionContainer, SectionTitle } from '@/components/common'
import { markdownToHtml } from '@/utils/markdown'

/**
 * 关于我组件 - 展示个人简介和自我描述
 * 从统一的简历数据源中读取关于我的信息进行渲染
 */
export default function About() {
  const { about } = getCurrentResumeData()

  if (!about || !about.content) return null

  return (
    <SectionContainer>
      <SectionTitle>{about.title}</SectionTitle>
      <div 
        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(about.content) }} 
      />
    </SectionContainer>
  )
}
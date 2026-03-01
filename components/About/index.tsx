import { getCurrentResumeData } from '@/config/data'
import { SectionContainer, SectionTitle } from '@/components/common'

/**
 * 关于我组件 - 展示个人简介和自我描述
 * 从统一的简历数据源中读取关于我的信息进行渲染
 * 将内容按段落分割并渲染为有序列表
 */
export default function About() {
  const { about } = getCurrentResumeData()

  if (!about || !about.content) return null

  // 将内容按换行分割成段落，过滤空行
  const paragraphs = about.content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  return (
    <SectionContainer>
      <SectionTitle>{about.title}</SectionTitle>
      <ol className="list-decimal list-inside ml-0 text-sm sm:text-base space-y-1 text-gray-700 leading-relaxed">
        {paragraphs.map((paragraph, index) => (
          <li
            key={index}
            className="[&>strong]:font-semibold [&>strong]:text-gray-900"
            dangerouslySetInnerHTML={{
              __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }}
          />
        ))}
      </ol>
    </SectionContainer>
  )
}
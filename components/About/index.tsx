import aboutData from './data.json'
import { AboutData } from '@/types'
import { SectionContainer, SectionTitle } from '@/components/common'
import { TEXT_STYLES } from '@/constants/styles'

/**
 * 关于我组件 - 展示个人简介和自我描述
 * 从本地JSON数据文件中读取关于我的信息进行渲染
 */
export default function About() {
  const { title, content } = aboutData as AboutData

  return (
    <SectionContainer>
      <SectionTitle>{title}</SectionTitle>
      <div className="text-gray-700 leading-relaxed">
        <p className={TEXT_STYLES.base}>{content}</p>
      </div>
    </SectionContainer>
  )
}
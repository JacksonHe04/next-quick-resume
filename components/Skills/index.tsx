import skillsData from './data.json'
import { SkillsData } from '@/types'
import { SectionContainer, SectionTitle } from '@/components/common'
import { LIST_STYLES } from '@/constants/styles'

/**
 * 专业技能组件 - 展示技术技能列表
 * 从本地JSON数据文件中读取技能列表并循环渲染
 */
export default function Skills() {
  const skills = skillsData as SkillsData

  return (
    <SectionContainer>
      <SectionTitle>{skills.title}</SectionTitle>
      <ul className={LIST_STYLES.base}>
        {skills.items.map((skill, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: skill }} />
        ))}
      </ul>
    </SectionContainer>
  )
}
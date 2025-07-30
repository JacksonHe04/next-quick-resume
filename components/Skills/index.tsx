import { getCurrentResumeData } from '@/config/data'
import { SectionContainer, SectionTitle } from '@/components/common'
import { LIST_STYLES } from '@/constants/styles'

/**
 * 专业技能组件 - 展示技术技能列表
 * 从统一的简历数据源中读取技能列表并循环渲染
 */
export default function Skills() {
  const skills = getCurrentResumeData().skills

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
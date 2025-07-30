import { resumeData } from '@/config/data'
import { ResumeData } from '@/types'
import { SectionContainer, SectionTitle } from '@/components/common'
import { LAYOUT_STYLES, TEXT_STYLES, CONTAINER_STYLES } from '@/constants/styles'

/**
 * 教育经历组件 - 展示学历信息
 * 从统一的简历数据文件中读取教育经历信息进行渲染
 */
export default function Education() {
  const education = (resumeData as ResumeData).education

  return (
    <SectionContainer>
      <SectionTitle>{education.title}</SectionTitle>
      <div className={CONTAINER_STYLES.project}>
        <div className={LAYOUT_STYLES.flexBetween}>
          <h3 className={TEXT_STYLES.base}>
            <b>{education.school}</b>
          </h3>
          <p className={TEXT_STYLES.period}>{education.period}</p>
        </div>
        <p className={TEXT_STYLES.base}>{education.details}</p>
      </div>
    </SectionContainer>
  )
}
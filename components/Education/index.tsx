import { getCurrentResumeData } from '@/config/data'
import { SectionContainer, SectionTitle } from '@/components/common'
import { LAYOUT_STYLES, TEXT_STYLES, CONTAINER_STYLES, TITLE_STYLES } from '@/constants/styles'
import Image from 'next/image'

/**
 * 教育经历组件 - 展示学历信息
 * 从统一的简历数据源中读取教育经历信息进行渲染
 */
export default function Education() {
  const education = getCurrentResumeData().education

  return (
    <SectionContainer>
      <SectionTitle>{education.title}</SectionTitle>
      <div className={CONTAINER_STYLES.project}>
        <div className={LAYOUT_STYLES.flexBetween}>
          <div className="flex items-center space-x-2">
            {education.image && (
              <Image 
                src={education.image} 
                alt={`${education.school} logo`}
                width={42}
                height={42}
                className="object-contain"
              />
            )}
            <h3 className={TITLE_STYLES.project}>
              <b>{education.school}</b>
            </h3>
          </div>
          <p className={TEXT_STYLES.period}>{education.period}</p>
        </div>
        <p className={TEXT_STYLES.base}>{education.details}</p>
      </div>
    </SectionContainer>
  )
}
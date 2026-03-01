import { getCurrentResumeData } from '@/config/data'
import { SectionContainer, SectionTitle, UniversalImage } from '@/components/common'
import { LAYOUT_STYLES, TEXT_STYLES, CONTAINER_STYLES, TITLE_STYLES } from '@/constants/styles'

/**
 * 教育经历组件 - 展示学历信息
 * 从统一的简历数据源中读取教育经历信息进行渲染
 */
export default function Education() {
  const { education } = getCurrentResumeData()

  return (
    <SectionContainer>
      <SectionTitle>{education.title}</SectionTitle>
      <div className={CONTAINER_STYLES.project}>
        <div className={LAYOUT_STYLES.flexBetweenMb}>
          <div className="flex items-center gap-2">
            {education.image && (
              <UniversalImage 
                src={education.image} 
                alt={`${education.school} logo`}
                width={36}
                height={36}
                className="object-contain"
              />
            )}
            <h3 className={TITLE_STYLES.project}>
              <span className="font-bold">{education.school}</span>
            </h3>
          </div>
          <span className={TEXT_STYLES.period}>{education.period}</span>
        </div>
        <p className={TEXT_STYLES.base}>{education.details}</p>
      </div>
    </SectionContainer>
  )
}
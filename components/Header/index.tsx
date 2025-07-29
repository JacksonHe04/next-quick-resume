import headerData from './data.json'
import { HeaderData } from '@/types'
import { SectionContainer, Link } from '@/components/common'
import { TITLE_STYLES, LAYOUT_STYLES, CONTAINER_STYLES, TEXT_STYLES } from '@/constants/styles'

/**
 * 简历头部组件 - 包含个人基本信息和联系方式
 * 从本地JSON数据文件中读取个人信息进行渲染
 */
export default function Header() {
  const { name, contact, jobInfo } = headerData as HeaderData

  return (
    <SectionContainer className={CONTAINER_STYLES.header}>
      <div className={LAYOUT_STYLES.textCenter}>
        <h1 className={TITLE_STYLES.main}>{name}</h1>
        <p className={TITLE_STYLES.subtitle}>{jobInfo.position}</p>
      </div>
      <div className={LAYOUT_STYLES.grid}>
        <div className={LAYOUT_STYLES.textRight}>
          <p className={TEXT_STYLES.base}>
            电话/微信：{contact.phone}
          </p>
          <p className={TEXT_STYLES.base}>
            GitHub:&nbsp;
            <Link href={contact.github.url}>
              {contact.github.text}
            </Link>
          </p>
        </div>
        <div className={LAYOUT_STYLES.textLeft}>
          <p className={TEXT_STYLES.base}>
            邮箱：
            <Link href={`mailto:${contact.email}`} underline={false}>
              {contact.email}
            </Link>
          </p>
          {/* <p className={TEXT_STYLES.base}>年龄：{contact.age}</p> */}
          <p className={TEXT_STYLES.base}>
            主页:&nbsp;
            <Link href={contact.homepage.url}>
              {contact.homepage.text}
            </Link>
          </p>
        </div>
      </div>
    </SectionContainer>
  )
}
import { HeaderData } from '@/types'
import { SectionContainer, Link } from '@/components/common'
import { TITLE_STYLES, CONTAINER_STYLES, TEXT_STYLES } from '@/constants/styles'

/**
 * 简历头部组件属性接口
 */
interface HeaderProps {
  /** 头部数据 */
  data: HeaderData
  /** 对齐方式 */
  alignment?: 'left' | 'center'
  /** 是否显示照片 */
  showPhoto?: boolean
  /** 照片数据（Base64） */
  photoData?: string
}

/**
 * 简历头部组件 - 包含个人基本信息和联系方式
 * 支持对齐方式和照片显示配置
 */
export default function Header({
  data,
  alignment = 'left',
  showPhoto = true,
  photoData
}: HeaderProps) {
  const { name, contact, jobInfo } = data

  // 根据对齐方式确定样式
  const alignmentClasses = alignment === 'center'
    ? 'items-center text-center'
    : 'items-start text-left'

  return (
    <SectionContainer className={CONTAINER_STYLES.header}>
      {/* 主容器：移动端垂直布局，桌面端水平布局 */}
      <div className={`flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-8 ${
        alignment === 'center' ? 'sm:justify-center' : ''
      }`}>
        {/* 左侧：个人信息区域 */}
        <div className={`flex-1 flex flex-col w-full sm:w-auto ${alignmentClasses}`}>
          {/* 姓名和职位 */}
          <div className="mb-3 sm:mb-4">
            <h1 className={TITLE_STYLES.main}>{name}</h1>
            <p className={TITLE_STYLES.subtitle}>{jobInfo.position}</p>
          </div>

          {/* 联系方式信息 */}
          <div className="space-y-2 sm:space-y-3">
            {/* 第一行：电话/微信和邮箱 - 移动端垂直布局 */}
            <div className={`flex flex-col sm:flex-row gap-2 sm:gap-8 ${
              alignment === 'center' ? 'sm:justify-center' : ''
            }`}>
              <p className={TEXT_STYLES.base}>
                电话/微信：{contact.phone}
              </p>
              <p className={TEXT_STYLES.base}>
                邮箱：
                <Link href={`mailto:${contact.email}`} underline={false}>
                  {contact.email}
                </Link>
              </p>
            </div>

            {/* 第二行：GitHub和主页 - 移动端垂直布局 */}
            <div className={`flex flex-col sm:flex-row gap-2 sm:gap-8 ${
              alignment === 'center' ? 'sm:justify-center' : ''
            }`}>
              {contact.homepage && (
                <p className={TEXT_STYLES.base}>
                  主页：
                  <Link href={contact.homepage.url}>
                    {contact.homepage.text}
                  </Link>
                </p>
              )}
              {contact.github && (
                <p className={TEXT_STYLES.base}>
                  GitHub:&nbsp;
                  <Link href={contact.github.url}>
                    {contact.github.text}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：照片区域 - 仅在 showPhoto 为 true 时显示 */}
        {showPhoto && (
          <div className="flex-shrink-0 self-center sm:self-auto">
            <div className="w-24 h-32 sm:w-32 sm:h-40 overflow-hidden rounded-lg border border-gray-200">
              <img
                src={photoData || '/images/avatar.jpg'}
                alt="个人照片"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/avatar.jpg';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  )
}

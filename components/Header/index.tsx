import { HeaderData, HeaderButtonConfig } from '@/types'
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
  /** 按钮配置 */
  button?: HeaderButtonConfig
}

/**
 * 简历头部组件 - 包含个人基本信息和联系方式
 * 支持对齐方式和照片显示配置
 */
export default function Header({
  data,
  alignment = 'left',
  showPhoto = true,
  photoData,
  button
}: HeaderProps) {
  const { name, contact, jobInfo } = data

  // 根据对齐方式确定样式
  const alignmentClasses = alignment === 'center'
    ? 'items-center text-center'
    : 'items-start text-left'

  // 处理按钮链接，确保是绝对路径
  const getButtonUrl = (url: string): string => {
    if (!url) return '#'
    // 如果 URL 已经是绝对路径（以 http:// 或 https:// 开头），直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // 如果是相对路径，添加 https:// 前缀
    return `https://${url}`
  }

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

            {/* 第二行：主页、按钮、GitHub */}
            {alignment === 'center' && button?.enabled && button.text ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="hidden sm:grid w-full" style={{ gridTemplateColumns: '1fr auto 1fr', gap: '1rem' }}>
                  <div className="flex items-center justify-end">
                    {contact.homepage && (
                      <p className={TEXT_STYLES.base}>
                        主页：
                        <Link href={contact.homepage.url}>
                          {contact.homepage.text}
                        </Link>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-center">
                    <a
                      href={getButtonUrl(button.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-1 text-sm font-medium text-gray-700 bg-transparent rounded-lg transition-all duration-200 hover:opacity-80"
                      style={{
                        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #2f59b6 0%, #3a8eff 33%, #00cad3 66%, #7ae7df 100%) border-box',
                        border: '2px solid transparent',
                        borderRadius: '8px'
                      }}
                    >
                      {button.text}
                    </a>
                  </div>
                  <div className="flex items-center justify-start">
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
                <div className="sm:hidden space-y-2">
                  <div className="flex flex-col gap-2">
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
            ) : (
              <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 ${
                alignment === 'center' ? 'sm:justify-center' : ''
              }`}>
                <div className={`flex flex-col sm:flex-row gap-2 sm:gap-8`}>
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
                {button?.enabled && button.text && (
                  <div className="hidden sm:flex flex-1 justify-center">
                    <a
                      href={getButtonUrl(button.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-gray-700 bg-transparent rounded-lg transition-all duration-200 hover:opacity-80"
                      style={{
                        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #2f59b6 0%, #3a8eff 33%, #00cad3 66%, #7ae7df 100%) border-box',
                        border: '2px solid transparent',
                        borderRadius: '8px'
                      }}
                    >
                      {button.text}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* 移动端按钮 - 水平居中 */}
            {button?.enabled && button.text && (
              <div className="flex justify-center mt-2 sm:hidden">
                <a
                  href={getButtonUrl(button.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-gray-700 bg-transparent rounded-lg transition-all duration-200 hover:opacity-80"
                  style={{
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #2f59b6 0%, #3a8eff 33%, #00cad3 66%, #7ae7df 100%) border-box',
                    border: '2px solid transparent',
                    borderRadius: '8px'
                  }}
                >
                  {button.text}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：照片区域 - 仅在 showPhoto 为 true 时显示 */}
        {showPhoto && (
          <div className="flex-shrink-0 self-center sm:self-start">
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

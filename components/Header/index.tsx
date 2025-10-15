import { getCurrentResumeData } from '@/config/data'
import { SectionContainer, Link } from '@/components/common'
import { TITLE_STYLES, CONTAINER_STYLES, TEXT_STYLES } from '@/constants/styles'
import Image from 'next/image'

/**
 * 简历头部组件 - 包含个人基本信息和联系方式
 * 从统一的简历数据源中读取个人信息进行渲染
 * 左侧显示个人信息，右侧显示照片
 */
export default function Header() {
  const { name, contact, jobInfo } = getCurrentResumeData().header

  return (
    <SectionContainer className={CONTAINER_STYLES.header}>
      {/* 主容器：左右布局 */}
      <div className="flex justify-between items-start gap-8">
        {/* 左侧：个人信息区域 */}
        <div className="flex-1">
          {/* 姓名和职位 */}
          <div className="mb-4">
            <h1 className={TITLE_STYLES.main}>{name}</h1>
            <p className={TITLE_STYLES.subtitle}>{jobInfo.position}</p>
          </div>
          
          {/* 联系方式信息 */}
          <div className="space-y-2">
            {/* 第一行：电话/微信和邮箱 */}
            <div className="flex gap-8">
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
            
            {/* 第二行：GitHub和主页 */}
            <div className="flex gap-8">
              <p className={TEXT_STYLES.base}>
                主页:&nbsp;
                <Link href={contact.homepage.url}>
                  {contact.homepage.text}
                </Link>
              </p>
              <p className={TEXT_STYLES.base}>
                GitHub:&nbsp;
                <Link href={contact.github.url}>
                  {contact.github.text}
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* 右侧：照片区域 */}
        <div className="flex-shrink-0">
          <div className="w-32 h-40 overflow-hidden relative">
            <Image 
              src="/images/avatar.jpg" 
              alt="个人照片" 
              fill
              className="object-cover"
              onError={() => {
                // 如果图片加载失败，可以在这里处理
                console.log('头像加载失败，使用默认占位符');
              }}
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
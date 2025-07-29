import { SectionTitleProps } from '@/types'
import { COMBINED_STYLES } from '@/constants/styles'
import { cn } from '@/utils/cn'

/**
 * 通用节标题组件
 * 为所有简历节提供统一的标题样式
 * @param children - 标题内容
 * @param className - 额外的CSS类名
 */
export default function SectionTitle({ 
  children, 
  className 
}: SectionTitleProps) {
  return (
    <h2 className={cn(COMBINED_STYLES.sectionTitle, className)}>
      {children}
    </h2>
  )
}
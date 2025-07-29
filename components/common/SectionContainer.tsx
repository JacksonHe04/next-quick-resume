import { SectionContainerProps } from '@/types'
import { COMBINED_STYLES } from '@/constants/styles'
import { cn } from '@/utils/cn'

/**
 * 通用节容器组件
 * 为所有简历节提供统一的容器样式和间距
 * @param children - 子组件内容
 * @param className - 额外的CSS类名
 */
export default function SectionContainer({ 
  children, 
  className 
}: SectionContainerProps) {
  return (
    <div className={cn(COMBINED_STYLES.sectionContainer, className)}>
      {children}
    </div>
  )
}
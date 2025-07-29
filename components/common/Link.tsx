import { LinkProps } from '@/types'
import { LINK_STYLES } from '@/constants/styles'
import { cn } from '@/utils/cn'

/**
 * 通用链接组件
 * 提供统一的链接样式和行为
 * @param href - 链接地址
 * @param children - 链接内容
 * @param className - 额外的CSS类名
 * @param target - 链接打开方式，默认为_blank
 * @param underline - 是否显示下划线，默认为true
 */
export default function Link({ 
  href, 
  children, 
  className, 
  target = '_blank',
  underline = true 
}: LinkProps) {
  const baseStyle = underline ? LINK_STYLES.underlined : LINK_STYLES.plain
  
  return (
    <a 
      href={href}
      target={target}
      className={cn(baseStyle, className)}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  )
}
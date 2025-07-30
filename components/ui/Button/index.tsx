/**
 * Button 组件 - 统一的按钮组件
 * 提供一致的按钮样式和交互体验
 */

import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { ButtonProps } from './Button.types'
import { getButtonClassName } from './Button.styles'

/**
 * 加载中图标组件
 */
const LoadingIcon = () => (
  <svg 
    className="animate-spin -ml-1 mr-2 h-4 w-4" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/**
 * Button 组件
 * 
 * @example
 * ```tsx
 * // 基础用法
 * <Button onClick={handleClick}>点击我</Button>
 * 
 * // 不同变体
 * <Button variant="success">成功按钮</Button>
 * <Button variant="danger">危险按钮</Button>
 * 
 * // 不同尺寸
 * <Button size="sm">小按钮</Button>
 * <Button size="lg">大按钮</Button>
 * 
 * // 加载状态
 * <Button loading>加载中...</Button>
 * 
 * // 块级按钮
 * <Button block>块级按钮</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    block = false,
    shadow = false,
    disabled = false,
    className,
    ...props
  },
  ref
) => {
  // 计算最终的样式类名
  const buttonClassName = cn(
    getButtonClassName(variant, size, loading, block, shadow, disabled || loading),
    className
  )

  return (
    <button
      ref={ref}
      className={buttonClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingIcon />}
      {children}
    </button>
  )
})

// 设置显示名称，便于调试
Button.displayName = 'Button'

// 默认导出
export default Button

// 同时导出类型，方便使用
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types'
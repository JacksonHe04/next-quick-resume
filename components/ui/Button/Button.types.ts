/**
 * Button 组件类型定义
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'

// 按钮变体类型
export type ButtonVariant = 
  | 'primary'    // 主要按钮 (蓝色)
  | 'secondary'  // 次要按钮 (灰色)
  | 'success'    // 成功按钮 (绿色)
  | 'danger'     // 危险按钮 (红色)
  | 'warning'    // 警告按钮 (黄色)
  | 'info'       // 信息按钮 (紫色)

// 按钮尺寸类型
export type ButtonSize = 
  | 'xs'    // 超小 (px-2 py-1 text-xs)
  | 'sm'    // 小 (px-3 py-1 text-sm)
  | 'md'    // 中等 (px-4 py-2 text-base)
  | 'lg'    // 大 (px-6 py-3 text-lg)

// Button 组件属性接口
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** 按钮内容 */
  children: ReactNode
  /** 按钮变体样式 */
  variant?: ButtonVariant
  /** 按钮尺寸 */
  size?: ButtonSize
  /** 是否为加载状态 */
  loading?: boolean
  /** 是否为块级按钮（占满宽度） */
  block?: boolean
  /** 自定义类名 */
  className?: string
  /** 是否显示阴影 */
  shadow?: boolean
}

// 按钮样式配置类型
export interface ButtonStyleConfig {
  base: string
  variants: Record<ButtonVariant, string>
  sizes: Record<ButtonSize, string>
  states: {
    loading: string
    disabled: string
    hover: string
  }
  modifiers: {
    block: string
    shadow: string
  }
}
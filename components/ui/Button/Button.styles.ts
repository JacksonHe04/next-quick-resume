/**
 * Button 组件样式配置
 */

import { ButtonStyleConfig } from './Button.types'

/**
 * Button 组件样式配置对象
 * 统一管理所有按钮样式，确保设计系统一致性
 */
export const buttonStyles: ButtonStyleConfig = {
  // 基础样式 - 所有按钮共享
  base: [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg transition-all duration-200',
    'border focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:transform active:scale-95'
  ].join(' '),

  // 变体样式 - 简洁的灰色调设计
  variants: {
    primary: [
      'bg-slate-900 text-white border-slate-900',
      'hover:bg-slate-800 hover:border-slate-800',
      'focus:ring-slate-400'
    ].join(' '),
    
    secondary: [
      'bg-white text-slate-700 border-slate-200',
      'hover:bg-slate-50 hover:border-slate-300',
      'focus:ring-slate-300'
    ].join(' '),
    
    success: [
      'bg-emerald-600 text-white border-emerald-600',
      'hover:bg-emerald-500 hover:border-emerald-500',
      'focus:ring-emerald-300'
    ].join(' '),
    
    danger: [
      'bg-rose-600 text-white border-rose-600',
      'hover:bg-rose-500 hover:border-rose-500',
      'focus:ring-rose-300'
    ].join(' '),
    
    warning: [
      'bg-amber-500 text-white border-amber-500',
      'hover:bg-amber-400 hover:border-amber-400',
      'focus:ring-amber-300'
    ].join(' '),
    
    info: [
      'bg-blue-600 text-white border-blue-600',
      'hover:bg-blue-500 hover:border-blue-500',
      'focus:ring-blue-300'
    ].join(' ')
  },

  // 尺寸样式
  sizes: {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  },

  // 状态样式
  states: {
    loading: 'cursor-wait',
    disabled: 'opacity-50 cursor-not-allowed',
    hover: 'hover:shadow-md'
  },

  // 修饰符样式
  modifiers: {
    block: 'w-full',
    shadow: 'shadow-md hover:shadow-lg'
  }
}

/**
 * 获取按钮的完整样式类名
 * @param variant - 按钮变体
 * @param size - 按钮尺寸
 * @param loading - 是否加载中
 * @param block - 是否块级
 * @param shadow - 是否显示阴影
 * @param disabled - 是否禁用
 * @returns 完整的样式类名字符串
 */
export const getButtonClassName = (
  variant: keyof typeof buttonStyles.variants = 'primary',
  size: keyof typeof buttonStyles.sizes = 'md',
  loading = false,
  block = false,
  shadow = false,
  disabled = false
): string => {
  const classes = [
    buttonStyles.base,
    buttonStyles.variants[variant],
    buttonStyles.sizes[size]
  ]

  if (loading) classes.push(buttonStyles.states.loading)
  if (disabled) classes.push(buttonStyles.states.disabled)
  if (block) classes.push(buttonStyles.modifiers.block)
  if (shadow) classes.push(buttonStyles.modifiers.shadow)
  if (!disabled && !loading) classes.push(buttonStyles.states.hover)

  return classes.join(' ')
}

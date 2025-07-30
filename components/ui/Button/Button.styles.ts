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
    'font-medium rounded transition-all duration-200',
    'border focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:transform active:scale-95'
  ].join(' '),

  // 变体样式 - 简洁的灰色调设计
  variants: {
    primary: [
      'bg-gray-900 text-white border-gray-900',
      'hover:bg-gray-800 hover:border-gray-800',
      'focus:ring-gray-500'
    ].join(' '),
    
    secondary: [
      'bg-white text-gray-700 border-gray-300',
      'hover:bg-gray-50 hover:border-gray-400',
      'focus:ring-gray-300'
    ].join(' '),
    
    success: [
      'bg-gray-700 text-white border-gray-700',
      'hover:bg-gray-600 hover:border-gray-600',
      'focus:ring-gray-400'
    ].join(' '),
    
    danger: [
      'bg-gray-600 text-white border-gray-600',
      'hover:bg-gray-700 hover:border-gray-700',
      'focus:ring-gray-400'
    ].join(' '),
    
    warning: [
      'bg-gray-500 text-white border-gray-500',
      'hover:bg-gray-600 hover:border-gray-600',
      'focus:ring-gray-400'
    ].join(' '),
    
    info: [
      'bg-gray-400 text-white border-gray-400',
      'hover:bg-gray-500 hover:border-gray-500',
      'focus:ring-gray-300'
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
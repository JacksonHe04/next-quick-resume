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
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-xl transition-[background-color,border-color,color,transform,box-shadow] duration-200',
    'border focus:outline-none focus-visible:ring-3 focus-visible:ring-[#55b97a]/30',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:translate-y-px'
  ].join(' '),

  // 变体样式 - 简洁的灰色调设计
  variants: {
    primary: [
      'bg-[#27764b] text-white border-[#27764b]',
      'hover:bg-[#1f603d] hover:border-[#1f603d]',
      'shadow-[0_8px_20px_rgb(39_118_75/0.16)]'
    ].join(' '),
    
    secondary: [
      'bg-white text-[#202620] border-[#dce5dd]',
      'hover:bg-[#eef4ee] hover:border-[#aebdb0]'
    ].join(' '),
    
    success: [
      'bg-[#55b97a] text-[#173f29] border-[#55b97a]',
      'hover:bg-[#47a96b] hover:border-[#47a96b]'
    ].join(' '),
    
    danger: [
      'bg-[#c45a67] text-white border-[#c45a67]',
      'hover:bg-[#aa4754] hover:border-[#aa4754]'
    ].join(' '),
    
    warning: [
      'bg-[#c9862f] text-white border-[#c9862f]',
      'hover:bg-[#ad7024] hover:border-[#ad7024]'
    ].join(' '),
    
    info: [
      'bg-[#eef4ee] text-[#27764b] border-[#dce5dd]',
      'hover:bg-[#dfeadf] hover:border-[#c4d4c6]'
    ].join(' ')
  },

  // 尺寸样式
  sizes: {
    xs: 'min-h-7 px-2.5 py-1 text-xs',
    sm: 'min-h-9 px-3.5 py-1.5 text-sm',
    md: 'min-h-11 px-4.5 py-2.5 text-sm',
    lg: 'min-h-12 px-6 py-3 text-base'
  },

  // 状态样式
  states: {
    loading: 'cursor-wait',
    disabled: 'opacity-50 cursor-not-allowed',
    hover: ''
  },

  // 修饰符样式
  modifiers: {
    block: 'w-full',
    shadow: 'shadow-[0_10px_28px_rgb(32_38_32/0.1)]'
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

/**
 * 类名合并工具函数
 * 用于合并和处理CSS类名，支持条件类名
 * @param classes - 类名数组或字符串
 * @returns 合并后的类名字符串
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim()
}
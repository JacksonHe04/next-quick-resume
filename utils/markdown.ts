/**
 * Markdown 工具函数
 * 提供简单的 Markdown 到 HTML 转换功能
 */

/**
 * 将简单的 Markdown 格式转换为 HTML
 * 目前支持：**粗体** -> <strong>粗体</strong>
 * @param text - 包含 Markdown 格式的文本
 * @returns 转换后的 HTML 字符串
 */
export function markdownToHtml(text: string): string {
  // 将 **文本** 转换为 <strong>文本</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

/**
 * 批量转换 Markdown 文本数组
 * @param texts - 包含 Markdown 格式的文本数组
 * @returns 转换后的 HTML 字符串数组
 */
export function markdownArrayToHtml(texts: string[]): string[] {
  return texts.map(markdownToHtml)
}
/**
 * Markdown 工具函数
 * 提供简单的 Markdown 到 HTML 转换功能
 */

/**
 * 将简单的 Markdown 格式转换为 HTML
 * 支持：**粗体** -> <strong>粗体</strong>
 * 支持：- 列表项 或 * 列表项 -> 有序列表 <ol><li>列表项</li></ol>
 * @param text - 包含 Markdown 格式的文本
 * @returns 转换后的 HTML 字符串
 */
export function markdownToHtml(text: string): string {
  let html = text
  
  // 将 **文本** 转换为 <strong>文本</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // 将无序列表项转换为有序列表
  // 匹配以 "- " 或 "* " 开头的行，转换为 <li>
  const lines = html.split('\n')
  let inList = false
  const result: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const listMatch = line.match(/^[\s]*[-*]\s+(.+)$/)
    
    if (listMatch) {
      if (!inList) {
        inList = true
        result.push('<ol class="list-decimal list-inside ml-0 text-sm sm:text-base space-y-1">')
      }
      result.push(`<li>${listMatch[1]}</li>`)
    } else {
      if (inList) {
        result.push('</ol>')
        inList = false
      }
      result.push(line)
    }
  }
  
  // 如果最后还在列表中，关闭标签
  if (inList) {
    result.push('</ol>')
  }
  
  return result.join('\n')
}

/**
 * 批量转换 Markdown 文本数组
 * @param texts - 包含 Markdown 格式的文本数组
 * @returns 转换后的 HTML 字符串数组
 */
export function markdownArrayToHtml(texts: string[]): string[] {
  return texts.map(markdownToHtml)
}
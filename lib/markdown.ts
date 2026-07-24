import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const markdownProcessor = unified()
  .use(remarkParse)
  // Raw HTML is intentionally not passed through. Sanitization then runs
  // after the Markdown conversion as the final potentially unsafe step.
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

export function renderSafeMarkdown(source: string): string {
  return String(markdownProcessor.processSync(source));
}

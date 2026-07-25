import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

function createMarkdownProcessor() {
  return unified()
    .use(remarkParse)
    // Raw HTML is intentionally not passed through. Sanitization then runs
    // after the Markdown conversion as the final potentially unsafe step.
    .use(remarkRehype)
    .use(rehypeSanitize);
}

const markdownProcessor = createMarkdownProcessor()
  .use(rehypeStringify)
  .freeze();

const inlineMarkdownProcessor = createMarkdownProcessor()
  .use(function unwrapSingleParagraph() {
    return (tree) => {
      const root = tree as unknown as {
        type: string;
        children: unknown[];
      };
      const paragraph = root.children[0] as
        | {
            type: string;
            tagName?: string;
            children?: unknown[];
          }
        | undefined;
      if (
        root.type === "root" &&
        root.children.length === 1 &&
        paragraph?.type === "element" &&
        paragraph.tagName === "p"
      ) {
        root.children = paragraph.children ?? [];
      }
    };
  })
  .use(rehypeStringify)
  .freeze();

export function renderSafeMarkdown(source: string): string {
  return String(markdownProcessor().processSync(source));
}

export function renderSafeInlineMarkdown(source: string): string {
  return String(inlineMarkdownProcessor().processSync(source));
}

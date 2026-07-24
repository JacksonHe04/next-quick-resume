import { describe, expect, it } from "vitest";

import { renderSafeMarkdown } from "@/lib/markdown";

describe("safe Markdown rendering", () => {
  it("removes scripts, raw HTML, and javascript URLs", () => {
    const html = renderSafeMarkdown(
      '[x](javascript:alert(1))<script>alert("x")</script><img src=x onerror=alert(1)>',
    );

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
  });

  it("preserves ordinary interview review formatting", () => {
    const html = renderSafeMarkdown(
      "## 复盘\n\n- 表达清楚\n- 案例需要更具体\n\n[会议资料](https://example.com)",
    );

    expect(html).toContain("<h2>复盘</h2>");
    expect(html).toContain("<li>表达清楚</li>");
    expect(html).toContain('href="https://example.com"');
  });
});

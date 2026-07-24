import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "SAYLESS",
    template: "%s · SAYLESS",
  },
  description: "把简历、投递、面试和复盘放在一条清晰的求职路径上。",
};

/**
 * 根布局组件
 * @param children - 子组件
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

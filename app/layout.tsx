import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { NavigationProgress } from "@/components/app/navigation-progress";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "SAYLESS",
    template: "%s · SAYLESS",
  },
  description: "把简历、投递、面试和复盘放在一条清晰的求职路径上。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <NavigationProgress />
          {children}
        </Providers>
      </body>
    </html>
  );
}

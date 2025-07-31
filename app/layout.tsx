import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Next Quick Resume',
  description: 'Next Quick Resume',
}

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
    <html lang="zh-CN">
      <head>
        <script 
          src="https://cdn.tailwindcss.com"
          async
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                if (window.tailwind) {
                  tailwind.config = {
                    theme: {
                      extend: {
                        fontFamily: {
                          serif: ["Times New Roman", "SimSun", "serif"],
                        },
                      },
                    },
                  };
                }
              });
            `,
          }}
        />
      </head>
      <body className="font-serif leading-6 text-black max-w-6xl mx-auto p-4 m-0">
        {children}
      </body>
    </html>
  )
}
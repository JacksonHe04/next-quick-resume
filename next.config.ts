import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 隔离 e2e 实例使用独立 dist 目录，避免与本地 dev（共用 .next）互锁
  distDir: process.env.SAYLESS_E2E_DIST_DIR || ".next",
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'youke.xn--y7xa690gmna.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'youke.xn--y7xa690gmna.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.nlark.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

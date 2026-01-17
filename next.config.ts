import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

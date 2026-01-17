import React from 'react';
import Image from 'next/image';

interface UniversalImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 通用图片组件 - 自动处理 SVG 和其他图片格式
 * 对于 SVG 文件使用原生 <img> 标签（因为 Next.js Image 不完全支持 SVG）
 * 其他格式使用 Next.js Image 组件以获得最佳性能
 */
export default function UniversalImage({
  src,
  alt,
  width = 36,
  height = 36,
  className = "object-contain",
  style
}: UniversalImageProps) {
  const isSvg = src.toLowerCase().endsWith('.svg');

  if (isSvg) {
    // SVG 文件使用原生 img 标签，Next.js Image 组件对 SVG 支持有限
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }

  // 其他格式使用 Next.js Image 组件以获得最佳性能
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}
'use client'

import React from 'react'
import { AlignLeft, AlignCenter, Eye, EyeOff } from 'lucide-react'
import { HeaderAlignment, PhotoConfig } from '@/types'
import { PhotoUploader } from './PhotoUploader'

/**
 * 头部配置组件属性接口
 */
interface HeaderConfigProps {
  /** 对齐方式 */
  alignment: HeaderAlignment
  /** 照片配置 */
  photo: PhotoConfig
  /** 对齐方式变更回调 */
  onAlignmentChange: (alignment: HeaderAlignment) => void
  /** 照片显示开关变更回调 */
  onShowPhotoChange: (show: boolean) => void
  /** 照片数据变更回调 */
  onPhotoDataChange: (photoData: string | undefined) => void
}

/**
 * 头部配置组件
 * 
 * 提供头部区域的对齐方式和照片显示配置
 */
export function HeaderConfig({
  alignment,
  photo,
  onAlignmentChange,
  onShowPhotoChange,
  onPhotoDataChange
}: HeaderConfigProps) {
  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-4">头部样式设置</h3>
      
      {/* 对齐方式设置 */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-700">对齐方式</h4>
        <div className="flex gap-2">
          <button
            onClick={() => onAlignmentChange('left')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              alignment === 'left'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
            <span className="text-sm">靠左对齐</span>
          </button>
          <button
            onClick={() => onAlignmentChange('center')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              alignment === 'center'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <AlignCenter className="w-4 h-4" />
            <span className="text-sm">居中对齐</span>
          </button>
        </div>
      </div>

      {/* 照片显示设置 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">显示照片</h4>
          <button
            onClick={() => onShowPhotoChange(!photo.showPhoto)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              photo.showPhoto ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                photo.showPhoto ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {photo.showPhoto && (
          <PhotoUploader
            photoData={photo.photoData}
            onPhotoChange={onPhotoDataChange}
          />
        )}
      </div>
    </div>
  )
}

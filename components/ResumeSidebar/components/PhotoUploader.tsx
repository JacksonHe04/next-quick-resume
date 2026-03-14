'use client'

import React, { useCallback, useRef } from 'react'
import { Upload, X, User } from 'lucide-react'

/**
 * 照片上传组件属性接口
 */
interface PhotoUploaderProps {
  /** 当前照片数据（Base64） */
  photoData?: string
  /** 照片变更回调 */
  onPhotoChange: (photoData: string | undefined) => void
}

/**
 * 照片上传组件
 * 
 * 提供照片上传、预览和删除功能
 * 照片以 Base64 格式存储在浏览器中
 */
export function PhotoUploader({ photoData, onPhotoChange }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 处理文件选择
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 验证文件大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB')
      return
    }

    // 转换为 Base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      onPhotoChange(result)
    }
    reader.readAsDataURL(file)
  }, [onPhotoChange])

  /**
   * 处理删除照片
   */
  const handleDelete = useCallback(() => {
    onPhotoChange(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onPhotoChange])

  /**
   * 触发文件选择
   */
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">个人照片</h4>
      
      {photoData ? (
        // 已上传照片预览
        <div className="relative inline-block">
          <div className="w-24 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <img
              src={photoData}
              alt="个人照片预览"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
            title="删除照片"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // 上传区域
        <button
          onClick={triggerFileInput}
          className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <User className="w-8 h-8 text-gray-400" />
          <span className="text-xs text-gray-500">点击上传</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        支持 JPG、PNG 格式，最大 2MB
      </p>
    </div>
  )
}

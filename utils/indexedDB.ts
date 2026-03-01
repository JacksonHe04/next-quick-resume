/**
 * IndexedDB 工具类
 * 用于管理简历数据的本地存储
 */

import { ResumeData, ResumeDisplayConfig } from '@/types'

// 数据库配置
const DB_NAME = 'ResumeDB'
const DB_VERSION = 2 // 升级版本以支持配置存储
const STORE_NAME = 'resumes'

// 默认简历显示配置
export const getDefaultResumeConfig = (): ResumeDisplayConfig => ({
  sections: [
    { key: 'header', label: '个人信息', visible: true },
    { key: 'education', label: '教育经历', visible: true },
    { key: 'intern', label: '实习经历', visible: true },
    { key: 'projects', label: '项目经历', visible: true },
    { key: 'skills', label: '专业技能', visible: true },
    { key: 'about', label: '关于我', visible: true }
  ],
  sectionOrder: ['header', 'education', 'intern', 'projects', 'skills', 'about']
})

// 简历记录接口（向后兼容）
export interface ResumeRecord {
  id: string
  name: string
  data: ResumeData
  config?: ResumeDisplayConfig
  createdAt: Date
  updatedAt: Date
}

/**
 * 初始化 IndexedDB 数据库
 * @returns Promise<IDBDatabase>
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // 创建对象存储
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('name', 'name', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

/**
 * 获取所有简历记录
 * @returns Promise<ResumeRecord[]>
 */
export const getAllResumes = async (): Promise<ResumeRecord[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const records = request.result as ResumeRecord[]
      // 为旧记录添加默认配置
      const recordsWithConfig = records.map(record => ({
        ...record,
        config: record.config || getDefaultResumeConfig()
      }))
      resolve(recordsWithConfig)
    }
  })
}

/**
 * 根据ID获取简历记录
 * @param id - 简历ID
 * @returns Promise<ResumeRecord | undefined>
 */
export const getResumeById = async (id: string): Promise<ResumeRecord | undefined> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const record = request.result as ResumeRecord | undefined
      if (record) {
        record.config = record.config || getDefaultResumeConfig()
      }
      resolve(record)
    }
  })
}

/**
 * 添加新的简历记录
 * @param name - 简历名称
 * @param data - 简历数据
 * @param config - 简历显示配置（可选）
 * @returns Promise<string> - 返回新创建的简历ID
 */
export const addResume = async (
  name: string,
  data: ResumeData,
  config?: ResumeDisplayConfig
): Promise<string> => {
  const db = await initDB()
  const id = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date()

  const record: ResumeRecord = {
    id,
    name,
    data,
    config: config || getDefaultResumeConfig(),
    createdAt: now,
    updatedAt: now
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(record)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(id)
  })
}

/**
 * 更新简历记录
 * @param id - 简历ID
 * @param name - 简历名称
 * @param data - 简历数据
 * @param config - 简历显示配置（可选）
 * @returns Promise<void>
 */
export const updateResume = async (
  id: string,
  name: string,
  data: ResumeData,
  config?: ResumeDisplayConfig
): Promise<void> => {
  const db = await initDB()
  const existingRecord = await getResumeById(id)

  if (!existingRecord) {
    throw new Error('Resume not found')
  }

  const updatedRecord: ResumeRecord = {
    ...existingRecord,
    name,
    data,
    config: config || existingRecord.config || getDefaultResumeConfig(),
    updatedAt: new Date()
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(updatedRecord)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * 仅更新简历名称
 * @param id - 简历ID
 * @param name - 新名称
 * @returns Promise<void>
 */
export const updateResumeName = async (
  id: string,
  name: string
): Promise<void> => {
  const db = await initDB()
  const existingRecord = await getResumeById(id)

  if (!existingRecord) {
    throw new Error('Resume not found')
  }

  const updatedRecord: ResumeRecord = {
    ...existingRecord,
    name,
    updatedAt: new Date()
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(updatedRecord)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * 仅更新简历配置
 * @param id - 简历ID
 * @param config - 简历显示配置
 * @returns Promise<void>
 */
export const updateResumeConfig = async (
  id: string,
  config: ResumeDisplayConfig
): Promise<void> => {
  const db = await initDB()
  const existingRecord = await getResumeById(id)

  if (!existingRecord) {
    throw new Error('Resume not found')
  }

  const updatedRecord: ResumeRecord = {
    ...existingRecord,
    config,
    updatedAt: new Date()
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(updatedRecord)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * 同时更新简历数据和配置
 * @param id - 简历ID
 * @param data - 简历数据
 * @param config - 简历显示配置
 * @returns Promise<void>
 */
export const updateResumeDataAndConfig = async (
  id: string,
  data: ResumeData,
  config: ResumeDisplayConfig
): Promise<void> => {
  const db = await initDB()
  const existingRecord = await getResumeById(id)

  if (!existingRecord) {
    throw new Error('Resume not found')
  }

  const updatedRecord: ResumeRecord = {
    ...existingRecord,
    data,
    config,
    updatedAt: new Date()
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(updatedRecord)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * 删除简历记录
 * @param id - 简历ID
 * @returns Promise<void>
 */
export const deleteResume = async (id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * 清空所有简历记录
 * @returns Promise<void>
 */
export const clearAllResumes = async (): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * 克隆简历记录
 * @param sourceId - 源简历ID
 * @param newName - 新简历名称
 * @returns Promise<string> - 返回新创建的简历ID
 */
export const cloneResume = async (sourceId: string, newName: string): Promise<string> => {
  const sourceRecord = await getResumeById(sourceId)

  if (!sourceRecord) {
    throw new Error('Source resume not found')
  }

  return addResume(
    newName,
    JSON.parse(JSON.stringify(sourceRecord.data)),
    JSON.parse(JSON.stringify(sourceRecord.config || getDefaultResumeConfig()))
  )
}

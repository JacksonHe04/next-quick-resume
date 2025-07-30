/**
 * IndexedDB 工具类
 * 用于管理简历数据的本地存储
 */

import { ResumeData } from '@/types'

// 数据库配置
const DB_NAME = 'ResumeDB'
const DB_VERSION = 1
const STORE_NAME = 'resumes'

// 简历记录接口
export interface ResumeRecord {
  id: string
  name: string
  data: ResumeData
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
    request.onsuccess = () => resolve(request.result)
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
    request.onsuccess = () => resolve(request.result)
  })
}

/**
 * 添加新的简历记录
 * @param name - 简历名称
 * @param data - 简历数据
 * @returns Promise<string> - 返回新创建的简历ID
 */
export const addResume = async (name: string, data: ResumeData): Promise<string> => {
  const db = await initDB()
  const id = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date()
  
  const record: ResumeRecord = {
    id,
    name,
    data,
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
 * @returns Promise<void>
 */
export const updateResume = async (id: string, name: string, data: ResumeData): Promise<void> => {
  const db = await initDB()
  const existingRecord = await getResumeById(id)
  
  if (!existingRecord) {
    throw new Error('Resume not found')
  }
  
  const updatedRecord: ResumeRecord = {
    ...existingRecord,
    name,
    data,
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
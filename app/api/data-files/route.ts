import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * 获取data目录中的所有JSON文件
 */
export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const files = fs.readdirSync(dataDir)
    const jsonFiles = files.filter(file => file.endsWith('.json'))
    
    const fileRecords = []
    
    for (const fileName of jsonFiles) {
      try {
        const filePath = path.join(dataDir, fileName)
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(fileContent)
        
        fileRecords.push({
          id: fileName,
          name: fileName.replace('.json', ''),
          data: data,
          type: 'file',
          source: path.join(process.cwd(), 'data', fileName)
        })
      } catch (err) {
        console.warn(`Failed to load ${fileName}:`, err)
      }
    }
    
    return NextResponse.json(fileRecords)
  } catch (error) {
    console.error('Error reading data directory:', error)
    return NextResponse.json({ error: 'Failed to read data directory' }, { status: 500 })
  }
}
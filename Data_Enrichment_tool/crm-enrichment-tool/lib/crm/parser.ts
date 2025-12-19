import * as XLSX from 'xlsx'
import { Buffer } from 'buffer'

export interface ParsedCrmData {
  rows: Record<string, any>[]
  columns: string[]
  rowCount: number
  fileType: 'csv' | 'xlsx'
}

export interface ParseOptions {
  maxRows?: number // For preview, limit rows
  sheetName?: string // For Excel files
}

/**
 * Detect file type from buffer
 */
export function detectFileType(buffer: Buffer): 'csv' | 'xlsx' | 'unknown' {
  // Check for ZIP signature (Excel files are ZIP archives)
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    const bufferStr = buffer.toString('utf8', 0, Math.min(buffer.length, 4000))
    if (bufferStr.includes('xl/') || bufferStr.includes('xl/workbook.xml')) {
      return 'xlsx'
    }
  }

  // Check if it looks like text (CSV)
  const sample = buffer.slice(0, 1000)
  let isText = true
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i]
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20 && byte !== 0x1b)) {
      if (byte < 0x80) {
        isText = false
        break
      }
    }
  }

  if (isText) return 'csv'
  return 'unknown'
}

/**
 * Parse CSV file
 */
export function parseCSV(buffer: Buffer, options?: ParseOptions): ParsedCrmData {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[]

  if (jsonData.length === 0) {
    throw new Error('Il file CSV è vuoto o non contiene dati validi')
  }

  const columns = Object.keys(jsonData[0])
  const rows = options?.maxRows ? jsonData.slice(0, options.maxRows) : jsonData

  return {
    rows,
    columns,
    rowCount: jsonData.length,
    fileType: 'csv',
  }
}

/**
 * Parse Excel file
 */
export function parseExcel(buffer: Buffer, options?: ParseOptions): ParsedCrmData {
  const workbook = XLSX.read(buffer, { type: 'buffer' })

  const sheetName = options?.sheetName || workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" non trovato nel file Excel`)
  }

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[]

  if (jsonData.length === 0) {
    throw new Error('Il file Excel è vuoto o non contiene dati validi')
  }

  const columns = Object.keys(jsonData[0])
  const rows = options?.maxRows ? jsonData.slice(0, options.maxRows) : jsonData

  return {
    rows,
    columns,
    rowCount: jsonData.length,
    fileType: 'xlsx',
  }
}

/**
 * Universal CRM file parser
 */
export async function parseCrmFile(
  file: File | Buffer,
  options?: ParseOptions
): Promise<ParsedCrmData> {
  let buffer: Buffer

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } else {
    buffer = file
  }

  const fileType = detectFileType(buffer)

  if (fileType === 'unknown') {
    throw new Error('Formato file non riconosciuto. Supportati: CSV, XLSX')
  }

  try {
    if (fileType === 'csv') {
      return parseCSV(buffer, options)
    } else {
      return parseExcel(buffer, options)
    }
  } catch (error) {
    console.error('Parse error:', error)
    throw new Error(`Errore nel parsing del file: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
  }
}

/**
 * Get sheet names from Excel file (for multi-sheet files)
 */
export function getExcelSheetNames(buffer: Buffer): string[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  return workbook.SheetNames
}

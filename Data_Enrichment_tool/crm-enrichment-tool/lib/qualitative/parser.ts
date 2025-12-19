import type { ParsedQualitativeData, QualitativeFileType } from '@/types/qualitative'

// Dynamic imports for CommonJS modules
const getPdfParse = async () => (await import('pdf-parse')).default
const getMammoth = async () => (await import('mammoth')).default

export interface ParseOptions {
  maxSize?: number // Max file size in bytes (default: 10MB)
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Detect file type from filename or MIME type
 */
export function detectFileType(fileName: string, mimeType?: string): QualitativeFileType | null {
  const extension = fileName.toLowerCase().split('.').pop()

  if (extension === 'txt' || mimeType === 'text/plain') return 'txt'
  if (extension === 'md' || mimeType === 'text/markdown') return 'md'
  if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf'
  if (
    extension === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) return 'docx'

  return null
}

/**
 * Parse text from TXT/MD file
 */
async function parseTextFile(buffer: Buffer): Promise<string> {
  return buffer.toString('utf-8')
}

/**
 * Parse text from PDF file
 */
async function parsePdfFile(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = await getPdfParse()
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Parse text from DOCX file
 */
async function parseDocxFile(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await getMammoth()
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Calculate word count (split by whitespace)
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Parse qualitative research file
 * Supports: TXT, MD, PDF, DOCX
 */
export async function parseQualitativeFile(
  file: File | Buffer,
  fileName?: string,
  options: ParseOptions = {}
): Promise<ParsedQualitativeData> {
  const maxSize = options.maxSize || DEFAULT_MAX_SIZE

  // Get file info
  let buffer: Buffer
  let name: string
  let size: number
  let mimeType: string | undefined

  if (file instanceof Buffer) {
    if (!fileName) {
      throw new Error('fileName is required when passing Buffer')
    }
    buffer = file
    name = fileName
    size = buffer.length
  } else {
    // Browser File object
    buffer = Buffer.from(await file.arrayBuffer())
    name = file.name
    size = file.size
    mimeType = file.type
  }

  // Check file size
  if (size > maxSize) {
    throw new Error(`File size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`)
  }

  // Detect file type
  const fileType = detectFileType(name, mimeType)
  if (!fileType) {
    throw new Error(`Unsupported file type. Supported formats: TXT, MD, PDF, DOCX`)
  }

  // Parse content based on file type
  let content: string

  try {
    switch (fileType) {
      case 'txt':
      case 'md':
        content = await parseTextFile(buffer)
        break
      case 'pdf':
        content = await parsePdfFile(buffer)
        break
      case 'docx':
        content = await parseDocxFile(buffer)
        break
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (error) {
    throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Clean up content (remove excessive whitespace)
  content = content.trim().replace(/\n{3,}/g, '\n\n')

  // Calculate metadata
  const wordCount = countWords(content)
  const charCount = content.length

  return {
    fileName: name,
    fileType,
    fileSize: size,
    content,
    metadata: {
      wordCount,
      charCount,
      extractedAt: new Date(),
    },
  }
}

/**
 * Validate if file can be processed
 */
export function validateQualitativeFile(fileName: string, fileSize: number, maxSize?: number): {
  valid: boolean
  error?: string
} {
  const max = maxSize || DEFAULT_MAX_SIZE

  // Check file type
  const fileType = detectFileType(fileName)
  if (!fileType) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload TXT, MD, PDF, or DOCX files.',
    }
  }

  // Check file size
  if (fileSize > max) {
    return {
      valid: false,
      error: `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(max / 1024 / 1024).toFixed(2)}MB).`,
    }
  }

  return { valid: true }
}

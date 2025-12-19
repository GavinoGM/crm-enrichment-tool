export type QualitativeFileType = 'txt' | 'pdf' | 'docx' | 'md'

export interface QualitativeFile {
  url: string
  name: string
  type: QualitativeFileType
  size: number
  uploadedAt: Date
}

export interface ParsedQualitativeData {
  fileName: string
  fileType: QualitativeFileType
  fileSize: number
  content: string
  metadata: {
    wordCount: number
    charCount: number
    extractedAt: Date
  }
}

export interface QualitativeInsight {
  theme: string
  frequency: number
  quotes: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
}

export interface QualitativeAnalysis {
  insights: QualitativeInsight[]
  summary: string
  topThemes: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
}

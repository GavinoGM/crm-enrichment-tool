import { CrmColumnType } from '@/lib/crm/column-detector'

export interface CrmUploadResponse {
  projectId: string
  fileUrl: string
  fileName: string
  rowCount: number
  columns: string[]
  preview: Record<string, any>[]
  detectedMapping: Record<string, CrmColumnType>
  suggestions: Record<string, string[]>
  unmapped: string[]
}

export interface CrmAnalysisRequest {
  projectId: string
  columnMapping: Record<string, string> // column name -> CrmColumnType
  analysisOptions?: {
    numClusters?: number
    focusOn?: 'behavior' | 'demographics' | 'both'
  }
}

export interface CrmCluster {
  id: string
  name: string
  size: number
  percentage: number
  behavioral_traits: Record<string, any>
  demographic_traits?: Record<string, any>
  sample_customers?: Record<string, any>[]
}

export interface CrmAnalysisResponse {
  projectId: string
  clusters: CrmCluster[]
  status: 'completed' | 'error'
  errorMessage?: string
}

export interface ClusterRefinementRequest {
  projectId: string
  action: 'merge' | 'split' | 'rename' | 'delete'
  clusterIds: string[]
  newName?: string
  splitCriteria?: Record<string, any>
}

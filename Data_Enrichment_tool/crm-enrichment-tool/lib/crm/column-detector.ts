/**
 * Intelligent column detection for CRM data
 * Automatically identifies common CRM fields
 */

export interface ColumnMapping {
  detected: Record<string, string> // originalColumn -> detectedType
  suggestions: Record<string, string[]> // detectedType -> possibleColumns
  unmapped: string[]
}

export type CrmColumnType =
  | 'customer_id'
  | 'email'
  | 'name'
  | 'first_name'
  | 'last_name'
  | 'phone'
  | 'company'
  | 'industry'
  | 'revenue'
  | 'purchase_count'
  | 'last_purchase_date'
  | 'signup_date'
  | 'status'
  | 'segment'
  | 'location'
  | 'city'
  | 'country'
  | 'age'
  | 'gender'
  | 'unknown'

const COLUMN_PATTERNS: Record<CrmColumnType, RegExp[]> = {
  customer_id: [/customer.*id/i, /client.*id/i, /user.*id/i, /^id$/i],
  email: [/e?mail/i, /^email$/i],
  name: [/^name$/i, /full.*name/i, /customer.*name/i],
  first_name: [/first.*name/i, /fname/i, /given.*name/i],
  last_name: [/last.*name/i, /lname/i, /surname/i, /family.*name/i],
  phone: [/phone/i, /tel/i, /mobile/i, /cell/i],
  company: [/company/i, /organization/i, /business/i],
  industry: [/industry/i, /sector/i, /vertical/i],
  revenue: [/revenue/i, /sales/i, /spend/i, /ltv/i, /lifetime.*value/i],
  purchase_count: [/purchase.*count/i, /order.*count/i, /transactions/i, /num.*orders/i],
  last_purchase_date: [/last.*purchase/i, /last.*order/i, /recent.*purchase/i],
  signup_date: [/signup/i, /join.*date/i, /registration/i, /created.*at/i],
  status: [/status/i, /state/i, /active/i],
  segment: [/segment/i, /tier/i, /level/i, /category/i],
  location: [/location/i, /address/i],
  city: [/city/i, /town/i],
  country: [/country/i, /nation/i],
  age: [/^age$/i, /years.*old/i],
  gender: [/gender/i, /sex$/i],
  unknown: [],
}

/**
 * Detect column type based on name
 */
export function detectColumnType(columnName: string): CrmColumnType {
  const normalized = columnName.trim()

  for (const [type, patterns] of Object.entries(COLUMN_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return type as CrmColumnType
      }
    }
  }

  return 'unknown'
}

/**
 * Analyze sample data to improve detection
 */
export function analyzeColumnData(columnName: string, sampleValues: any[]): CrmColumnType {
  // First try name-based detection
  const nameBasedType = detectColumnType(columnName)
  if (nameBasedType !== 'unknown') {
    return nameBasedType
  }

  // Analyze data patterns
  const nonEmptyValues = sampleValues.filter(v => v !== null && v !== undefined && v !== '')
  if (nonEmptyValues.length === 0) return 'unknown'

  // Email detection
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (nonEmptyValues.every(v => typeof v === 'string' && emailPattern.test(v))) {
    return 'email'
  }

  // Phone detection
  const phonePattern = /^[\d\s\-\+\(\)]+$/
  if (nonEmptyValues.every(v => typeof v === 'string' && phonePattern.test(v) && v.length >= 10)) {
    return 'phone'
  }

  // Date detection
  const datePattern = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}/
  if (nonEmptyValues.every(v => typeof v === 'string' && datePattern.test(v))) {
    return 'signup_date'
  }

  // Number detection
  if (nonEmptyValues.every(v => typeof v === 'number' || !isNaN(Number(v)))) {
    // Could be revenue, purchase_count, age, etc.
    const avgValue = nonEmptyValues.reduce((sum, v) => sum + Number(v), 0) / nonEmptyValues.length

    if (avgValue > 1000) return 'revenue'
    if (avgValue > 18 && avgValue < 100) return 'age'
    return 'purchase_count'
  }

  return 'unknown'
}

/**
 * Auto-detect column mappings for entire dataset
 */
export function detectColumnMappings(
  columns: string[],
  sampleData: Record<string, any>[]
): ColumnMapping {
  const detected: Record<string, string> = {}
  const suggestions: Record<string, string[]> = {}
  const unmapped: string[] = []

  for (const column of columns) {
    const sampleValues = sampleData.slice(0, 10).map(row => row[column])
    const detectedType = analyzeColumnData(column, sampleValues)

    if (detectedType !== 'unknown') {
      detected[column] = detectedType

      if (!suggestions[detectedType]) {
        suggestions[detectedType] = []
      }
      suggestions[detectedType].push(column)
    } else {
      unmapped.push(column)
    }
  }

  return {
    detected,
    suggestions,
    unmapped,
  }
}

/**
 * Get importance score for a column type (for behavioral clustering)
 */
export function getColumnImportance(columnType: CrmColumnType): 'high' | 'medium' | 'low' {
  const highImportance: CrmColumnType[] = [
    'purchase_count',
    'revenue',
    'last_purchase_date',
    'status',
    'segment',
  ]

  const mediumImportance: CrmColumnType[] = [
    'signup_date',
    'industry',
    'company',
    'location',
  ]

  if (highImportance.includes(columnType)) return 'high'
  if (mediumImportance.includes(columnType)) return 'medium'
  return 'low'
}

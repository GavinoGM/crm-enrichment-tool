"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, AlertCircle } from "lucide-react"
import type { CrmColumnType } from "@/lib/crm/column-detector"

interface ColumnMappingEditorProps {
  columns: string[]
  detectedMapping: Record<string, string>
  preview: Record<string, any>[]
  onComplete: (mapping: Record<string, CrmColumnType>) => void
}

const COLUMN_TYPES: { value: CrmColumnType; label: string }[] = [
  { value: 'customer_id', label: 'Customer ID' },
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Full Name' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'industry', label: 'Industry' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'purchase_count', label: 'Purchase Count' },
  { value: 'last_purchase_date', label: 'Last Purchase Date' },
  { value: 'signup_date', label: 'Signup Date' },
  { value: 'status', label: 'Status' },
  { value: 'segment', label: 'Segment' },
  { value: 'location', label: 'Location' },
  { value: 'city', label: 'City' },
  { value: 'country', label: 'Country' },
  { value: 'age', label: 'Age' },
  { value: 'gender', label: 'Gender' },
  { value: 'unknown', label: 'Unknown / Skip' },
]

export function ColumnMappingEditor({
  columns,
  detectedMapping,
  preview,
  onComplete,
}: ColumnMappingEditorProps) {
  const [mapping, setMapping] = useState<Record<string, CrmColumnType>>(
    detectedMapping as Record<string, CrmColumnType>
  )

  const handleMappingChange = (column: string, type: CrmColumnType) => {
    setMapping({ ...mapping, [column]: type })
  }

  const getMappedCount = () => {
    return Object.values(mapping).filter(type => type !== 'unknown').length
  }

  const handleContinue = () => {
    onComplete(mapping)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Review Column Mapping</CardTitle>
            <CardDescription>
              We automatically detected {getMappedCount()} of {columns.length} columns. Review and adjust if needed.
            </CardDescription>
          </div>
          <Badge variant={getMappedCount() === columns.length ? "default" : "secondary"}>
            {getMappedCount()} / {columns.length} mapped
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-3">
          {columns.map((column) => {
            const currentMapping = mapping[column] || 'unknown'
            const isDetected = !!detectedMapping[column]
            const sampleValue = preview[0]?.[column]

            return (
              <div
                key={column}
                className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{column}</p>
                    {isDetected && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Sample: {sampleValue !== null && sampleValue !== undefined ? String(sampleValue) : '(empty)'}
                  </p>
                </div>
                <Select
                  value={currentMapping}
                  onValueChange={(value) => handleMappingChange(column, value as CrmColumnType)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
        </div>

        {getMappedCount() < columns.length && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Some columns are unmapped
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Unmapped columns will be excluded from the analysis. You can map them now or proceed.
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleContinue} className="w-full" size="lg">
          Continue to Clustering
        </Button>
      </CardContent>
    </Card>
  )
}

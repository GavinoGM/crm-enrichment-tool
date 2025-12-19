"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import type { CrmUploadResponse } from "@/types/crm"

interface CrmUploadProps {
  projectName: string
  projectDescription?: string
  onUploadComplete: (data: CrmUploadResponse) => void
}

export function CrmUpload({ projectName, projectDescription, onUploadComplete }: CrmUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setError('Invalid file type. Please upload a CSV or Excel file.')
      return
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File is too large. Maximum size is 100MB.')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectName', projectName)
      if (projectDescription) {
        formData.append('projectDescription', projectDescription)
      }

      const response = await fetch('/api/crm/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data: CrmUploadResponse = await response.json()
      onUploadComplete(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CRM File</CardTitle>
        <CardDescription>
          Upload your CRM data in CSV or Excel format. Limits: 500k rows max, 100MB file size. Large files will use intelligent sampling for AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            disabled={uploading}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading and analyzing...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drag and drop your CRM file here, or{" "}
                  <label
                    htmlFor="file-upload"
                    className="text-primary cursor-pointer hover:underline"
                  >
                    browse
                  </label>
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: CSV, XLSX (max 100MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

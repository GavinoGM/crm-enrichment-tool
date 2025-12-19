"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface QualitativeFile {
  url: string
  name: string
  type: string
  size: number
}

interface QualitativeUploadProps {
  projectId: string
  existingFiles?: QualitativeFile[]
}

export function QualitativeUpload({ projectId, existingFiles = [] }: QualitativeUploadProps) {
  const router = useRouter()
  const [files, setFiles] = useState<QualitativeFile[]>(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('projectId', projectId)

      const response = await fetch('/api/crm/qualitative/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()

      // Add new file to list
      setFiles((prev) => [...prev, data.file])

      // Reset input
      e.target.value = ''

      // Refresh page data
      router.refresh()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    setDeleting(fileUrl)
    setError(null)

    try {
      const response = await fetch(
        `/api/crm/qualitative/upload?projectId=${projectId}&fileUrl=${encodeURIComponent(fileUrl)}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Delete failed')
      }

      // Remove file from list
      setFiles((prev) => prev.filter((f) => f.url !== fileUrl))

      // Refresh page data
      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Qualitative Research</CardTitle>
        <CardDescription>
          Upload interview transcripts, survey responses, or focus group notes (TXT, MD, PDF, DOCX)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('qualitative-file-input')?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
          <input
            id="qualitative-file-input"
            type="file"
            accept=".txt,.md,.pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="text-sm text-muted-foreground">
            Max 10MB per file
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Files List */}
        {files.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Uploaded Files ({files.length})
            </p>
            {files.map((file) => (
              <div
                key={file.url}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type.toUpperCase()} • {formatFileSize(file.size)}
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(file.url)}
                  disabled={deleting === file.url}
                >
                  {deleting === file.url ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No qualitative research files uploaded yet</p>
            <p className="text-xs mt-1">Upload transcripts to enrich your customer insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

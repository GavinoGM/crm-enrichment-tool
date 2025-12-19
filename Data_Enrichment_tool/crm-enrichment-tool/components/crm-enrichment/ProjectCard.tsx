"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string | null
    status: string
    crmFileName: string | null
    crmRowCount: number | null
    updatedAt: Date | null
    clusters: any
  }
  statusColors: Record<string, string>
}

export function ProjectCard({ project, statusColors }: ProjectCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/crm/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete project. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="relative group">
      <Link href={`/crm-enrichment/${project.id}`}>
        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{project.name}</CardTitle>
                  <Badge variant={statusColors[project.status] as any}>
                    {project.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                {project.description && (
                  <CardDescription>{project.description}</CardDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {project.crmFileName && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{project.crmFileName}</span>
                  {project.crmRowCount && (
                    <span className="text-xs">
                      ({project.crmRowCount.toLocaleString()} rows)
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Updated {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
              {project.clusters && (
                <span className="text-xs font-medium">
                  {Array.isArray(project.clusters) ? project.clusters.length : 0} clusters
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

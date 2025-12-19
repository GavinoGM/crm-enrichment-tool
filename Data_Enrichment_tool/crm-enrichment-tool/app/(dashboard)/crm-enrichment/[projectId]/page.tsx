import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { crmProjects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import { ClusteringInterface } from "@/components/crm-enrichment/ClusteringInterface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const { projectId } = await params

  const [project] = await db
    .select()
    .from(crmProjects)
    .where(eq(crmProjects.id, projectId))
    .limit(1)

  if (!project || project.userId !== session.user.id) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    draft: "secondary",
    analyzing_crm: "default",
    processing_qualitative: "default",
    social_enrichment: "default",
    generating_personas: "default",
    completed: "default",
    error: "destructive",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crm-enrichment">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant={statusColors[project.status] as any}>
              {project.status.replace(/_/g, " ")}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>CRM File</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{project.crmFileName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {project.crmRowCount?.toLocaleString()} rows
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last Updated</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {project.clusters && project.clusters.length > 0 ? (
        <ClusteringInterface
          clusters={project.clusters as any}
          projectId={project.id}
        />
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Clusters Yet</h3>
              <p className="text-sm text-muted-foreground">
                Complete the clustering step to see your customer segments
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { crmProjects } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ProjectCard } from "@/components/crm-enrichment/ProjectCard"

export default async function CrmEnrichmentPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Fetch user's projects
  const projects = await db
    .select()
    .from(crmProjects)
    .where(eq(crmProjects.userId, session.user.id))
    .orderBy(desc(crmProjects.updatedAt))

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Enrichment Projects</h1>
          <p className="text-muted-foreground">
            Enrich your CRM data with AI-powered behavioral clustering and social insights
          </p>
        </div>
        <Button asChild>
          <Link href="/crm-enrichment/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your first CRM enrichment project to begin analyzing your customer data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/crm-enrichment/new">
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              statusColors={statusColors}
            />
          ))}
        </div>
      )}
    </div>
  )
}

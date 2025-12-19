import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function CrmEnrichmentPage() {
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
    </div>
  )
}

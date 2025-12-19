import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, TrendingUp, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            CRM Enrichment Tool
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your CRM data into actionable insights with AI-powered behavioral clustering and social enrichment
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signin">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Database className="h-8 w-8 mb-2" />
              <CardTitle>CRM Upload</CardTitle>
              <CardDescription>
                Upload and analyze CRM files up to 100k rows
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-2" />
              <CardTitle>Behavioral Clustering</CardTitle>
              <CardDescription>
                AI-powered clustering based on customer behavior
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2" />
              <CardTitle>Social Enrichment</CardTitle>
              <CardDescription>
                Enrich clusters with social media insights
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 mb-2" />
              <CardTitle>Persona Generation</CardTitle>
              <CardDescription>
                Generate detailed customer personas instantly
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Ready to get started?</h2>
              <p className="text-lg opacity-90">
                Sign in now and start enriching your CRM data
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

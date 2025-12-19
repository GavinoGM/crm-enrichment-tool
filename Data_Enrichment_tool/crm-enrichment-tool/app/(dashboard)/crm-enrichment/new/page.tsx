"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CrmUpload } from "@/components/crm-enrichment/CrmUpload"
import { ColumnMappingEditor } from "@/components/crm-enrichment/ColumnMappingEditor"
import type { CrmUploadResponse } from "@/types/crm"
import type { CrmColumnType } from "@/lib/crm/column-detector"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

type WizardStep = 'details' | 'upload' | 'mapping' | 'analyzing'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('details')
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [uploadData, setUploadData] = useState<CrmUploadResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleProjectDetails = () => {
    if (!projectName.trim()) return
    setStep('upload')
  }

  const handleUploadComplete = (data: CrmUploadResponse) => {
    setUploadData(data)
    setStep('mapping')
  }

  const handleMappingComplete = async (mapping: Record<string, CrmColumnType>) => {
    if (!uploadData) return

    setStep('analyzing')
    setAnalyzing(true)

    try {
      const response = await fetch('/api/crm/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: uploadData.projectId,
          columnMapping: mapping,
          analysisOptions: {
            numClusters: 5,
            focusOn: 'behavior',
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()

      // Redirect to project page
      router.push(`/crm-enrichment/${uploadData.projectId}`)
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalyzing(false)
      // TODO: Show error message
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crm-enrichment">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New CRM Enrichment Project</h1>
          <p className="text-muted-foreground">
            Step {step === 'details' ? '1' : step === 'upload' ? '2' : step === 'mapping' ? '3' : '4'} of 4
          </p>
        </div>
      </div>

      {/* Step 1: Project Details */}
      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Give your project a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Project Name *
              </label>
              <Input
                id="name"
                placeholder="e.g., Q4 2024 Customer Segmentation"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="description"
                placeholder="e.g., Analyze customer behavior for holiday campaign targeting"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={handleProjectDetails}
              disabled={!projectName.trim()}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload */}
      {step === 'upload' && (
        <CrmUpload
          projectName={projectName}
          projectDescription={projectDescription}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Step 3: Column Mapping */}
      {step === 'mapping' && uploadData && (
        <ColumnMappingEditor
          columns={uploadData.columns}
          detectedMapping={uploadData.detectedMapping}
          preview={uploadData.preview}
          onComplete={handleMappingComplete}
        />
      )}

      {/* Step 4: Analyzing */}
      {step === 'analyzing' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Analyzing Your CRM Data</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Claude is analyzing your customer data to identify behavioral clusters. This may take a minute...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

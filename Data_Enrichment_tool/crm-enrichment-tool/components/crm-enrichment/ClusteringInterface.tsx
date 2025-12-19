"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClusterCard } from "./ClusterCard"
import type { CrmCluster } from "@/types/crm"
import { RefreshCw } from "lucide-react"

interface ClusteringInterfaceProps {
  clusters: CrmCluster[]
  projectId: string
  onRefine?: (clusters: CrmCluster[]) => void
}

export function ClusteringInterface({ clusters, projectId, onRefine }: ClusteringInterfaceProps) {
  const [selectedClusters, setSelectedClusters] = useState<string[]>([])
  const [refining, setRefining] = useState(false)

  const handleClusterClick = (clusterId: string) => {
    if (selectedClusters.includes(clusterId)) {
      setSelectedClusters(selectedClusters.filter(id => id !== clusterId))
    } else {
      setSelectedClusters([...selectedClusters, clusterId])
    }
  }

  const handleMergeClusters = async () => {
    if (selectedClusters.length < 2) return

    setRefining(true)
    try {
      const response = await fetch('/api/crm/refine-clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          action: 'merge',
          clusterIds: selectedClusters,
        }),
      })

      if (!response.ok) throw new Error('Refinement failed')

      const result = await response.json()
      onRefine?.(result.clusters)
      setSelectedClusters([])
    } catch (error) {
      console.error('Merge error:', error)
    } finally {
      setRefining(false)
    }
  }

  const totalCustomers = clusters.reduce((sum, c) => sum + c.size, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Clusters</CardTitle>
              <CardDescription>
                {clusters.length} clusters identified from {totalCustomers.toLocaleString()} customers
              </CardDescription>
            </div>
            {selectedClusters.length >= 2 && (
              <Button
                onClick={handleMergeClusters}
                disabled={refining}
                variant="outline"
              >
                {refining ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Merging...
                  </>
                ) : (
                  `Merge ${selectedClusters.length} Clusters`
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                onClick={() => handleClusterClick(cluster.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" className="flex-1">
          Refine Clusters
        </Button>
        <Button className="flex-1">
          Continue to Enrichment
        </Button>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import type { CrmCluster } from "@/types/crm"

interface ClusterCardProps {
  cluster: CrmCluster
  onClick?: () => void
}

export function ClusterCard({ cluster, onClick }: ClusterCardProps) {
  return (
    <Card
      className={onClick ? "cursor-pointer hover:border-primary transition-colors" : ""}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{cluster.name}</CardTitle>
          <Badge variant="secondary">
            {cluster.percentage.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{cluster.size.toLocaleString()} customers</span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Behavioral Traits
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(cluster.behavioral_traits).slice(0, 4).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key.replace(/_/g, ' ')}: {String(value)}
              </Badge>
            ))}
          </div>
        </div>

        {cluster.demographic_traits && Object.keys(cluster.demographic_traits).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Demographics
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(cluster.demographic_traits).slice(0, 3).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key.replace(/_/g, ' ')}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

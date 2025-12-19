import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { crmProjects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { refineClusters } from '@/lib/groq/clustering'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, action, clusterIds, newName, splitCriteria } = body

    if (!projectId || !action) {
      return NextResponse.json(
        { error: 'Project ID and action are required' },
        { status: 400 }
      )
    }

    // Get project
    const [project] = await db
      .select()
      .from(crmProjects)
      .where(eq(crmProjects.id, projectId))
      .limit(1)

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!project.clusters) {
      return NextResponse.json({ error: 'No clusters found' }, { status: 400 })
    }

    // Refine clusters using Groq
    const refinedClusters = await refineClusters(project.clusters as any, action, {
      clusterIds,
      newName,
      splitCriteria,
    })

    // Update project
    await db
      .update(crmProjects)
      .set({
        clusters: refinedClusters as any,
        updatedAt: new Date(),
      })
      .where(eq(crmProjects.id, projectId))

    return NextResponse.json({
      projectId,
      clusters: refinedClusters,
    })
  } catch (error) {
    console.error('Cluster refinement error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Refinement failed' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { crmProjects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { parseCrmFile } from '@/lib/crm/parser'
import { generateClusters } from '@/lib/groq/clustering'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, columnMapping, analysisOptions } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
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

    // Update status
    await db
      .update(crmProjects)
      .set({ status: 'analyzing_crm' })
      .where(eq(crmProjects.id, projectId))

    try {
      // Fetch and parse the full CRM file from Vercel Blob
      const fileResponse = await fetch(project.crmFileUrl!)
      const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
      const parsed = await parseCrmFile(fileBuffer)

      // Generate clusters using Groq (Llama 3.1 8B)
      const clusters = await generateClusters({
        data: parsed.rows,
        columnMapping: columnMapping || project.columnMapping || {},
        numClusters: analysisOptions?.numClusters || 5,
        focusOn: analysisOptions?.focusOn || 'behavior',
        analysisMode: analysisOptions?.analysisMode || 'quick_sample',
      })

      // Store clusters in database
      await db
        .update(crmProjects)
        .set({
          clusters: clusters as any,
          columnMapping: columnMapping || project.columnMapping,
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(crmProjects.id, projectId))

      return NextResponse.json({
        projectId,
        clusters,
        status: 'completed',
      })
    } catch (error) {
      // Update project with error
      await db
        .update(crmProjects)
        .set({
          status: 'error',
          errorLog: { message: error instanceof Error ? error.message : 'Unknown error' },
        })
        .where(eq(crmProjects.id, projectId))

      throw error
    }
  } catch (error) {
    console.error('CRM analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

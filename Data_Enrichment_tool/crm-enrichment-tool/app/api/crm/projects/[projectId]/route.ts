import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { crmProjects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { del } from '@vercel/blob'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params

    // Get project to verify ownership and get blob URLs
    const [project] = await db
      .select()
      .from(crmProjects)
      .where(
        and(
          eq(crmProjects.id, projectId),
          eq(crmProjects.userId, session.user.id)
        )
      )
      .limit(1)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete associated blob files
    try {
      if (project.crmFileUrl) {
        await del(project.crmFileUrl)
      }

      // Delete all qualitative files
      if (project.qualitativeFiles && Array.isArray(project.qualitativeFiles)) {
        for (const file of project.qualitativeFiles as Array<{ url: string }>) {
          try {
            await del(file.url)
          } catch (err) {
            console.error('Error deleting qualitative file:', err)
          }
        }
      }
    } catch (blobError) {
      console.error('Error deleting blob files:', blobError)
      // Continue with project deletion even if blob deletion fails
    }

    // Delete project from database
    await db
      .delete(crmProjects)
      .where(
        and(
          eq(crmProjects.id, projectId),
          eq(crmProjects.userId, session.user.id)
        )
      )

    return NextResponse.json({ success: true, message: 'Project deleted' })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete project' },
      { status: 500 }
    )
  }
}

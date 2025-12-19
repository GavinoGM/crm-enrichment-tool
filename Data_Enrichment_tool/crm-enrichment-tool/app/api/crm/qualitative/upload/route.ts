import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { crmProjects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { parseQualitativeFile, validateQualitativeFile } from '@/lib/qualitative/parser'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const projectId = formData.get('projectId') as string
    const file = formData.get('file') as File

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Verify project ownership
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

    // Validate file
    const validation = validateQualitativeFile(file.name, file.size)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Parse file to extract text
    const parsed = await parseQualitativeFile(file)

    // Upload to Vercel Blob
    const blob = await put(`qualitative/${projectId}/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Get existing qualitative files
    const existingFiles = (project.qualitativeFiles || []) as Array<{
      url: string
      name: string
      type: string
      size: number
    }>

    // Add new file to the list
    const newFile = {
      url: blob.url,
      name: file.name,
      type: parsed.fileType,
      size: file.size,
    }

    const updatedFiles = [...existingFiles, newFile]

    // Update project with new file
    await db
      .update(crmProjects)
      .set({
        qualitativeFiles: updatedFiles as any,
        updatedAt: new Date(),
      })
      .where(eq(crmProjects.id, projectId))

    return NextResponse.json({
      success: true,
      file: newFile,
      parsed: {
        fileName: parsed.fileName,
        fileType: parsed.fileType,
        wordCount: parsed.metadata.wordCount,
        charCount: parsed.metadata.charCount,
        contentPreview: parsed.content.substring(0, 200) + '...',
      },
      totalFiles: updatedFiles.length,
    })
  } catch (error) {
    console.error('Qualitative upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

// Delete a qualitative file
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const fileUrl = searchParams.get('fileUrl')

    if (!projectId || !fileUrl) {
      return NextResponse.json(
        { error: 'Project ID and file URL are required' },
        { status: 400 }
      )
    }

    // Verify project ownership
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

    // Get existing files and filter out the one to delete
    const existingFiles = (project.qualitativeFiles || []) as Array<{
      url: string
      name: string
      type: string
      size: number
    }>

    const updatedFiles = existingFiles.filter((f) => f.url !== fileUrl)

    // Delete from blob storage
    try {
      const { del } = await import('@vercel/blob')
      await del(fileUrl)
    } catch (blobError) {
      console.error('Error deleting blob file:', blobError)
      // Continue with database update even if blob deletion fails
    }

    // Update project
    await db
      .update(crmProjects)
      .set({
        qualitativeFiles: updatedFiles as any,
        updatedAt: new Date(),
      })
      .where(eq(crmProjects.id, projectId))

    return NextResponse.json({
      success: true,
      totalFiles: updatedFiles.length,
    })
  } catch (error) {
    console.error('Delete qualitative file error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    )
  }
}

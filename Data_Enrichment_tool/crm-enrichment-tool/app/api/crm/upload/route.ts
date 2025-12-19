import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { crmProjects } from '@/lib/db/schema'
import { parseCrmFile } from '@/lib/crm/parser'
import { detectColumnMappings } from '@/lib/crm/column-detector'
import { uploadFile } from '@/lib/storage/blob'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectName = formData.get('projectName') as string
    const projectDescription = formData.get('projectDescription') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB' },
        { status: 400 }
      )
    }

    // Parse file (preview first 100 rows for performance)
    const parsed = await parseCrmFile(file, { maxRows: 100 })

    // Upload to Vercel Blob for storage
    const { url: fileUrl } = await uploadFile(
      `crm/${session.user.id}/${nanoid()}-${file.name}`,
      file
    )

    // Detect column mappings
    const columnMapping = detectColumnMappings(parsed.columns, parsed.rows)

    // Create project in database
    const [project] = await db
      .insert(crmProjects)
      .values({
        userId: session.user.id,
        name: projectName,
        description: projectDescription || null,
        crmFileUrl: fileUrl,
        crmFileName: file.name,
        crmRowCount: parsed.rowCount,
        columnMapping: columnMapping.detected,
        status: 'draft',
      })
      .returning()

    return NextResponse.json({
      projectId: project.id,
      fileUrl,
      fileName: file.name,
      rowCount: parsed.rowCount,
      columns: parsed.columns,
      preview: parsed.rows,
      detectedMapping: columnMapping.detected,
      suggestions: columnMapping.suggestions,
      unmapped: columnMapping.unmapped,
    })
  } catch (error) {
    console.error('CRM upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

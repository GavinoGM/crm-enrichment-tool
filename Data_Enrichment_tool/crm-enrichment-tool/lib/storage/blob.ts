import { put, del, list } from '@vercel/blob'

export interface UploadOptions {
  addRandomSuffix?: boolean
  contentType?: string
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadFile(
  filename: string,
  file: File | Buffer | Blob,
  options?: UploadOptions
): Promise<{ url: string; pathname: string }> {
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: options?.addRandomSuffix ?? true,
    contentType: options?.contentType,
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
  }
}

/**
 * Delete a file from Vercel Blob storage
 */
export async function deleteFile(url: string): Promise<void> {
  await del(url)
}

/**
 * List files in Vercel Blob storage
 */
export async function listFiles(options?: { prefix?: string; limit?: number }) {
  const { blobs } = await list(options)
  return blobs
}

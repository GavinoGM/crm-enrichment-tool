/**
 * Chunking utilities for handling large CRM files
 */

export interface ChunkOptions {
  chunkSize: number
  onProgress?: (progress: number) => void
}

/**
 * Process data in chunks to avoid memory issues
 */
export async function processInChunks<T, R>(
  data: T[],
  processor: (chunk: T[]) => Promise<R>,
  options: ChunkOptions
): Promise<R[]> {
  const results: R[] = []
  const totalChunks = Math.ceil(data.length / options.chunkSize)

  for (let i = 0; i < data.length; i += options.chunkSize) {
    const chunk = data.slice(i, i + options.chunkSize)
    const result = await processor(chunk)
    results.push(result)

    if (options.onProgress) {
      const progress = Math.min(100, Math.round(((i + options.chunkSize) / data.length) * 100))
      options.onProgress(progress)
    }
  }

  return results
}

/**
 * Stream large files in chunks
 */
export class FileChunker {
  private file: File
  private chunkSize: number

  constructor(file: File, chunkSize: number = 1024 * 1024) { // 1MB default
    this.file = file
    this.chunkSize = chunkSize
  }

  async *chunks(): AsyncGenerator<Buffer> {
    let offset = 0
    while (offset < this.file.size) {
      const chunk = this.file.slice(offset, offset + this.chunkSize)
      const arrayBuffer = await chunk.arrayBuffer()
      yield Buffer.from(arrayBuffer)
      offset += this.chunkSize
    }
  }

  getTotalChunks(): number {
    return Math.ceil(this.file.size / this.chunkSize)
  }
}

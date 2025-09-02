import { uploadToContentful } from '../../services/contentful'
import { createMediaRecord, getMediaByFolder } from '../../modules/database'
import { generateId } from '../utils'

export type UploadResponse = {
  success: boolean
  data?: {
    id: string
    url: string
    filename: string
    folderId: number
    orderIndex: number
  }
  error?: string
}

export const uploadMediaFiles = async (
  files: File[],
  folderId: number,
  layout: string = 'grid'
): Promise<UploadResponse[]> => {
  try {
    if (!files.length || !folderId) {
      return [{
        success: false,
        error: 'Files and folder ID are required'
      }]
    }

    const existingMedia = await getMediaByFolder(folderId)
    const startOrderIndex = existingMedia.length

    const results: UploadResponse[] = []

    for (const [index, file] of files.entries()) {
      try {
        const mediaId = generateId()
        const filename = `${mediaId}-${file.name}`
        
        const contentfulResult = await uploadToContentful(file, filename)
        
        const mediaRecord = await createMediaRecord({
          id: mediaId,
          folderId,
          mediaUrl: contentfulResult.url,
          orderIndex: startOrderIndex + index,
          layout
        })

        results.push({
          success: true,
          data: {
            id: mediaRecord.id,
            url: mediaRecord.media_url,
            filename: contentfulResult.filename,
            folderId: mediaRecord.folder_id,
            orderIndex: mediaRecord.order_index
          }
        })
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        })
      }
    }

    return results
  } catch (error) {
    return [{
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }]
  }
}
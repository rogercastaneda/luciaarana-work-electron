import { uploadToContentful } from '../../services/contentful'
import { uploadToR2 } from '../../services/r2'
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

const isVideo = (file: File): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.m4v', '.avi', '.mkv']
  const videoMimeTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']

  const fileName = file.name.toLowerCase()
  const hasVideoExtension = videoExtensions.some(ext => fileName.endsWith(ext))
  const hasVideoMimeType = videoMimeTypes.includes(file.type)

  return hasVideoExtension || hasVideoMimeType
}

const uploadSingleFile = async (
  file: File,
  index: number,
  folderId: number,
  startOrderIndex: number,
  layout: string
): Promise<UploadResponse> => {
  try {
    const mediaId = generateId()
    const filename = `${mediaId}-${file.name}`

    const uploadResult = isVideo(file)
      ? await uploadToR2(file, filename)
      : await uploadToContentful(file, filename)

    if (!uploadResult.url) {
      throw new Error('Failed to get URL from upload')
    }

    const mediaRecord = await createMediaRecord({
      id: mediaId,
      folderId,
      mediaUrl: uploadResult.url,
      orderIndex: startOrderIndex + index,
      layout
    })

    return {
      success: true,
      data: {
        id: mediaRecord.id,
        url: mediaRecord.media_url,
        filename: uploadResult.filename,
        folderId: mediaRecord.folder_id,
        orderIndex: mediaRecord.order_index
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

export const uploadMediaFiles = async (
  files: File[],
  folderId: number,
  layout: string = 'grid'
): Promise<UploadResponse[]> => {
  if (!files.length || !folderId) {
    return [{
      success: false,
      error: 'Files and folder ID are required'
    }]
  }

  const existingMedia = await getMediaByFolder(folderId)
  const startOrderIndex = existingMedia.length

  const uploadPromises = files.map((file, index) =>
    uploadSingleFile(file, index, folderId, startOrderIndex, layout)
  )

  return Promise.all(uploadPromises)
}
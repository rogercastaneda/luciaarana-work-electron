import { uploadToContentful as uploadService, type UploadResult } from "@/services/contentful"

export interface ContentfulUploadResult {
  assetId: string
  url: string | null
  filename: string
  contentType: string
}

export async function uploadToContentful(file: File, filename: string): Promise<ContentfulUploadResult> {
  try {
    const result: UploadResult = await uploadService(file, filename)
    
    return {
      assetId: result.assetId,
      url: result.url,
      filename: result.filename,
      contentType: result.contentType,
    }
  } catch (error) {
    console.error("Error uploading to Contentful:", error)
    throw new Error("Failed to upload to Contentful")
  }
}

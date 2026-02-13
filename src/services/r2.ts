export interface R2UploadResult {
  url: string
  filename: string
  contentType: string
}

export const uploadToR2 = async (file: File, filename: string): Promise<R2UploadResult> => {
  try {
    console.log(`Uploading ${filename} to R2 via IPC...`)

    const arrayBuffer = await file.arrayBuffer()

    const response = await window.r2Api.upload(arrayBuffer, filename, file.type)

    if (!response.success || !response.data) {
      throw new Error(response.error || "Upload failed")
    }

    console.log(`Successfully uploaded to R2: ${response.data.url}`)

    return response.data
  } catch (error) {
    console.error("Error uploading to R2:", error)
    throw new Error(
      `Failed to upload to R2: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

export const deleteFromR2 = async (filename: string): Promise<boolean> => {
  try {
    const response = await window.r2Api.delete(filename)

    if (response.success) {
      console.log(`Successfully deleted from R2: ${filename}`)
    }

    return response.success
  } catch (error) {
    console.error("Error deleting from R2:", error)
    return false
  }
}

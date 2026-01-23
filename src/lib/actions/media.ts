import {
  getMediaByFolder,
  updateMediaOrder,
  updateMediaLayout,
  updateMediaVideoStartTime,
  deleteMediaRecord,
  type MediaRecord
} from '../../modules/database'

export const getMediaForFolder = async (folderId: number): Promise<MediaRecord[]> => {
  return await getMediaByFolder(folderId)
}

export const updateMediaOrderAction = async (
  id: string, 
  orderIndex: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateMediaOrder({ id, orderIndex })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order'
    }
  }
}

export const updateMediaLayoutAction = async (
  id: string,
  layout: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateMediaLayout(id, layout)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update layout'
    }
  }
}

export const updateMediaVideoStartTimeAction = async (
  id: string,
  startTime: number
): Promise<{ success: boolean; error?: string }> => {
  console.log('[updateMediaVideoStartTimeAction] Called with:', { id, startTime, type: typeof startTime })
  try {
    const result = await updateMediaVideoStartTime(id, startTime)
    console.log('[updateMediaVideoStartTimeAction] Query result:', result)
    return { success: true }
  } catch (error) {
    console.error('[updateMediaVideoStartTimeAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update video start time'
    }
  }
}

export const deleteMediaAction = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteMediaRecord(id)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete media'
    }
  }
}
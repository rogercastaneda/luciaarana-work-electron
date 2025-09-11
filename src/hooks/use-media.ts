import { useState, useEffect, useCallback } from 'react'
import { 
  getMediaForFolder, 
  updateMediaOrderAction, 
  updateMediaLayoutAction,
  deleteMediaAction 
} from '../lib/actions'
import type { MediaRecord } from '../modules/database'

type UseMediaState = {
  media: MediaRecord[]
  loading: boolean
  error: string | null
}

export const useMedia = (selectedFolderId?: number) => {
  const [state, setState] = useState<UseMediaState>({
    media: [],
    loading: true,
    error: null
  })

  const loadMedia = useCallback(async (folderId: number) => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      const media = await getMediaForFolder(folderId)
      setState(prev => ({
        ...prev,
        media,
        loading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load media'
      }))
    }
  }, [])

  const updateOrder = useCallback(async (id: string, orderIndex: number) => {
    try {
      const result = await updateMediaOrderAction(id, orderIndex)
      
      if (result.success && selectedFolderId) {
        await loadMedia(selectedFolderId)
      } else if (!result.success) {
        setState(prev => ({ ...prev, error: result.error || 'Failed to update order' }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update order'
      }))
    }
  }, [selectedFolderId, loadMedia])

  const updateLayout = useCallback(async (id: string, layout: string) => {
    try {
      const result = await updateMediaLayoutAction(id, layout)
      
      if (result.success && selectedFolderId) {
        await loadMedia(selectedFolderId)
      } else if (!result.success) {
        setState(prev => ({ ...prev, error: result.error || 'Failed to update layout' }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update layout'
      }))
    }
  }, [selectedFolderId, loadMedia])

  const deleteMedia = useCallback(async (id: string) => {
    try {
      const result = await deleteMediaAction(id)
      
      if (result.success && selectedFolderId) {
        await loadMedia(selectedFolderId)
      } else if (!result.success) {
        setState(prev => ({ ...prev, error: result.error || 'Failed to delete media' }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete media'
      }))
    }
  }, [selectedFolderId, loadMedia])

  const refresh = useCallback(async () => {
    if (selectedFolderId) {
      await loadMedia(selectedFolderId)
    }
  }, [loadMedia, selectedFolderId])

  useEffect(() => {
    if (selectedFolderId) {
      loadMedia(selectedFolderId)
    }
  }, [selectedFolderId, loadMedia])

  return {
    ...state,
    updateOrder,
    updateLayout,
    deleteMedia,
    refresh
  }
}
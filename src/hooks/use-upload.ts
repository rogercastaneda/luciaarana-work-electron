import { useState, useCallback } from 'react'
import { uploadMediaFiles, type UploadResponse } from '../lib/actions'

interface UseUploadOptions {
  onSuccess?: (results: UploadResponse[]) => void
  onError?: (error: string) => void
}

interface UseUploadState {
  isUploading: boolean
  progress: number
  error: string | null
  results: UploadResponse[]
}

export const useUpload = (options: UseUploadOptions = {}) => {
  const [state, setState] = useState<UseUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    results: []
  })

  const upload = useCallback(async (
    files: File[],
    folderId: number,
    layout: string = 'grid'
  ) => {
    if (!files.length || !folderId) {
      const error = 'Files and folder ID are required'
      setState(prev => ({ ...prev, error }))
      options.onError?.(error)
      return
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      results: []
    }))

    try {
      setState(prev => ({ ...prev, progress: 50 }))

      const results = await uploadMediaFiles(files, folderId, layout)

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        results
      }))

      const hasErrors = results.some(result => !result.success)
      
      if (hasErrors) {
        const firstError = results.find(result => !result.success)?.error
        setState(prev => ({ ...prev, error: firstError || 'Upload failed' }))
        options.onError?.(firstError || 'Upload failed')
      } else {
        options.onSuccess?.(results)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }))
      options.onError?.(errorMessage)
    }
  }, [options])

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      results: []
    })
  }, [])

  return {
    ...state,
    upload,
    reset
  }
}
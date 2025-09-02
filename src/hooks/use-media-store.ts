"use client"

import { useState, useCallback } from "react"
import { mediaStore } from "@/lib/media-store"
import type { MediaFile, ImageMetadata, VideoMetadata, ViewSettings } from "@/lib/types"

export function useMediaStore() {
  const [currentFolderId, setCurrentFolderId] = useState<string>("root")
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    mode: "grid",
    sortBy: "name",
    sortOrder: "asc",
  })

  const getCurrentFolder = useCallback(() => {
    return mediaStore.getFolder(currentFolderId)
  }, [currentFolderId])

  const getFolderContents = useCallback(() => {
    return mediaStore.getFolderContents(currentFolderId)
  }, [currentFolderId])

  const createFolder = useCallback(
    (name: string) => {
      return mediaStore.createFolder(name, currentFolderId)
    },
    [currentFolderId],
  )

  const deleteFolder = useCallback((id: string) => {
    return mediaStore.deleteFolder(id)
  }, [])

  const renameFolder = useCallback((id: string, newName: string) => {
    return mediaStore.renameFolder(id, newName)
  }, [])

  const addFile = useCallback(
    (file: Omit<MediaFile, "id" | "createdAt" | "updatedAt" | "folderId">) => {
      return mediaStore.addFile({ ...file, folderId: currentFolderId })
    },
    [currentFolderId],
  )

  const updateFileMetadata = useCallback((id: string, metadata: ImageMetadata | VideoMetadata) => {
    return mediaStore.updateFileMetadata(id, metadata)
  }, [])

  const deleteFile = useCallback((id: string) => {
    return mediaStore.deleteFile(id)
  }, [])

  const navigateToFolder = useCallback((folderId: string) => {
    setCurrentFolderId(folderId)
  }, [])

  const getFolderTree = useCallback(() => {
    return mediaStore.getFolderTree()
  }, [])

  const searchFiles = useCallback((query: string) => {
    return mediaStore.searchFiles(query)
  }, [])

  return {
    currentFolderId,
    viewSettings,
    setViewSettings,
    getCurrentFolder,
    getFolderContents,
    createFolder,
    deleteFolder,
    renameFolder, // Added renameFolder to exports
    addFile,
    updateFileMetadata,
    deleteFile,
    navigateToFolder,
    getFolderTree,
    searchFiles,
  }
}

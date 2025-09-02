"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Upload, X, ImageIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMediaStore } from "@/hooks/use-media-store"
import { cn } from "@/lib/utils"
import type { ImageMetadata, VideoMetadata } from "@/lib/types"

interface FileUploadProps {
  onUploadComplete?: () => void
}

interface UploadFile extends File {
  id: string
  preview?: string
  metadata?: ImageMetadata | VideoMetadata
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addFile } = useMediaStore()

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))

    const processedFiles: UploadFile[] = []

    for (const file of validFiles) {
      const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const uploadFile: UploadFile = Object.assign(file, { id })

      // Create preview for images
      if (file.type.startsWith("image/")) {
        uploadFile.preview = URL.createObjectURL(file)

        // Extract image metadata
        const img = new Image()
        img.onload = () => {
          const orientation = img.width > img.height ? "landscape" : img.width < img.height ? "portrait" : "square"

          uploadFile.metadata = {
            alt: file.name.replace(/\.[^/.]+$/, ""),
            title: file.name.replace(/\.[^/.]+$/, ""),
            orientation,
            width: img.width,
            height: img.height,
            tags: [],
            description: "",
          }
        }
        img.src = uploadFile.preview
      } else if (file.type.startsWith("video/")) {
        // Extract video metadata
        const video = document.createElement("video")
        video.onloadedmetadata = () => {
          uploadFile.metadata = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            tags: [],
            description: "",
          }
        }
        video.src = URL.createObjectURL(file)
      }

      processedFiles.push(uploadFile)
    }

    setUploadFiles((prev) => [...prev, ...processedFiles])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        processFiles(files)
      }
    },
    [processFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFiles(files)
      }
    },
    [processFiles],
  )

  const removeFile = useCallback((id: string) => {
    setUploadFiles((prev) => {
      const updated = prev.filter((file) => file.id !== id)
      // Clean up preview URLs
      const fileToRemove = prev.find((file) => file.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }, [])

  const handleUpload = useCallback(async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)

    try {
      for (const file of uploadFiles) {
        // In a real app, you would upload to a server here
        // For now, we'll simulate the upload and use object URLs
        const url = URL.createObjectURL(file)

        await addFile({
          name: file.name,
          type: file.type.startsWith("image/") ? "image" : "video",
          url,
          size: file.size,
          metadata: file.metadata,
        })
      }

      // Clear upload files
      uploadFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      setUploadFiles([])

      onUploadComplete?.()
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }, [uploadFiles, addFile, onUploadComplete])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Arrastra archivos aquí</h3>
        <p className="text-muted-foreground mb-4">o haz clic para seleccionar imágenes y videos</p>
        <Button variant="outline">Seleccionar Archivos</Button>
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File Preview List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Archivos seleccionados ({uploadFiles.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {file.type.startsWith("image/") ? (
                    file.preview ? (
                      <img
                        src={file.preview || "/placeholder.svg"}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )
                  ) : (
                    <Video className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
              {isUploading ? "Subiendo..." : `Subir ${uploadFiles.length} archivo${uploadFiles.length > 1 ? "s" : ""}`}
            </Button>
            <Button variant="outline" onClick={() => setUploadFiles([])} disabled={isUploading}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

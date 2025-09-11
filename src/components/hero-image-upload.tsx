"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadToContentful } from "@/services/contentful"

interface HeroImageUploadProps {
  value?: string | null
  onChange: (imageUrl: string | null) => void
  onUploadingChange?: (isUploading: boolean) => void
  className?: string
}

export function HeroImageUpload({ value, onChange, onUploadingChange, className }: HeroImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se permiten archivos de imagen")
      return
    }

    setIsUploading(true)
    setUploadError(null)
    onUploadingChange?.(true)
    
    try {
      // Create preview immediately
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Generate filename with timestamp to avoid conflicts
      const timestamp = Date.now()
      const extension = file.name.split('.').pop() || 'jpg'
      const filename = `hero-image-${timestamp}.${extension}`

      // Upload to Contentful
      console.log("Uploading hero image to Contentful...")
      const result = await uploadToContentful(file, filename)
      
      if (result.url) {
        // Clean up preview blob URL since we have the Contentful URL
        URL.revokeObjectURL(preview)
        setPreviewUrl(result.url)
        onChange(result.url)
        console.log("Hero image uploaded successfully:", result.url)
      } else {
        throw new Error("No URL returned from Contentful")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      setUploadError(error instanceof Error ? error.message : 'Error al subir la imagen')
      // Keep the preview on error, but don't save to database
      onChange(null)
    } finally {
      setIsUploading(false)
      onUploadingChange?.(false)
    }
  }, [onChange])

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
        processFile(files[0])
      }
    },
    [processFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile],
  )

  const removeImage = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setUploadError(null)
    onChange(null)
  }, [previewUrl, onChange])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // Update preview when value prop changes
  useEffect(() => {
    setPreviewUrl(value || null)
    setUploadError(null)
  }, [value])

  return (
    <div className={cn("space-y-4", className)}>
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Hero image preview"
            className="w-full h-32 object-cover rounded-lg border-2 border-dashed border-muted-foreground/25"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Imagen Hero (Opcional)</p>
          <p className="text-xs text-muted-foreground mb-3">Arrastra una imagen o haz clic para seleccionar</p>
          <Button variant="outline" size="sm" disabled={isUploading}>
            {isUploading ? "Subiendo..." : "Seleccionar Imagen"}
          </Button>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
          {uploadError}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { useUpload } from "@/hooks/use-upload"
import { useMedia } from "@/hooks/use-media"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Video, Star, GripVertical, Loader2, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type PendingFile = {
  file: File
  preview?: string
  id: string
  type: 'image' | 'video'
  orientation?: 'horizontal' | 'vertical'
}

type MediaDropZoneProps = {
  folderId: number
  layout?: string
}

export function MediaDropZone({ folderId, layout = 'grid' }: MediaDropZoneProps) {
  const { media, loading: mediaLoading, refresh, updateOrder, deleteMedia } = useMedia(folderId)
  const { upload, isUploading, progress, error, reset } = useUpload({
    onSuccess: () => {
      setPendingFiles([])
      refresh()
    },
    onError: (error) => {
      console.error('Upload failed:', error)
    }
  })

  const [isDragOver, setIsDragOver] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showOrientationModal, setShowOrientationModal] = useState(false)
  const [selectedOrientation, setSelectedOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    dragCounter.current = 0
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files)
    }
  }, [])

  const processFiles = useCallback((fileList: FileList) => {
    const newPendingFiles: PendingFile[] = []

    Array.from(fileList).forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file)
        newPendingFiles.push({ file, preview, id, type: 'image' })
      } else if (file.type.startsWith("video/")) {
        newPendingFiles.push({ file, id, type: 'video' })
      }
    })

    if (newPendingFiles.length > 0) {
      setPendingFiles(newPendingFiles)
      const firstImageIndex = newPendingFiles.findIndex(f => f.type === 'image')
      if (firstImageIndex >= 0) {
        setCurrentImageIndex(firstImageIndex)
        setShowOrientationModal(true)
      } else {
        // Solo videos, subir directamente
        handleUploadAllFiles(newPendingFiles)
      }
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }, [processFiles])

  const handleRemovePending = useCallback((fileId: string) => {
    const file = pendingFiles.find(f => f.id === fileId)
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setPendingFiles(prev => prev.filter(f => f.id !== fileId))
  }, [pendingFiles])

  const handleUploadAllFiles = useCallback(async (files: PendingFile[]) => {
    const fileObjects = files.map(pf => pf.file)
    await upload(fileObjects, folderId, layout)
  }, [folderId, layout, upload])

  const handleOrientationConfirm = useCallback(() => {
    const currentFile = pendingFiles[currentImageIndex]
    if (currentFile) {
      // Guardar orientación en el archivo actual
      const updatedFiles = [...pendingFiles]
      updatedFiles[currentImageIndex] = { ...currentFile, orientation: selectedOrientation }
      setPendingFiles(updatedFiles)

      // Buscar la siguiente imagen
      const nextImageIndex = updatedFiles.findIndex((f, index) => 
        index > currentImageIndex && f.type === 'image' && !f.orientation
      )

      if (nextImageIndex >= 0) {
        setCurrentImageIndex(nextImageIndex)
        setSelectedOrientation('horizontal')
      } else {
        // No hay más imágenes, proceder con el upload
        setShowOrientationModal(false)
        handleUploadAllFiles(updatedFiles)
      }
    }
  }, [pendingFiles, currentImageIndex, selectedOrientation, handleUploadAllFiles])

  const handleCancelUpload = useCallback(() => {
    pendingFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setPendingFiles([])
    setShowOrientationModal(false)
    setCurrentImageIndex(0)
    reset()
  }, [pendingFiles, reset])

  // Handlers para drag & drop de reordenamiento
  const handleMediaDragStart = useCallback((e: React.DragEvent, mediaId: string) => {
    setDraggedItem(mediaId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleMediaDragOver = useCallback((e: React.DragEvent, mediaId: string) => {
    e.preventDefault()
    if (draggedItem && draggedItem !== mediaId) {
      setDragOverItem(mediaId)
    }
  }, [draggedItem])

  const handleMediaDragLeave = useCallback(() => {
    setDragOverItem(null)
  }, [])

  const handleMediaDrop = useCallback(async (e: React.DragEvent, targetMediaId: string) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem === targetMediaId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedMedia = media.find(m => m.id === draggedItem)
    const targetMedia = media.find(m => m.id === targetMediaId)

    if (draggedMedia && targetMedia) {
      // Intercambiar los order_index
      await updateOrder(draggedMedia.id, targetMedia.order_index)
      await updateOrder(targetMedia.id, draggedMedia.order_index)
    }

    setDraggedItem(null)
    setDragOverItem(null)
  }, [draggedItem, media, updateOrder])

  const handleDeleteMedia = useCallback(async (mediaId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      await deleteMedia(mediaId)
    }
  }, [deleteMedia])

  const imageFiles = media.filter(m => m.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  const videoFiles = media.filter(m => m.media_url.match(/\.(mp4|webm|ogg|mov)$/i))

  return (
    <div className="h-full flex flex-col">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium">
              {isUploading
                ? "Subiendo archivos..."
                : isDragOver
                  ? "Suelta los archivos aquí"
                  : "Arrastra imágenes y videos aquí"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isUploading ? `Progreso: ${progress}%` : "O haz clic para seleccionar archivos"}
            </p>
          </div>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            disabled={isUploading}
          >
            {isUploading ? "Subiendo..." : "Seleccionar archivos"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
      </div>

      {(imageFiles.length > 0 || videoFiles.length > 0) && (
        <div className="mt-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Archivos multimedia</h3>
            <div className="text-sm text-muted-foreground">
              {imageFiles.length} imágenes, {videoFiles.length} videos
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {media.map((file) => (
              <Card 
                key={file.id} 
                className={cn(
                  "relative group overflow-hidden transition-all",
                  draggedItem === file.id && "opacity-50 scale-95",
                  dragOverItem === file.id && "ring-2 ring-primary ring-offset-2"
                )}
                draggable
                onDragStart={(e) => handleMediaDragStart(e, file.id)}
                onDragOver={(e) => handleMediaDragOver(e, file.id)}
                onDragLeave={handleMediaDragLeave}
                onDrop={(e) => handleMediaDrop(e, file.id)}
              >
                <div className="aspect-square relative">
                  {file.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img 
                      src={file.media_url} 
                      alt={`Media ${file.id}`} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <Badge variant="secondary" className="absolute top-2 right-2">
                    #{file.order_index}
                  </Badge>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <div className="cursor-move p-2 bg-white/10 rounded-md backdrop-blur-sm">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMedia(file.id)
                      }}
                      className="p-2 bg-red-500/80 rounded-md backdrop-blur-sm hover:bg-red-600/80 transition-colors"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-2">
                  <p className="text-xs font-medium truncate">Media {file.id}</p>
                  <p className="text-xs text-muted-foreground">Layout: {file.layout}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showOrientationModal} onOpenChange={() => !isUploading && setShowOrientationModal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {isUploading ? "Subiendo imagen..." : "¿Cómo quieres mostrar esta imagen?"}
            </DialogTitle>
          </DialogHeader>

          {pendingFiles[currentImageIndex] && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <img
                  src={pendingFiles[currentImageIndex].preview || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-48 max-h-48 object-contain rounded-lg border"
                />
              </div>

              {!isUploading && (
                <div className="space-y-4">
                  <Label className="text-sm text-muted-foreground text-center block">
                    Selecciona la orientación que mejor se adapte a tu diseño
                  </Label>

                  <RadioGroup
                    value={selectedOrientation}
                    onValueChange={(value) => setSelectedOrientation(value as "horizontal" | "vertical")}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="horizontal" id="horizontal" />
                      <div className="flex-1">
                        <Label htmlFor="horizontal" className="font-medium cursor-pointer">
                          Horizontal (Paisaje)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ideal para banners, encabezados y contenido ancho
                        </p>
                      </div>
                      <div className="w-8 h-6 bg-muted rounded border flex-shrink-0" />
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="vertical" id="vertical" />
                      <div className="flex-1">
                        <Label htmlFor="vertical" className="font-medium cursor-pointer">
                          Vertical (Retrato)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Perfecto para perfiles, tarjetas y contenido alto
                        </p>
                      </div>
                      <div className="w-6 h-8 bg-muted rounded border flex-shrink-0" />
                    </div>
                  </RadioGroup>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Subiendo a Contentful y guardando en base de datos... {progress}%
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleOrientationConfirm}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
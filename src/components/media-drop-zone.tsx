"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { useUpload } from "@/hooks/use-upload"
import { useMedia } from "@/hooks/use-media"
import { updateMediaVideoStartTimeAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Video, Star, GripVertical, Loader2, X, Trash2, RotateCw, GalleryHorizontal, GalleryVertical, Grid2X2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type PendingFile = {
  file: File
  preview?: string
  id: string
  type: 'image' | 'video'
  orientation?: 'horizontal' | 'vertical' | 'double'
}

type MediaDropZoneProps = {
  folderId: number
  layout?: string
}

export function MediaDropZone({ folderId, layout = 'grid' }: MediaDropZoneProps) {
  const { media, loading: mediaLoading, refresh, updateOrder, updateLayout, deleteMedia } = useMedia(folderId)
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
  const [selectedOrientation, setSelectedOrientation] = useState<'horizontal' | 'vertical' | 'double'>('vertical')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [isVideoTimeDialogOpen, setIsVideoTimeDialogOpen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [videoStartTime, setVideoStartTime] = useState<string>('00:00')
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

  const handleUploadAllFiles = useCallback(async (files: PendingFile[], targetFolderId: number) => {
    // Enviar archivos con sus orientaciones específicas
    for (const pendingFile of files) {
      const orientation = pendingFile.orientation || 'vertical' // default para videos
      await upload([pendingFile.file], targetFolderId, orientation)
    }
  }, [upload])

  const processFiles = useCallback((fileList: FileList) => {
    const newPendingFiles: PendingFile[] = []
    const rejectedFiles: Array<{name: string, size: number, reason: string}> = []

    Array.from(fileList).forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      const fileSizeMB = file.size / (1024 * 1024)

      // Check file size limits
      if (fileSizeMB > 50) {
        rejectedFiles.push({
          name: file.name,
          size: fileSizeMB,
          reason: `File too large (${fileSizeMB.toFixed(2)} MB). Free tier limit: 50 MB`
        })
        return
      }

      if (fileSizeMB > 40) {
        console.warn(`Large file detected: ${file.name} (${fileSizeMB.toFixed(2)} MB). This may fail if you're on Contentful free tier.`)
      }

      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file)
        newPendingFiles.push({ file, preview, id, type: 'image' })
      } else if (file.type.startsWith("video/")) {
        newPendingFiles.push({ file, id, type: 'video' })
      }
    })

    // Show rejected files alert
    if (rejectedFiles.length > 0) {
      const message = rejectedFiles.map(f => `• ${f.name} (${f.size.toFixed(2)} MB)`).join('\n')
      alert(`Some files were rejected:\n\n${message}\n\nContentful free tier has a 50 MB file size limit. Consider upgrading to a paid plan for files up to 1000 MB.`)
    }

    if (newPendingFiles.length > 0) {
      setPendingFiles(newPendingFiles)
      const firstImageIndex = newPendingFiles.findIndex(f => f.type === 'image')
      if (firstImageIndex >= 0) {
        setCurrentImageIndex(firstImageIndex)
        setShowOrientationModal(true)
      } else {
        // Solo videos, subir directamente
        handleUploadAllFiles(newPendingFiles, folderId)
      }
    }
  }, [folderId, handleUploadAllFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    dragCounter.current = 0
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

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
        setSelectedOrientation('vertical')
      } else {
        // No hay más imágenes, proceder con el upload
        setShowOrientationModal(false)
        handleUploadAllFiles(updatedFiles, folderId)
      }
    }
  }, [pendingFiles, currentImageIndex, selectedOrientation, folderId])

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

  const handleLayoutChange = useCallback(async (mediaId: string, currentLayout: string) => {
    const newLayout = currentLayout === 'horizontal'
      ? 'vertical'
      : currentLayout === 'vertical'
        ? 'double'
        : 'horizontal'
    await updateLayout(mediaId, newLayout)
  }, [updateLayout])

  const handleSaveVideoStartTime = useCallback(async () => {
    if (!selectedVideoId) return

    console.log('[MediaDropZone] Saving video start time:', {
      selectedVideoId,
      videoStartTime,
      rawInput: videoStartTime
    })

    // Parse MM:SS format to seconds
    const [minutes, seconds] = videoStartTime.split(':').map(Number)

    console.log('[MediaDropZone] Parsed values:', {
      minutes,
      seconds,
      isMinutesNaN: isNaN(minutes),
      isSecondsNaN: isNaN(seconds)
    })

    if (isNaN(minutes) || isNaN(seconds)) {
      alert('Formato inválido. Use MM:SS (ejemplo: 01:30)')
      return
    }

    const totalSeconds = (minutes * 60) + seconds

    console.log('[MediaDropZone] Calculated totalSeconds:', totalSeconds)

    try {
      console.log('[MediaDropZone] Calling updateMediaVideoStartTimeAction with:', {
        mediaId: selectedVideoId,
        startTime: totalSeconds
      })

      const result = await updateMediaVideoStartTimeAction(selectedVideoId, totalSeconds)

      console.log('[MediaDropZone] Update result:', result)

      if (result.success) {
        setIsVideoTimeDialogOpen(false)
        setSelectedVideoId(null)
        setVideoStartTime('00:00')
        refresh()
      } else {
        alert(`Error al guardar el tiempo de inicio: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving video start time:', error)
      alert('Error al guardar el tiempo de inicio')
    }
  }, [selectedVideoId, videoStartTime, refresh])

  const imageFiles = media.filter(m => m.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  const videoFiles = media.filter(m => m.media_url.match(/\.(mp4|m4v|webm|ogg|mov)$/i))

  return (
    <div className="flex flex-col h-full">
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
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
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
            <p className="mt-1 text-sm text-muted-foreground">
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
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>
      </div>

      {(imageFiles.length > 0 || videoFiles.length > 0) && (
        <div className="flex-1 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Archivos multimedia</h3>
            <div className="text-sm text-muted-foreground">
              {imageFiles.length} imágenes, {videoFiles.length} videos
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
                <div className="relative aspect-square w-full h-48 overflow-hidden">
                  {file.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={file.media_url}
                      alt={`Media ${file.id}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <video
                        src={file.media_url}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = 0
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
                        <div className="p-3 rounded-full bg-black/50 backdrop-blur-sm">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </>
                  )}

                  <Badge variant="secondary" className="absolute top-2 right-2">
                    #{file.order_index}
                  </Badge>

                  <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                    <div className="p-2 rounded-md cursor-move bg-white/10 backdrop-blur-sm">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLayoutChange(file.id, file.layout)
                      }}
                      className="p-2 transition-colors rounded-md bg-blue-500/80 backdrop-blur-sm hover:bg-blue-600/80"
                      title={`Cambiar a ${file.layout === 'horizontal' ? 'vertical' : file.layout === 'vertical' ? 'double' : 'horizontal'}`}
                    >
                      {file.layout === 'horizontal' ? (
                        <GalleryVertical className="w-4 h-4 text-white" />
                      ) : file.layout === 'vertical' ? (
                        <Grid2X2 className="w-4 h-4 text-white" />
                      ) : (
                        <GalleryHorizontal className="w-4 h-4 text-white" />
                      )}
                    </button>
                    {/* Only show for video files */}
                    {file.media_url.match(/\.(mp4|m4v|webm|ogg|mov)$/i) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const currentTime = file.video_start_time || 0
                          const minutes = Math.floor(currentTime / 60)
                          const seconds = currentTime % 60
                          setVideoStartTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
                          setSelectedVideoId(file.id)
                          setIsVideoTimeDialogOpen(true)
                        }}
                        className="p-2 transition-colors rounded-md bg-purple-500/80 backdrop-blur-sm hover:bg-purple-600/80"
                        title="Configurar tiempo de inicio"
                      >
                        <Clock className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMedia(file.id)
                      }}
                      className="p-2 transition-colors rounded-md bg-red-500/80 backdrop-blur-sm hover:bg-red-600/80"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
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
                  className="object-contain border rounded-lg max-w-48 max-h-48"
                />
              </div>

              {!isUploading && (
                <div className="space-y-4">
                  <Label className="block text-sm text-center text-muted-foreground">
                    Selecciona la orientación que mejor se adapte a tu diseño
                  </Label>

                  <RadioGroup
                    value={selectedOrientation}
                    onValueChange={(value) => setSelectedOrientation(value as "horizontal" | "vertical" | "double")}
                    className="space-y-3"
                  >
                    <div className="flex items-center p-3 space-x-3 transition-colors border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="horizontal" id="horizontal" />
                      <div className="flex-1">
                        <Label htmlFor="horizontal" className="font-medium cursor-pointer">
                          Horizontal
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ideal para banners, encabezados y contenido ancho
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-8 h-6 border rounded bg-muted" />
                    </div>

                    <div className="flex items-center p-3 space-x-3 transition-colors border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="vertical" id="vertical" />
                      <div className="flex-1">
                        <Label htmlFor="vertical" className="font-medium cursor-pointer">
                          Vertical
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Perfecto para perfiles, tarjetas y contenido alto
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-6 h-8 border rounded bg-muted" />
                    </div>

                    <div className="flex items-center p-3 space-x-3 transition-colors border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="double" id="double" />
                      <div className="flex-1">
                        <Label htmlFor="double" className="font-medium cursor-pointer">
                          Double
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ideal para galerías y contenido que ocupa doble espacio
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 border rounded bg-muted" />
                    </div>
                  </RadioGroup>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Start Time Dialog */}
      <Dialog open={isVideoTimeDialogOpen} onOpenChange={setIsVideoTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Tiempo de Inicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="video-time">Tiempo de inicio (MM:SS)</Label>
              <Input
                id="video-time"
                value={videoStartTime}
                onChange={(e) => setVideoStartTime(e.target.value)}
                placeholder="00:00"
                pattern="[0-9]{2}:[0-9]{2}"
                maxLength={5}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Formato: Minutos:Segundos (ejemplo: 01:30 para 1 minuto 30 segundos)
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsVideoTimeDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveVideoStartTime}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
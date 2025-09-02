"use client"

import { useState } from "react"
import { Upload, Grid3X3, List, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileUpload } from "@/components/file-upload"
import { useMediaStore } from "@/hooks/use-media-store"
import type { ViewMode, SortBy } from "@/lib/types"

export function Toolbar() {
  const { viewSettings, setViewSettings } = useMediaStore()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const handleViewModeChange = (mode: ViewMode) => {
    setViewSettings({ ...viewSettings, mode })
  }

  const handleSortChange = (sortBy: SortBy) => {
    const sortOrder = viewSettings.sortBy === sortBy && viewSettings.sortOrder === "asc" ? "desc" : "asc"
    setViewSettings({ ...viewSettings, sortBy, sortOrder })
  }

  const handleUploadComplete = () => {
    setIsUploadDialogOpen(false)
    // Optionally refresh the view or show a success message
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Subir Imágenes y Videos</DialogTitle>
            </DialogHeader>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex border border-border rounded-md">
          <Button
            variant={viewSettings.mode === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none border-0"
            onClick={() => handleViewModeChange("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewSettings.mode === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none border-0"
            onClick={() => handleViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {viewSettings.sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange("name")}>Por Nombre</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("date")}>Por Fecha</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("size")}>Por Tamaño</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("type")}>Por Tipo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

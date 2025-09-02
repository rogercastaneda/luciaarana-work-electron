"use client"

import { useState } from "react"
import { Plus, Search, Settings, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FolderTreeComponent } from "./folder-tree"
import { FolderContextMenu } from "./context-menu"
import { useMediaStore } from "@/hooks/use-media-store"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { currentFolderId, navigateToFolder, getFolderTree, createFolder, deleteFolder, renameFolder, searchFiles } =
    useMediaStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const folderTree = getFolderTree()

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim())
      setNewFolderName("")
      setIsCreateDialogOpen(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // TODO: Implementar búsqueda en tiempo real
  }

  const canModifyFolder = (folder: any) => {
    const baseFolders = ["Editorial", "Beauty", "Portrait", "Fashion Campaign", "Motion", "Advertising"]
    return !(folder.parentId === null && baseFolders.includes(folder.name))
  }

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-3">Gestor Multimedia</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar archivos..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1">
                <Plus className="h-4 w-4 mr-1" />
                Nueva Carpeta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Carpeta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="folder-name">Nombre de la carpeta</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Ingresa el nombre..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateFolder()
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateFolder}>Crear</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {folderTree.map((folder) => (
            <div key={folder.id} className="mb-2">
              <FolderContextMenu
                folderId={folder.id}
                folderName={folder.name}
                onRename={renameFolder}
                onDelete={deleteFolder}
                canRename={canModifyFolder(folder)}
                canDelete={canModifyFolder(folder)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2 h-8 px-2",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    currentFolderId === folder.id && "bg-sidebar-primary text-sidebar-primary-foreground",
                  )}
                  onClick={() => navigateToFolder(folder.id)}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">{folder.name}</span>
                  {folder.fileCount > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">{folder.fileCount}</span>
                  )}
                </Button>
              </FolderContextMenu>

              {/* Show subfolders if any */}
              {folder.children.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  <FolderTreeComponent
                    folders={folder.children}
                    currentFolderId={currentFolderId}
                    onFolderSelect={navigateToFolder}
                    onRename={renameFolder}
                    onDelete={deleteFolder}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

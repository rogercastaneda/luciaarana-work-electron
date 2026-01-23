"use client"

import type React from "react"

import { useState } from "react"
import { Edit2, Trash2, ImageIcon, Eye, EyeOff } from "lucide-react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HeroImageUpload } from "@/components/hero-image-upload"

interface FolderContextMenuProps {
  children: React.ReactNode
  folderId: string
  folderName: string
  heroImageUrl?: string | null
  isActive?: boolean
  onRename: (id: string, newName: string) => boolean
  onUpdateHero?: (id: string, heroImageUrl: string | null) => Promise<boolean>
  onToggleActive?: (id: string, isActive: boolean) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  canDelete?: boolean
  canRename?: boolean
  canEditHero?: boolean
  canToggleActive?: boolean
}

export function FolderContextMenu({
  children,
  folderId,
  folderName,
  heroImageUrl,
  isActive = true,
  onRename,
  onUpdateHero,
  onToggleActive,
  onDelete,
  canDelete = true,
  canRename = true,
  canEditHero = false,
  canToggleActive = true,
}: FolderContextMenuProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isHeroEditOpen, setIsHeroEditOpen] = useState(false)
  const [newName, setNewName] = useState(folderName)
  const [newHeroImageUrl, setNewHeroImageUrl] = useState<string | null>(heroImageUrl || null)

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== folderName) {
      const success = onRename(folderId, newName.trim())
      if (success) {
        setIsRenameOpen(false)
      }
    } else {
      setIsRenameOpen(false)
    }
  }

  const handleUpdateHero = async () => {
    if (onUpdateHero) {
      const success = await onUpdateHero(folderId, newHeroImageUrl)
      if (success) {
        setIsHeroEditOpen(false)
      }
    }
  }

  const handleDelete = async () => {
    const success = await onDelete(folderId)
    if (success) {
      setIsDeleteOpen(false)
    }
  }

  const handleToggleActive = async () => {
    if (onToggleActive) {
      await onToggleActive(folderId, !isActive)
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          {canRename && (
            <ContextMenuItem
              onClick={() => {
                setNewName(folderName)
                setIsRenameOpen(true)
              }}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Renombrar
            </ContextMenuItem>
          )}
          {canEditHero && (
            <ContextMenuItem
              onClick={() => {
                setNewHeroImageUrl(heroImageUrl || null)
                setIsHeroEditOpen(true)
              }}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Editar Hero
            </ContextMenuItem>
          )}
          {canToggleActive && (
            <ContextMenuItem onClick={handleToggleActive}>
              {isActive ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Marcar como Inactivo
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Marcar como Activo
                </>
              )}
            </ContextMenuItem>
          )}
          {canDelete && (
            <ContextMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar Carpeta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="rename-input">Nuevo nombre</Label>
              <Input
                id="rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ingresa el nuevo nombre..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRename}>Renombrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Image Edit Dialog */}
      <Dialog open={isHeroEditOpen} onOpenChange={setIsHeroEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Imagen Hero</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <HeroImageUpload
              value={newHeroImageUrl}
              onChange={setNewHeroImageUrl}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsHeroEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateHero}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar carpeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la carpeta "{folderName}" y todo su contenido. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FolderContextMenu } from "./context-menu"
import { cn } from "@/lib/utils"
import type { FolderTree } from "@/lib/types"

interface FolderTreeProps {
  folders: FolderTree[]
  currentFolderId: string
  onFolderSelect: (folderId: string) => void
  onRename: (id: string, newName: string) => boolean // Added rename callback
  onDelete: (id: string) => Promise<boolean> // Added delete callback
  level?: number
}

export function FolderTreeComponent({
  folders,
  currentFolderId,
  onFolderSelect,
  onRename,
  onDelete,
  level = 0,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root"]))

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const canModifyFolder = (folder: FolderTree) => {
    const baseFolders = ["Editorial", "Beauty", "Portrait", "Fashion Campaign", "Motion", "Advertising"]
    // Allow modification if:
    // 1. It's a subfolder (has parentId)
    // 2. OR it's a root folder but NOT in the base folders list (user-created project)
    return folder.parentId !== null || !baseFolders.includes(folder.name)
  }

  return (
    <div className="space-y-1">
      {folders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id)
        const isSelected = currentFolderId === folder.id
        const hasChildren = folder.children.length > 0

        return (
          <div key={folder.id}>
            <FolderContextMenu
              folderId={folder.id}
              folderName={folder.name}
              onRename={onRename}
              onDelete={onDelete}
              canRename={canModifyFolder(folder)}
              canDelete={canModifyFolder(folder)}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 h-8 px-2",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isSelected && "bg-sidebar-primary text-sidebar-primary-foreground",
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => onFolderSelect(folder.id)}
              >
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpanded(folder.id)
                    }}
                    className="flex items-center justify-center w-4 h-4 hover:bg-sidebar-accent rounded-sm"
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>
                )}
                {!hasChildren && <div className="w-4" />}

                {isSelected ? (
                  <FolderOpen className="h-4 w-4 text-sidebar-primary-foreground" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}

                <span className="flex-1 text-left text-sm font-medium truncate">{folder.name}</span>

                {folder.fileCount > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {folder.fileCount}
                  </span>
                )}
              </Button>
            </FolderContextMenu>

            {isExpanded && hasChildren && (
              <FolderTreeComponent
                folders={folder.children}
                currentFolderId={currentFolderId}
                onFolderSelect={onFolderSelect}
                onRename={onRename} // Pass callbacks to nested components
                onDelete={onDelete}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

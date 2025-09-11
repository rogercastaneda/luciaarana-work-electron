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
  level?: number
}

export function FolderTreeComponent({
  folders,
  currentFolderId,
  onFolderSelect,
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


  return (
    <div className="space-y-1">
      {folders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id)
        const isSelected = currentFolderId === folder.id
        const hasChildren = folder.children.length > 0

        return (
          <div key={folder.id}>
            <div className="relative group">
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
                    className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-sidebar-accent"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                )}
                {!hasChildren && <div className="w-4" />}

                {isSelected ? (
                  <FolderOpen className="w-4 h-4 text-sidebar-primary-foreground" />
                ) : (
                  <Folder className="w-4 h-4" />
                )}

                <span className="flex-1 text-sm font-medium text-left truncate">{folder.name}</span>

                {folder.fileCount > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {folder.fileCount}
                  </span>
                )}
              </Button>
            </div>

            {isExpanded && hasChildren && (
              <FolderTreeComponent
                folders={folder.children}
                currentFolderId={currentFolderId}
                onFolderSelect={onFolderSelect}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

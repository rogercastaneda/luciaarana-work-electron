"use client"

import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaStore } from "@/hooks/use-media-store"

export function BreadcrumbNav() {
  const { currentFolderId, navigateToFolder, getCurrentFolder } = useMediaStore()

  const getBreadcrumbPath = () => {
    const path: { id: string; name: string }[] = []
    let currentId = currentFolderId

    while (currentId && currentId !== "root") {
      const folder = getCurrentFolder()
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name })
        currentId = folder.parentId || "root"
      } else {
        break
      }
    }

    return path
  }

  const breadcrumbPath = getBreadcrumbPath()

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 hover:bg-accent hover:text-accent-foreground"
        onClick={() => navigateToFolder("root")}
      >
        <Home className="h-4 w-4 mr-1" />
        Inicio
      </Button>

      {breadcrumbPath.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => navigateToFolder(item.id)}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </nav>
  )
}

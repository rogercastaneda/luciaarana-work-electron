"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, ArrowLeft, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectWithFirstImage } from "@/modules/database/types"

type ProjectListingProps = {
  categoryName: string
  projects: ProjectWithFirstImage[]
  onBack: () => void
  onProjectReorder: (projectId: number, newOrdering: number) => Promise<void>
  onProjectClick?: (projectId: number) => void
}

export function ProjectListing({
  categoryName,
  projects,
  onBack,
  onProjectReorder,
  onProjectClick
}: ProjectListingProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dragOverItem, setDragOverItem] = useState<number | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, projectId: number) => {
    setDraggedItem(projectId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, projectId: number) => {
    e.preventDefault()
    if (draggedItem && draggedItem !== projectId) {
      setDragOverItem(projectId)
    }
  }, [draggedItem])

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, targetProjectId: number) => {
    e.preventDefault()

    if (!draggedItem || draggedItem === targetProjectId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedProject = projects.find(p => p.id === draggedItem)
    const targetProject = projects.find(p => p.id === targetProjectId)

    if (draggedProject && targetProject) {
      await onProjectReorder(draggedProject.id, targetProject.ordering)
      await onProjectReorder(targetProject.id, draggedProject.ordering)
    }

    setDraggedItem(null)
    setDragOverItem(null)
  }, [draggedItem, projects, onProjectReorder])

  const sortedProjects = [...projects].sort((a, b) => a.ordering - b.ordering)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{categoryName}</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedProjects.map((project) => (
          <Card
            key={project.id}
            className={cn(
              "relative group overflow-hidden transition-all cursor-pointer hover:shadow-md",
              draggedItem === project.id && "opacity-50 scale-95",
              dragOverItem === project.id && "ring-2 ring-primary ring-offset-2"
            )}
            draggable
            onDragStart={(e) => handleDragStart(e, project.id)}
            onDragOver={(e) => handleDragOver(e, project.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, project.id)}
            onClick={() => onProjectClick?.(project.id)}
          >
            <div className="relative aspect-square w-full overflow-hidden">
              {project.first_image_url ? (
                <img
                  src={project.first_image_url}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              <Badge variant="secondary" className="absolute top-2 right-2">
                #{project.ordering}
              </Badge>

              <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                <div className="p-2 rounded-md cursor-move bg-white/10 backdrop-blur-sm">
                  <GripVertical className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-medium truncate">{project.name}</h3>
              <p className="text-xs text-muted-foreground">
                Creado: {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No hay proyectos en esta categoría
            </h3>
            <p className="text-sm text-muted-foreground">
              Crea tu primer proyecto para comenzar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
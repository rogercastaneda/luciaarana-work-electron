"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Edit2, X, Link, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ProjectSelectWithFilter } from "@/components/project-select-with-filter"

interface FolderRecord {
  id: number
  name: string
  slug: string
  parent_id: number | null
  is_parent: boolean
  hero_image_url: string | null
  related_project_1_id: number | null
  related_project_2_id: number | null
  created_at: Date
  updated_at: Date
}

interface GroupedProjects {
  parent_id: number
  parent_name: string
  projects: FolderRecord[]
}

interface RelatedProjectsSelectorProps {
  currentProject: FolderRecord
  relatedProject1?: FolderRecord | null
  relatedProject2?: FolderRecord | null
  groupedProjects: GroupedProjects[]
  onSave: (relatedProject1Id: number | null, relatedProject2Id: number | null) => Promise<void>
  className?: string
}

export function RelatedProjectsSelector({
  currentProject,
  relatedProject1,
  relatedProject2,
  groupedProjects,
  onSave,
  className
}: RelatedProjectsSelectorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProject1Id, setSelectedProject1Id] = useState<number | null>(
    relatedProject1?.id || null
  )
  const [selectedProject2Id, setSelectedProject2Id] = useState<number | null>(
    relatedProject2?.id || null
  )
  const [isSaving, setIsSaving] = useState(false)

  const getProjectById = (id: number | null) => {
    if (!id) return null
    for (const group of groupedProjects) {
      const project = group.projects.find(p => p.id === id)
      if (project) return project
    }
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(selectedProject1Id, selectedProject2Id)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving related projects:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedProject1Id(relatedProject1?.id || null)
    setSelectedProject2Id(relatedProject2?.id || null)
    setIsEditing(false)
  }

  const hasRelatedProjects = relatedProject1 || relatedProject2

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Link className="h-5 w-5" />
          Proyectos Relacionados
        </h3>
        
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {hasRelatedProjects ? "Editar" : "Agregar"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card className="p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Primer proyecto relacionado</label>
              <div className="mt-1">
                <ProjectSelectWithFilter
                  groupedProjects={groupedProjects}
                  value={selectedProject1Id}
                  onChange={setSelectedProject1Id}
                  placeholder="Selecciona el primer proyecto relacionado..."
                  excludeProjects={[
                    currentProject.id,
                    ...(selectedProject2Id ? [selectedProject2Id] : [])
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Segundo proyecto relacionado</label>
              <div className="mt-1">
                <ProjectSelectWithFilter
                  groupedProjects={groupedProjects}
                  value={selectedProject2Id}
                  onChange={setSelectedProject2Id}
                  placeholder="Selecciona el segundo proyecto relacionado..."
                  excludeProjects={[
                    currentProject.id,
                    ...(selectedProject1Id ? [selectedProject1Id] : [])
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </Card>
      ) : (
        <div>
          {hasRelatedProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedProject1 && (
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="space-y-2">
                    {relatedProject1.hero_image_url && (
                      <img
                        src={relatedProject1.hero_image_url}
                        alt={relatedProject1.name}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    <h4 className="font-medium">{relatedProject1.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      Proyecto relacionado
                    </Badge>
                  </div>
                </Card>
              )}
              
              {relatedProject2 && (
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="space-y-2">
                    {relatedProject2.hero_image_url && (
                      <img
                        src={relatedProject2.hero_image_url}
                        alt={relatedProject2.name}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    <h4 className="font-medium">{relatedProject2.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      Proyecto relacionado
                    </Badge>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <Link className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>No hay proyectos relacionados configurados</p>
              <p className="text-sm">Haz clic en "Agregar" para seleccionar proyectos relacionados</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
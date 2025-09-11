"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Search, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

interface ProjectSelectWithFilterProps {
  groupedProjects: GroupedProjects[]
  value: number | null
  onChange: (projectId: number | null) => void
  placeholder?: string
  excludeProjects?: number[]
  className?: string
}

export function ProjectSelectWithFilter({
  groupedProjects,
  value,
  onChange,
  placeholder = "Selecciona un proyecto...",
  excludeProjects = [],
  className
}: ProjectSelectWithFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter and flatten projects based on search term and exclusions
  const filteredProjects = useMemo(() => {
    return groupedProjects.map(group => ({
      ...group,
      projects: group.projects.filter(project => {
        // Exclude specified projects
        if (excludeProjects.includes(project.id)) return false
        
        // Filter by search term
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase()
          return (
            project.name.toLowerCase().includes(searchLower) ||
            group.parent_name.toLowerCase().includes(searchLower)
          )
        }
        
        return true
      })
    })).filter(group => group.projects.length > 0) // Only show groups with projects
  }, [groupedProjects, searchTerm, excludeProjects])

  const selectedProject = useMemo(() => {
    if (!value) return null
    
    for (const group of groupedProjects) {
      const project = group.projects.find(p => p.id === value)
      if (project) return project
    }
    
    return null
  }, [value, groupedProjects])

  const handleSelect = (projectId: number) => {
    onChange(projectId)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = () => {
    onChange(null)
    setIsOpen(false)
    setSearchTerm("")
  }

  const totalProjects = filteredProjects.reduce((acc, group) => acc + group.projects.length, 0)

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedProject ? selectedProject.name : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selectedProject && (
            <div
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded cursor-pointer flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className="h-3 w-3" />
            </div>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-md z-50">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-60 overflow-y-auto">
            {totalProjects === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? "No se encontraron proyectos" : "No hay proyectos disponibles"}
              </div>
            ) : (
              <>
                {/* Clear option */}
                <div
                  className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b"
                  onClick={handleClear}
                >
                  <span className="text-muted-foreground italic">Ninguno</span>
                </div>

                {/* Grouped Projects */}
                {filteredProjects.map((group) => (
                  <div key={group.parent_id}>
                    <div className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      {group.parent_name}
                    </div>
                    {group.projects.map((project) => (
                      <div
                        key={project.id}
                        className={cn(
                          "px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between",
                          value === project.id && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => handleSelect(project.id)}
                      >
                        <span className="truncate">{project.name}</span>
                        {project.hero_image_url && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Hero
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
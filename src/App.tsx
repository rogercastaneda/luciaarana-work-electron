import { useState } from "react"
import { useFolders } from "@/hooks/use-folders"
import {
  getFolderWithRelatedProjectsAction,
  getProjectsGroupedByCategoryAction,
  updateProjectRelatedProjects,
  getProjectsWithFirstImageAction,
  updateProjectOrderingAction,
  toggleProjectActiveStatusAction
} from "@/lib/actions"
import { MediaDropZone } from "@/components/media-drop-zone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen, Plus, Users, Trash2, Edit2, ChevronDown, ChevronRight, ImageIcon, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { HeroImageUpload } from "@/components/hero-image-upload"
import { FolderContextMenu } from "@/components/context-menu"
import { RelatedProjectsSelector } from "@/components/related-projects-selector"
import { ProjectListing } from "@/components/project-listing"
import type { ProjectWithFirstImage } from "@/modules/database/types"

export default function App() {
  const { categoriesWithProjects, loading, createProject, updateProject, updateProjectHero, deleteProject, refresh } = useFolders()
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [selectedFolderName, setSelectedFolderName] = useState<string>("")
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectHeroImage, setNewProjectHeroImage] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isHeroEditDialogOpen, setIsHeroEditDialogOpen] = useState(false)
  const [renameProjectName, setRenameProjectName] = useState("")
  const [editHeroImageUrl, setEditHeroImageUrl] = useState<string | null>(null)
  const [isHeroUploading, setIsHeroUploading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [currentProjectWithRelated, setCurrentProjectWithRelated] = useState<any>(null)
  const [groupedProjects, setGroupedProjects] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'project' | 'category'>('project')
  const [selectedCategoryForListing, setSelectedCategoryForListing] = useState<{ id: number; name: string } | null>(null)
  const [projectsWithImages, setProjectsWithImages] = useState<ProjectWithFirstImage[]>([])

  const handleCreateProject = async () => {
    if (newProjectName.trim() && selectedCategoryId) {
      const result = await createProject(newProjectName.trim(), selectedCategoryId, newProjectHeroImage)

      if (result.success && result.data) {
        // Auto-select the newly created project
        await handleFolderSelect(result.data.id, result.data.name)
      }

      setNewProjectName("")
      setNewProjectHeroImage(null)
      setIsCreateDialogOpen(false)
    }
  }

  const handleFolderSelect = async (folderId: number, folderName: string) => {
    setSelectedFolderId(folderId)
    setSelectedFolderName(folderName)
    setViewMode('project')

    // Load project with related projects
    try {
      const [projectResult, groupedResult] = await Promise.all([
        getFolderWithRelatedProjectsAction(folderId),
        getProjectsGroupedByCategoryAction()
      ])
      
      if (projectResult.success && projectResult.data) {
        setCurrentProjectWithRelated(projectResult.data)
      }
      
      if (groupedResult.success && groupedResult.data) {
        setGroupedProjects(groupedResult.data)
      }
    } catch (error) {
      console.error("Error loading project details:", error)
    }
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const shouldCategoryBeExpanded = (category: any) => {
    // Check if the current selected project belongs to this category
    const currentProjectInCategory = category.projects.some((project: any) => project.id === selectedFolderId)
    return currentProjectInCategory || expandedCategories.has(category.id)
  }

  const handleRenameProject = async () => {
    if (selectedFolderId && renameProjectName.trim()) {
      const result = await updateProject(selectedFolderId, renameProjectName.trim())
      if (result.success) {
        setSelectedFolderName(renameProjectName.trim())
        setIsRenameDialogOpen(false)
        setRenameProjectName("")
      }
    }
  }

  const handleDeleteProject = async () => {
    if (selectedFolderId) {
      const success = await deleteProject(selectedFolderId)
      if (success) {
        setSelectedFolderId(null)
        setSelectedFolderName("")
        setIsDeleteDialogOpen(false)
      }
    }
  }

  const handleEditHeroImage = async () => {
    if (selectedFolderId && !isHeroUploading) {
      console.log("Saving hero image to DB:", editHeroImageUrl)
      const result = await updateProjectHero(selectedFolderId, editHeroImageUrl)
      console.log("Update result:", result)
      if (result.success) {
        setIsHeroEditDialogOpen(false)
      }
    }
  }

  const handleProjectRename = (id: string, newName: string): boolean => {
    const projectId = Number(id)
    if (projectId) {
      updateProject(projectId, newName)
      return true
    }
    return false
  }

  const handleProjectHeroUpdate = async (id: string, heroImageUrl: string | null): Promise<boolean> => {
    const projectId = Number(id)
    if (projectId) {
      const result = await updateProjectHero(projectId, heroImageUrl)
      return result.success
    }
    return false
  }

  const handleProjectDelete = async (id: string): Promise<boolean> => {
    const projectId = Number(id)
    if (projectId) {
      const result = await deleteProject(projectId)
      if (result.success && selectedFolderId === projectId) {
        setSelectedFolderId(null)
        setSelectedFolderName("")
        setCurrentProjectWithRelated(null)
      }
      return result.success
    }
    return false
  }

  const handleProjectToggleActive = async (id: string, isActive: boolean): Promise<boolean> => {
    const projectId = Number(id)
    if (projectId) {
      const result = await toggleProjectActiveStatusAction(projectId, isActive)
      return result.success
    }
    return false
  }

  const handleSaveRelatedProjects = async (relatedProject1Id: number | null, relatedProject2Id: number | null) => {
    if (selectedFolderId) {
      try {
        const result = await updateProjectRelatedProjects(selectedFolderId, relatedProject1Id, relatedProject2Id)
        if (result.success) {
          // Refresh the current project data
          const projectResult = await getFolderWithRelatedProjectsAction(selectedFolderId)
          if (projectResult.success && projectResult.data) {
            setCurrentProjectWithRelated(projectResult.data)
          }
        }
      } catch (error) {
        console.error("Error saving related projects:", error)
        throw error
      }
    }
  }

  const handleCategoryClick = async (categoryId: number, categoryName: string) => {
    try {
      const result = await getProjectsWithFirstImageAction(categoryId)
      if (result.success && result.data) {
        setSelectedCategoryForListing({ id: categoryId, name: categoryName })
        setProjectsWithImages(result.data)
        setViewMode('category')
        setSelectedFolderId(null)
        setSelectedFolderName("")
      }
    } catch (error) {
      console.error("Error loading projects for category:", error)
    }
  }

  const handleBackToProjects = () => {
    setViewMode('project')
    setSelectedCategoryForListing(null)
    setProjectsWithImages([])
  }

  const handleProjectReorder = async (projectId: number, newOrdering: number) => {
    try {
      const result = await updateProjectOrderingAction(projectId, newOrdering)
      if (result.success && selectedCategoryForListing) {
        // Refresh the projects list
        const refreshResult = await getProjectsWithFirstImageAction(selectedCategoryForListing.id)
        if (refreshResult.success && refreshResult.data) {
          setProjectsWithImages(refreshResult.data)
        }
      }
    } catch (error) {
      console.error("Error updating project order:", error)
    }
  }

  const handleProjectClickFromListing = (projectId: number) => {
    const project = projectsWithImages.find(p => p.id === projectId)
    if (project) {
      setViewMode('project')
      handleFolderSelect(projectId, project.name)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="luciaarana-theme">
      <div className="h-screen flex bg-background">
        {/* Sidebar */}
        <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-lg font-semibold text-sidebar-foreground mb-3">Gestor Multimedia</h2>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="category-select">Categoría</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedCategoryId || ""}
                      onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categoriesWithProjects.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="project-name">Nombre del proyecto</Label>
                    <Input
                      id="project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Ingresa el nombre del proyecto..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateProject()
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label>Imagen Hero</Label>
                    <HeroImageUpload
                      value={newProjectHeroImage}
                      onChange={setNewProjectHeroImage}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateProject} disabled={!newProjectName.trim() || !selectedCategoryId}>
                      Crear
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {categoriesWithProjects.map((category) => {
                const hasMany = category.projects.length >= 5
                const isExpanded = shouldCategoryBeExpanded(category)
                
                return (
                  <div key={category.id} className="mb-4">
                    <div className="flex items-center gap-2 p-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors"
                         onClick={() => handleCategoryClick(category.id, category.name)}>
                      {hasMany && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCategoryExpansion(category.id)
                          }}
                          className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-sidebar-accent"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                      {!hasMany && <div className="w-4" />}

                      <Users className="h-4 w-4" />
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {category.total_media_count}
                      </Badge>
                    </div>
                    
                    {/* Show projects if expanded (or if less than 5 projects) */}
                    {(isExpanded || !hasMany) && (
                      <div className="ml-4 space-y-1">
                        {category.projects.map((project) => (
                          <FolderContextMenu
                            key={project.id}
                            folderId={project.id.toString()}
                            folderName={project.name}
                            heroImageUrl={project.hero_image_url}
                            isActive={project.is_active}
                            onRename={handleProjectRename}
                            onUpdateHero={handleProjectHeroUpdate}
                            onToggleActive={handleProjectToggleActive}
                            onDelete={handleProjectDelete}
                            canDelete={true}
                            canRename={true}
                            canEditHero={true}
                            canToggleActive={true}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start gap-2 h-8 px-2",
                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                selectedFolderId === project.id && "bg-sidebar-primary text-sidebar-primary-foreground",
                                !project.is_active && "opacity-50"
                              )}
                              onClick={() => handleFolderSelect(project.id, project.name)}
                            >
                              <FolderOpen className="h-4 w-4" />
                              <span className="text-sm">{project.name}</span>
                              {!project.is_active && (
                                <EyeOff className="h-3 w-3 ml-1 text-muted-foreground" />
                              )}
                              {project.hero_image_url && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" title="Tiene imagen hero" />
                              )}
                            </Button>
                          </FolderContextMenu>
                        ))}
                        
                        {category.projects.length === 0 && (
                          <p className="text-xs text-muted-foreground pl-6 py-2">
                            No hay proyectos
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {selectedFolderName ? `Proyecto: ${selectedFolderName}` : "Selecciona un proyecto"}
                </h1>
                <p className="text-muted-foreground">
                  {selectedFolderId ? "Sube y gestiona tus archivos multimedia" : "Elige un proyecto desde el sidebar"}
                </p>
              </div>
              
              {selectedFolderId && selectedFolderName && (() => {
                const currentProject = categoriesWithProjects
                  .flatMap(cat => cat.projects)
                  .find(project => project.id === selectedFolderId)

                return (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditHeroImageUrl(currentProject?.hero_image_url || null)
                        setIsHeroEditDialogOpen(true)
                      }}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Editar Hero
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (currentProject && selectedFolderId) {
                          const success = await handleProjectToggleActive(
                            selectedFolderId.toString(),
                            !currentProject.is_active
                          )
                          if (success) {
                            await refresh()
                          }
                        }
                      }}
                    >
                      {currentProject?.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Deshabilitar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Habilitar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRenameProjectName(selectedFolderName)
                        setIsRenameDialogOpen(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Renombrar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4">
            {viewMode === 'category' && selectedCategoryForListing ? (
              <ProjectListing
                categoryName={selectedCategoryForListing.name}
                projects={projectsWithImages}
                onBack={handleBackToProjects}
                onProjectReorder={handleProjectReorder}
                onProjectClick={handleProjectClickFromListing}
              />
            ) : selectedFolderId ? (
              <div className="space-y-6">
                {/* Hero Image Section */}
                {(() => {
                  const currentProject = categoriesWithProjects
                    .flatMap(cat => cat.projects)
                    .find(project => project.id === selectedFolderId)
                  
                  if (currentProject?.hero_image_url) {
                    return (
                      <div className="relative">
                        <h3 className="text-lg font-semibold mb-3">Imagen Hero del Proyecto</h3>
                        <div className="relative rounded-lg overflow-hidden border">
                          <img
                            src={currentProject.hero_image_url}
                            alt={`Hero image for ${currentProject.name}`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 text-white">
                            <h4 className="text-xl font-bold">{currentProject.name}</h4>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
                
                {/* Related Projects Section */}
                {currentProjectWithRelated && (
                  <RelatedProjectsSelector
                    currentProject={currentProjectWithRelated}
                    relatedProject1={currentProjectWithRelated.related_project_1}
                    relatedProject2={currentProjectWithRelated.related_project_2}
                    groupedProjects={groupedProjects}
                    onSave={handleSaveRelatedProjects}
                  />
                )}
                
                {/* Media Drop Zone */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Multimedia del Proyecto</h3>
                  <MediaDropZone folderId={selectedFolderId} layout="grid" />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay proyecto seleccionado</h3>
                  <p className="text-muted-foreground mb-4">
                    Selecciona un proyecto desde el sidebar para comenzar a subir archivos multimedia.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    También puedes crear un nuevo proyecto usando el botón "Nuevo Proyecto".
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Rename Project Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renombrar Proyecto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="rename-project-name">Nuevo nombre</Label>
                <Input
                  id="rename-project-name"
                  value={renameProjectName}
                  onChange={(e) => setRenameProjectName(e.target.value)}
                  placeholder="Ingresa el nuevo nombre..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameProject()
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleRenameProject}>Renombrar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Hero Image Dialog */}
        <Dialog open={isHeroEditDialogOpen} onOpenChange={setIsHeroEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Imagen Hero - {selectedFolderName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <HeroImageUpload
                value={editHeroImageUrl}
                onChange={(url) => {
                  console.log("Hero image URL changed:", url)
                  setEditHeroImageUrl(url)
                }}
                onUploadingChange={setIsHeroUploading}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsHeroEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditHeroImage} disabled={isHeroUploading}>
                  {isHeroUploading ? "Subiendo..." : "Guardar Hero Image"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Project Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar proyecto "{selectedFolderName}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente el proyecto y todos sus archivos de la base de datos y Contentful. 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar Proyecto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ThemeProvider>
  )
}
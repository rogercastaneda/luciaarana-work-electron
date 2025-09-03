import { useState } from "react"
import { useFolders } from "@/hooks/use-folders"
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
import { FolderOpen, Plus, Users, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

export default function App() {
  const { categoriesWithProjects, loading, createProject, deleteProject } = useFolders()
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [selectedFolderName, setSelectedFolderName] = useState<string>("")
  const [newProjectName, setNewProjectName] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleCreateProject = async () => {
    if (newProjectName.trim() && selectedCategoryId) {
      await createProject(newProjectName.trim(), selectedCategoryId)
      setNewProjectName("")
      setIsCreateDialogOpen(false)
    }
  }

  const handleFolderSelect = (folderId: number, folderName: string) => {
    setSelectedFolderId(folderId)
    setSelectedFolderName(folderName)
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
              {categoriesWithProjects.map((category) => (
                <div key={category.id} className="mb-4">
                  <div className="flex items-center gap-2 p-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {category.total_media_count}
                    </Badge>
                  </div>
                  
                  <div className="ml-4 space-y-1">
                    {category.projects.map((project) => (
                      <Button
                        key={project.id}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-2 h-8 px-2",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          selectedFolderId === project.id && "bg-sidebar-primary text-sidebar-primary-foreground"
                        )}
                        onClick={() => handleFolderSelect(project.id, project.name)}
                      >
                        <FolderOpen className="h-4 w-4" />
                        <span className="text-sm">{project.name}</span>
                      </Button>
                    ))}
                    
                    {category.projects.length === 0 && (
                      <p className="text-xs text-muted-foreground pl-6 py-2">
                        No hay proyectos
                      </p>
                    )}
                  </div>
                </div>
              ))}
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
              
              {selectedFolderId && selectedFolderName && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Proyecto
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4">
            {selectedFolderId ? (
              <MediaDropZone folderId={selectedFolderId} layout="grid" />
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
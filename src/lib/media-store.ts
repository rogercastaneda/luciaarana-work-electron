import type { MediaFile, Folder, FolderTree, ImageMetadata, VideoMetadata } from "./types"

// Simulamos un store local para el ejemplo
class MediaStore {
  private folders: Map<string, Folder> = new Map()
  private files: Map<string, MediaFile> = new Map()

  constructor() {
    const rootFolder: Folder = {
      id: "root",
      name: "Mis Archivos",
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
      files: [],
    }
    this.folders.set("root", rootFolder)

    // Create predefined base folders
    const baseFolders = ["Editorial", "Beauty", "Portrait", "Fashion Campaign", "Motion", "Advertising"]

    baseFolders.forEach((folderName) => {
      this.createFolder(folderName, "root")
    })
  }

  // Gestión de carpetas
  createFolder(name: string, parentId = "root"): Folder {
    const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const folder: Folder = {
      id,
      name,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
      files: [],
    }

    this.folders.set(id, folder)

    // Agregar a la carpeta padre
    const parent = this.folders.get(parentId)
    if (parent) {
      parent.children.push(folder)
      parent.updatedAt = new Date()
    }

    return folder
  }

  getFolder(id: string): Folder | undefined {
    return this.folders.get(id)
  }

  getFolderTree(): FolderTree[] {
    const buildTree = (folderId: string): FolderTree => {
      const folder = this.folders.get(folderId)!
      return {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        children: folder.children.map((child) => buildTree(child.id)),
        fileCount: folder.files.length,
      }
    }

    const root = this.folders.get("root")!
    return root.children.map((child) => buildTree(child.id))
  }

  deleteFolder(id: string): boolean {
    if (id === "root") return false

    const folder = this.folders.get(id)
    if (!folder) return false

    const baseFolders = ["Editorial", "Beauty", "Portrait", "Fashion Campaign", "Motion", "Advertising"]
    if (folder.parentId === "root" && baseFolders.includes(folder.name)) {
      return false // Cannot delete base folders
    }

    // Eliminar archivos de la carpeta
    folder.files.forEach((file) => this.files.delete(file.id))

    // Eliminar subcarpetas recursivamente
    folder.children.forEach((child) => this.deleteFolder(child.id))

    // Remover de la carpeta padre
    if (folder.parentId) {
      const parent = this.folders.get(folder.parentId)
      if (parent) {
        parent.children = parent.children.filter((child) => child.id !== id)
        parent.updatedAt = new Date()
      }
    }

    this.folders.delete(id)
    return true
  }

  renameFolder(id: string, newName: string): boolean {
    if (id === "root" || !newName.trim()) return false

    const folder = this.folders.get(id)
    if (!folder) return false

    // Check if it's a base folder - prevent renaming of predefined folders
    const baseFolders = ["Editorial", "Beauty", "Portrait", "Fashion Campaign", "Motion", "Advertising"]
    if (folder.parentId === "root" && baseFolders.includes(folder.name)) {
      return false // Cannot rename base folders
    }

    folder.name = newName.trim()
    folder.updatedAt = new Date()

    // Update in parent's children array
    if (folder.parentId) {
      const parent = this.folders.get(folder.parentId)
      if (parent) {
        const childIndex = parent.children.findIndex((child) => child.id === id)
        if (childIndex !== -1) {
          parent.children[childIndex] = folder
          parent.updatedAt = new Date()
        }
      }
    }

    return true
  }

  // Gestión de archivos
  addFile(file: Omit<MediaFile, "id" | "createdAt" | "updatedAt">): MediaFile {
    const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mediaFile: MediaFile = {
      ...file,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.files.set(id, mediaFile)

    // Agregar a la carpeta
    const folder = this.folders.get(file.folderId)
    if (folder) {
      folder.files.push(mediaFile)
      folder.updatedAt = new Date()
    }

    return mediaFile
  }

  getFile(id: string): MediaFile | undefined {
    return this.files.get(id)
  }

  updateFileMetadata(id: string, metadata: ImageMetadata | VideoMetadata): boolean {
    const file = this.files.get(id)
    if (!file) return false

    file.metadata = metadata
    file.updatedAt = new Date()

    // Actualizar en la carpeta también
    const folder = this.folders.get(file.folderId)
    if (folder) {
      const fileIndex = folder.files.findIndex((f) => f.id === id)
      if (fileIndex !== -1) {
        folder.files[fileIndex] = file
        folder.updatedAt = new Date()
      }
    }

    return true
  }

  deleteFile(id: string): boolean {
    const file = this.files.get(id)
    if (!file) return false

    // Remover de la carpeta
    const folder = this.folders.get(file.folderId)
    if (folder) {
      folder.files = folder.files.filter((f) => f.id !== id)
      folder.updatedAt = new Date()
    }

    this.files.delete(id)
    return true
  }

  getFolderContents(folderId: string): { folders: Folder[]; files: MediaFile[] } {
    const folder = this.folders.get(folderId)
    if (!folder) return { folders: [], files: [] }

    return {
      folders: folder.children,
      files: folder.files,
    }
  }

  searchFiles(query: string): MediaFile[] {
    const results: MediaFile[] = []

    this.files.forEach((file) => {
      const searchText = `${file.name} ${file.metadata?.title || ""} ${file.metadata?.description || ""}`
      if (searchText.toLowerCase().includes(query.toLowerCase())) {
        results.push(file)
      }
    })

    return results
  }
}

export const mediaStore = new MediaStore()

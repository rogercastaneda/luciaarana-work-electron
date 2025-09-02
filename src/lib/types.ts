export interface MediaFile {
  id: string
  name: string
  type: "image" | "video"
  url: string
  size: number
  createdAt: Date
  updatedAt: Date
  folderId: string
  metadata?: ImageMetadata | VideoMetadata
}

export interface ImageMetadata {
  alt: string
  title: string
  orientation: "landscape" | "portrait" | "square"
  width: number
  height: number
  tags: string[]
  description?: string
}

export interface VideoMetadata {
  title: string
  duration: number
  width: number
  height: number
  tags: string[]
  description?: string
  thumbnail?: string
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  children: Folder[]
  files: MediaFile[]
}

export interface FolderTree {
  id: string
  name: string
  parentId: string | null
  children: FolderTree[]
  fileCount: number
}

export type ViewMode = "grid" | "list"
export type SortBy = "name" | "date" | "size" | "type"
export type SortOrder = "asc" | "desc"

export interface ViewSettings {
  mode: ViewMode
  sortBy: SortBy
  sortOrder: SortOrder
}

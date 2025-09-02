export type FolderRecord = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  is_parent: boolean
  created_at: Date
  updated_at: Date
}

export type MediaRecord = {
  id: string
  folder_id: number
  media_url: string
  order_index: number
  layout: string
  created_at: Date
  updated_at: Date
}

export type FolderWithChildren = FolderRecord & {
  children: FolderRecord[]
  media_count: number
}

export type CategoryWithProjects = {
  id: number
  name: string
  slug: string
  projects: FolderRecord[]
  total_media_count: number
}

export type CreateFolderParams = {
  name: string
  slug: string
  parentId?: number
  isParent?: boolean
}

export type CreateMediaParams = {
  id: string
  folderId: number
  mediaUrl: string
  orderIndex: number
  layout: string
}

export type UpdateMediaOrderParams = {
  id: string
  orderIndex: number
}
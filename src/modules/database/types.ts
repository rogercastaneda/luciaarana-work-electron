export type FolderRecord = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  is_parent: boolean
  hero_image_url: string | null
  related_project_1_id: number | null
  related_project_2_id: number | null
  ordering: number
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
  heroImageUrl?: string | null
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

export type UpdateFolderParams = {
  id: number
  name?: string
  heroImageUrl?: string | null
  relatedProject1Id?: number | null
  relatedProject2Id?: number | null
}

export type UpdateRelatedProjectsParams = {
  projectId: number
  relatedProject1Id: number | null
  relatedProject2Id: number | null
}

export type FolderWithRelatedProjects = FolderRecord & {
  related_project_1?: FolderRecord | null
  related_project_2?: FolderRecord | null
}

export type ProjectWithFirstImage = FolderRecord & {
  first_image_url?: string | null
}
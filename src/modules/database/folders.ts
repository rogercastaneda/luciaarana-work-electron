import { sql } from './connection'
import type { 
  FolderRecord, 
  FolderWithChildren, 
  CategoryWithProjects, 
  CreateFolderParams 
} from './types'

export const createFolder = async (params: CreateFolderParams): Promise<FolderRecord> => {
  const { name, slug, parentId, isParent = false } = params
  
  const result = await sql`
    INSERT INTO folders (name, slug, parent_id, is_parent, created_at, updated_at)
    VALUES (${name}, ${slug}, ${parentId || null}, ${isParent}, NOW(), NOW())
    RETURNING *
  `
  
  return result[0] as FolderRecord
}

export const getParentCategories = async (): Promise<FolderRecord[]> => {
  const result = await sql`
    SELECT * FROM folders 
    WHERE is_parent = true AND parent_id IS NULL
    ORDER BY name ASC
  `
  
  return result as FolderRecord[]
}

export const getProjectsByCategory = async (categoryId: number): Promise<FolderRecord[]> => {
  const result = await sql`
    SELECT * FROM folders 
    WHERE parent_id = ${categoryId} AND is_parent = false
    ORDER BY name ASC
  `
  
  return result as FolderRecord[]
}

export const getCategoriesWithProjects = async (): Promise<CategoryWithProjects[]> => {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.slug,
      COALESCE(
        json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'parent_id', c.parent_id,
            'is_parent', c.is_parent,
            'created_at', c.created_at,
            'updated_at', c.updated_at
          ) ORDER BY c.name
        ) FILTER (WHERE c.id IS NOT NULL), 
        '[]'
      ) as projects,
      COALESCE(SUM(media_counts.media_count), 0)::integer as total_media_count
    FROM folders p
    LEFT JOIN folders c ON c.parent_id = p.id AND c.is_parent = false
    LEFT JOIN (
      SELECT folder_id, COUNT(*) as media_count
      FROM media
      GROUP BY folder_id
    ) media_counts ON media_counts.folder_id = c.id
    WHERE p.is_parent = true AND p.parent_id IS NULL
    GROUP BY p.id, p.name, p.slug
    ORDER BY p.name ASC
  `
  
  return result as CategoryWithProjects[]
}

export const getFolderById = async (id: number): Promise<FolderRecord | null> => {
  const result = await sql`
    SELECT * FROM folders WHERE id = ${id}
  `
  
  return result.length > 0 ? (result[0] as FolderRecord) : null
}

export const getFolderBySlug = async (slug: string, parentId?: number): Promise<FolderRecord | null> => {
  const result = await sql`
    SELECT * FROM folders 
    WHERE slug = ${slug} AND parent_id = ${parentId || null}
  `
  
  return result.length > 0 ? (result[0] as FolderRecord) : null
}

export const deleteFolder = async (id: number): Promise<boolean> => {
  const result = await sql`
    DELETE FROM folders WHERE id = ${id}
  `
  
  return result.length > 0
}
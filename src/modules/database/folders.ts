import { sql } from './connection'
import type { 
  FolderRecord, 
  FolderWithChildren, 
  CategoryWithProjects, 
  CreateFolderParams,
  UpdateFolderParams
} from './types'

export const createFolder = async (params: CreateFolderParams): Promise<FolderRecord> => {
  const { name, slug, parentId, isParent = false, heroImageUrl = null } = params
  
  const result = await sql`
    INSERT INTO folders (name, slug, parent_id, is_parent, hero_image_url, created_at, updated_at)
    VALUES (${name}, ${slug}, ${parentId || null}, ${isParent}, ${heroImageUrl}, NOW(), NOW())
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
            'hero_image_url', c.hero_image_url,
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

export const updateFolder = async (id: number, name: string): Promise<FolderRecord | null> => {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  const result = await sql`
    UPDATE folders 
    SET name = ${name}, slug = ${slug}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  
  return result.length > 0 ? (result[0] as FolderRecord) : null
}

export const updateFolderHero = async (params: UpdateFolderParams): Promise<FolderRecord | null> => {
  const { id, name, heroImageUrl } = params
  
  console.log("updateFolderHero called with:", { id, name, heroImageUrl })
  
  if (name !== undefined && heroImageUrl !== undefined) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    console.log("Updating both name and hero image")
    const result = await sql`
      UPDATE folders 
      SET name = ${name}, slug = ${slug}, hero_image_url = ${heroImageUrl}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    console.log("Update result (both):", result)
    return result.length > 0 ? (result[0] as FolderRecord) : null
  } else if (name !== undefined) {
    console.log("Updating only name")
    return updateFolder(id, name)
  } else if (heroImageUrl !== undefined) {
    console.log("Updating only hero image URL")
    const result = await sql`
      UPDATE folders 
      SET hero_image_url = ${heroImageUrl}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    console.log("Update result (hero only):", result)
    return result.length > 0 ? (result[0] as FolderRecord) : null
  }
  
  console.log("No updates to make, returning current folder")
  return getFolderById(id)
}

export const deleteFolder = async (id: number): Promise<boolean> => {
  const result = await sql`
    DELETE FROM folders WHERE id = ${id}
  `
  
  return result.length > 0
}
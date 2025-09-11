import { sql } from './connection'
import type { 
  FolderRecord, 
  FolderWithChildren, 
  CategoryWithProjects, 
  CreateFolderParams,
  UpdateFolderParams,
  FolderWithRelatedProjects
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
            'related_project_1_id', c.related_project_1_id,
            'related_project_2_id', c.related_project_2_id,
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
  const { id, name, heroImageUrl, relatedProject1Id, relatedProject2Id } = params
  
  console.log("updateFolderHero called with:", { id, name, heroImageUrl, relatedProject1Id, relatedProject2Id })
  
  // Use individual queries for each combination of fields
  let result
  if (relatedProject1Id !== undefined && relatedProject2Id !== undefined) {
    result = await sql`
      UPDATE folders 
      SET related_project_1_id = ${relatedProject1Id}, 
          related_project_2_id = ${relatedProject2Id}, 
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  } else if (relatedProject1Id !== undefined) {
    result = await sql`
      UPDATE folders 
      SET related_project_1_id = ${relatedProject1Id}, 
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  } else if (relatedProject2Id !== undefined) {
    result = await sql`
      UPDATE folders 
      SET related_project_2_id = ${relatedProject2Id}, 
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  } else if (heroImageUrl !== undefined && name !== undefined) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    result = await sql`
      UPDATE folders 
      SET name = ${name}, 
          slug = ${slug}, 
          hero_image_url = ${heroImageUrl}, 
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  } else if (heroImageUrl !== undefined) {
    result = await sql`
      UPDATE folders 
      SET hero_image_url = ${heroImageUrl}, 
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  } else if (name !== undefined) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    result = await sql`
      UPDATE folders 
      SET name = ${name}, 
          slug = ${slug}, 
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  } else {
    // No updates to make
    return getFolderById(id)
  }
  
  console.log("Update result:", result)
  return result.length > 0 ? (result[0] as FolderRecord) : null
}

export const getFolderWithRelatedProjects = async (id: number): Promise<FolderWithRelatedProjects | null> => {
  const result = await sql`
    SELECT 
      f.*,
      r1.id as related_1_id, r1.name as related_1_name, r1.slug as related_1_slug, 
      r1.hero_image_url as related_1_hero_image_url, r1.parent_id as related_1_parent_id,
      r1.is_parent as related_1_is_parent, r1.created_at as related_1_created_at, 
      r1.updated_at as related_1_updated_at,
      r2.id as related_2_id, r2.name as related_2_name, r2.slug as related_2_slug,
      r2.hero_image_url as related_2_hero_image_url, r2.parent_id as related_2_parent_id,
      r2.is_parent as related_2_is_parent, r2.created_at as related_2_created_at,
      r2.updated_at as related_2_updated_at
    FROM folders f
    LEFT JOIN folders r1 ON f.related_project_1_id = r1.id
    LEFT JOIN folders r2 ON f.related_project_2_id = r2.id
    WHERE f.id = ${id}
  `
  
  if (result.length === 0) return null
  
  const row = result[0] as any
  const folder: FolderWithRelatedProjects = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parent_id: row.parent_id,
    is_parent: row.is_parent,
    hero_image_url: row.hero_image_url,
    related_project_1_id: row.related_project_1_id,
    related_project_2_id: row.related_project_2_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    related_project_1: row.related_1_id ? {
      id: row.related_1_id,
      name: row.related_1_name,
      slug: row.related_1_slug,
      parent_id: row.related_1_parent_id,
      is_parent: row.related_1_is_parent,
      hero_image_url: row.related_1_hero_image_url,
      related_project_1_id: null,
      related_project_2_id: null,
      created_at: row.related_1_created_at,
      updated_at: row.related_1_updated_at,
    } : null,
    related_project_2: row.related_2_id ? {
      id: row.related_2_id,
      name: row.related_2_name,
      slug: row.related_2_slug,
      parent_id: row.related_2_parent_id,
      is_parent: row.related_2_is_parent,
      hero_image_url: row.related_2_hero_image_url,
      related_project_1_id: null,
      related_project_2_id: null,
      created_at: row.related_2_created_at,
      updated_at: row.related_2_updated_at,
    } : null,
  }
  
  return folder
}

export const getAllProjectsForSelection = async (): Promise<FolderRecord[]> => {
  const result = await sql`
    SELECT * FROM folders 
    WHERE is_parent = false 
    ORDER BY name ASC
  `
  
  return result as FolderRecord[]
}

export const getProjectsGroupedByCategory = async () => {
  const result = await sql`
    SELECT 
      p.id as parent_id,
      p.name as parent_name,
      json_agg(
        json_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug,
          'parent_id', c.parent_id,
          'is_parent', c.is_parent,
          'hero_image_url', c.hero_image_url,
          'related_project_1_id', c.related_project_1_id,
          'related_project_2_id', c.related_project_2_id,
          'created_at', c.created_at,
          'updated_at', c.updated_at
        ) ORDER BY c.name
      ) as projects
    FROM folders p
    LEFT JOIN folders c ON c.parent_id = p.id AND c.is_parent = false
    WHERE p.is_parent = true AND p.parent_id IS NULL
    GROUP BY p.id, p.name
    ORDER BY p.name ASC
  `
  
  return result as Array<{
    parent_id: number
    parent_name: string
    projects: FolderRecord[]
  }>
}

export const deleteFolder = async (id: number): Promise<boolean> => {
  const result = await sql`
    DELETE FROM folders WHERE id = ${id}
  `
  
  return result.length > 0
}
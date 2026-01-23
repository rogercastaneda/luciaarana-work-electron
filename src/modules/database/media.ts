import { sql } from './connection'
import type { MediaRecord, CreateMediaParams, UpdateMediaOrderParams } from './types'

export const createMediaRecord = async (params: CreateMediaParams): Promise<MediaRecord> => {
  const { id, folderId, mediaUrl, orderIndex, layout } = params

  const result = await sql`
    INSERT INTO media (id, folder_id, media_url, order_index, layout, video_start_time, created_at, updated_at)
    VALUES (${id}, ${folderId}, ${mediaUrl}, ${orderIndex}, ${layout}, 0, NOW(), NOW())
    RETURNING id, folder_id, media_url, order_index, layout, video_start_time, created_at, updated_at
  `

  return (result as MediaRecord[])[0]
}

export const getMediaByFolder = async (folderId: number): Promise<MediaRecord[]> => {
  const result = await sql`
    SELECT id, folder_id, media_url, order_index, layout, video_start_time, created_at, updated_at
    FROM media
    WHERE folder_id = ${folderId}
    ORDER BY order_index ASC
  `

  return result as MediaRecord[]
}

export const updateMediaOrder = async (params: UpdateMediaOrderParams): Promise<MediaRecord> => {
  const { id, orderIndex } = params

  const result = await sql`
    UPDATE media
    SET order_index = ${orderIndex}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, folder_id, media_url, order_index, layout, video_start_time, created_at, updated_at
  `

  return (result as MediaRecord[])[0]
}

export const updateMediaLayout = async (id: string, layout: string): Promise<MediaRecord> => {
  const result = await sql`
    UPDATE media
    SET layout = ${layout}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, folder_id, media_url, order_index, layout, video_start_time, created_at, updated_at
  `

  return (result as MediaRecord[])[0]
}

export const updateMediaVideoStartTime = async (id: string, startTime: number): Promise<MediaRecord> => {
  console.log('[updateMediaVideoStartTime] Executing query with:', { id, startTime, type: typeof startTime })

  const result = await sql`
    UPDATE media
    SET video_start_time = ${startTime}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, folder_id, media_url, order_index, layout, video_start_time, created_at, updated_at
  `

  console.log('[updateMediaVideoStartTime] Query executed, result:', result)

  return (result as MediaRecord[])[0]
}

export const deleteMediaRecord = async (id: string): Promise<boolean> => {
  const result = await sql`
    DELETE FROM media 
    WHERE id = ${id}
  `
  
  return result.length > 0
}

export const getMediaWithFolder = async (folderId: number): Promise<(MediaRecord & { folder_name: string })[]> => {
  const result = await sql`
    SELECT m.id, m.folder_id, m.media_url, m.order_index, m.layout, m.video_start_time,
           m.created_at, m.updated_at, f.name as folder_name
    FROM media m
    JOIN folders f ON m.folder_id = f.id
    WHERE m.folder_id = ${folderId}
    ORDER BY m.order_index ASC
  `

  return result as (MediaRecord & { folder_name: string })[]
}

export const getMediaByFolderRecursive = async (folderId: number): Promise<MediaRecord[]> => {
  const result = await sql`
    WITH RECURSIVE folder_tree AS (
      SELECT id FROM folders WHERE id = ${folderId}
      UNION ALL
      SELECT f.id FROM folders f
      JOIN folder_tree ft ON f.parent_id = ft.id
    )
    SELECT m.id, m.folder_id, m.media_url, m.order_index, m.layout, m.video_start_time,
           m.created_at, m.updated_at
    FROM media m
    JOIN folder_tree ft ON m.folder_id = ft.id
    ORDER BY m.order_index ASC
  `

  return result as MediaRecord[]
}

export const deleteMediaByFolder = async (folderId: number): Promise<boolean> => {
  const result = await sql`
    DELETE FROM media 
    WHERE folder_id = ${folderId}
  `
  
  return result.length >= 0 // Could be 0 if folder is empty
}
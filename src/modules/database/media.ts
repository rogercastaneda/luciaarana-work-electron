import { sql } from './connection'
import type { MediaRecord, CreateMediaParams, UpdateMediaOrderParams } from './types'

export const createMediaRecord = async (params: CreateMediaParams): Promise<MediaRecord> => {
  const { id, folderId, mediaUrl, orderIndex, layout } = params
  
  const result = await sql`
    INSERT INTO media (id, folder_id, media_url, order_index, layout, created_at, updated_at)
    VALUES (${id}, ${folderId}, ${mediaUrl}, ${orderIndex}, ${layout}, NOW(), NOW())
    RETURNING *
  `
  
  return (result as MediaRecord[])[0]
}

export const getMediaByFolder = async (folderId: number): Promise<MediaRecord[]> => {
  const result = await sql`
    SELECT * FROM media 
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
    RETURNING *
  `
  
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
    SELECT m.*, f.name as folder_name
    FROM media m
    JOIN folders f ON m.folder_id = f.id
    WHERE m.folder_id = ${folderId}
    ORDER BY m.order_index ASC
  `
  
  return result as (MediaRecord & { folder_name: string })[]
}
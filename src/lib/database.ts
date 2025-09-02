import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | null = null

function getDatabase() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    sql = neon(connectionString)
  }
  return sql
}

export interface MediaAssetRecord {
  id: number
  contentful_asset_id: string
  filename: string
  content_type: string
  file_size: number
  folder_path: string
  orientation: "horizontal" | "vertical" | "square"
  is_hero: boolean
  metadata: any
  created_at: string
  updated_at: string
}

export async function saveMediaAsset(data: {
  contentfulAssetId: string
  filename: string
  contentType: string
  fileSize: number
  folderPath: string
  orientation: "horizontal" | "vertical" | "square"
  isHero?: boolean
  metadata?: any
}): Promise<MediaAssetRecord> {
  const db = getDatabase()
  const result = await db`
    INSERT INTO media_assets (
      contentful_asset_id, filename, content_type, file_size, 
      folder_path, orientation, is_hero, metadata
    ) VALUES (
      ${data.contentfulAssetId}, ${data.filename}, ${data.contentType}, 
      ${data.fileSize}, ${data.folderPath}, ${data.orientation}, 
      ${data.isHero || false}, ${JSON.stringify(data.metadata || {})}
    )
    RETURNING *
  `
  return (result as MediaAssetRecord[])[0]
}

export async function getMediaAssetsByFolder(folderPath: string): Promise<MediaAssetRecord[]> {
  const db = getDatabase()
  const result = await db`
    SELECT * FROM media_assets 
    WHERE folder_path = ${folderPath}
    ORDER BY created_at DESC
  `
  return result as MediaAssetRecord[]
}

export async function updateMediaAsset(
  id: number,
  updates: Partial<Pick<MediaAssetRecord, "orientation" | "is_hero" | "metadata">>,
): Promise<MediaAssetRecord> {
  const db = getDatabase()
  const result = await db`
    UPDATE media_assets 
    SET 
      orientation = COALESCE(${updates.orientation}, orientation),
      is_hero = COALESCE(${updates.is_hero}, is_hero),
      metadata = COALESCE(${JSON.stringify(updates.metadata)}, metadata),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return (result as MediaAssetRecord[])[0]
}

export async function deleteMediaAsset(id: number): Promise<void> {
  const db = getDatabase()
  await db`DELETE FROM media_assets WHERE id = ${id}`
}

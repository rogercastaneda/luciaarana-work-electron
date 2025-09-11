-- Migration: Add hero image field to folders table
-- This adds an optional hero image URL field for projects (non-parent folders)

-- Add hero_image_url column to folders table
ALTER TABLE folders ADD COLUMN IF NOT EXISTS hero_image_url TEXT NULL;

-- Add index for better performance when querying folders with hero images
CREATE INDEX IF NOT EXISTS idx_folders_hero_image_url ON folders(hero_image_url) WHERE hero_image_url IS NOT NULL;

-- Add comment to document the new field
COMMENT ON COLUMN folders.hero_image_url IS 'Optional hero image URL for projects (stored in Contentful)';
-- Migration: Add active status field to folders table
-- This adds a boolean field to mark projects as active or inactive
-- Inactive projects will not be shown in the web application

-- Add is_active column to folders table with default TRUE
ALTER TABLE folders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Update all existing records to be active by default
UPDATE folders SET is_active = TRUE WHERE is_active IS NULL;

-- Add index for better performance when filtering by active status
CREATE INDEX IF NOT EXISTS idx_folders_is_active ON folders(is_active);

-- Add comment to document the new field
COMMENT ON COLUMN folders.is_active IS 'Indicates if the project is active (visible in web app). Default is TRUE.';

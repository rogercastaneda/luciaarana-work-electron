-- Create folders table for hierarchical structure
-- Parent folders: Editorial, Beauty, Portrait, Fashion Campaign, Motion, Advertising
-- Subfolders: Projects within each parent folder

CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    parent_id INTEGER NULL REFERENCES folders(id) ON DELETE CASCADE,
    is_parent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT folders_unique_slug_per_parent UNIQUE(slug, parent_id)
);

-- Create media table for LuciaArana multimedia management
-- This table stores references to media files uploaded to Contentful
-- with folder organization, ordering, and layout information

CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(255) PRIMARY KEY,
    folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    layout VARCHAR(50) NOT NULL DEFAULT 'grid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_slug ON folders(slug);
CREATE INDEX IF NOT EXISTS idx_folders_is_parent ON folders(is_parent);

CREATE INDEX IF NOT EXISTS idx_media_folder_id ON media(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_folder_order ON media(folder_id, order_index);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

-- Create functions to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at when records are modified
CREATE TRIGGER update_folders_updated_at 
    BEFORE UPDATE ON folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at 
    BEFORE UPDATE ON media 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert the 6 fixed parent folders
INSERT INTO folders (name, slug, parent_id, is_parent) VALUES
    ('Editorial', 'editorial', NULL, true),
    ('Beauty', 'beauty', NULL, true),
    ('Portrait', 'portrait', NULL, true),
    ('Fashion Campaign', 'fashion-campaign', NULL, true),
    ('Motion', 'motion', NULL, true),
    ('Advertising', 'advertising', NULL, true)
ON CONFLICT (slug, parent_id) DO NOTHING;

-- Add comments to document the table structures
COMMENT ON TABLE folders IS 'Hierarchical folder structure with parent categories and project subfolders';
COMMENT ON COLUMN folders.id IS 'Unique identifier for the folder';
COMMENT ON COLUMN folders.name IS 'Display name of the folder';
COMMENT ON COLUMN folders.slug IS 'URL-friendly slug for the folder';
COMMENT ON COLUMN folders.parent_id IS 'Reference to parent folder (NULL for root folders)';
COMMENT ON COLUMN folders.is_parent IS 'True if this is a parent category folder';

COMMENT ON TABLE media IS 'Stores media file references with folder organization for LuciaArana multimedia management';
COMMENT ON COLUMN media.id IS 'Unique identifier for the media record';
COMMENT ON COLUMN media.folder_id IS 'Reference to the folder where the media belongs';
COMMENT ON COLUMN media.media_url IS 'Full URL to the media file stored in Contentful';
COMMENT ON COLUMN media.order_index IS 'Display order within the folder (0-based)';
COMMENT ON COLUMN media.layout IS 'Layout type for displaying media (grid, list, etc.)';
COMMENT ON COLUMN media.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN media.updated_at IS 'Timestamp when the record was last updated';
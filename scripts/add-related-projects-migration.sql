-- Migration: Add related projects fields to folders table
-- This adds optional related project references for project recommendations

-- Add related project fields to folders table (ya ejecutado)
-- ALTER TABLE folders ADD COLUMN IF NOT EXISTS related_project_1_id INTEGER NULL;
-- ALTER TABLE folders ADD COLUMN IF NOT EXISTS related_project_2_id INTEGER NULL;

-- Add foreign key constraints to ensure related projects exist and are valid projects (not parent categories)
ALTER TABLE folders ADD CONSTRAINT fk_related_project_1
    FOREIGN KEY (related_project_1_id) REFERENCES folders(id) ON DELETE SET NULL;

ALTER TABLE folders ADD CONSTRAINT fk_related_project_2
    FOREIGN KEY (related_project_2_id) REFERENCES folders(id) ON DELETE SET NULL;

-- Add indexes for better performance when querying related projects
CREATE INDEX IF NOT EXISTS idx_folders_related_project_1 ON folders(related_project_1_id) WHERE related_project_1_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_folders_related_project_2 ON folders(related_project_2_id) WHERE related_project_2_id IS NOT NULL;

-- Add comments to document the new fields
COMMENT ON COLUMN folders.related_project_1_id IS 'Optional first related project reference';
COMMENT ON COLUMN folders.related_project_2_id IS 'Optional second related project reference';
-- Add ordering field to folders table
-- This allows subfolder ordering within each parent category

ALTER TABLE folders
ADD COLUMN ordering INTEGER DEFAULT 0;

-- Update existing subfolders to have sequential ordering within their parent
-- This ensures consistent ordering for existing data
WITH ordered_folders AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY created_at) as row_num
  FROM folders
  WHERE is_parent = false
)
UPDATE folders
SET ordering = ordered_folders.row_num
FROM ordered_folders
WHERE folders.id = ordered_folders.id;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_folders_parent_ordering ON folders(parent_id, ordering) WHERE is_parent = false;
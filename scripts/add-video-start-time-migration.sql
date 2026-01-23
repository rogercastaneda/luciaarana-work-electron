-- Migration: Add video_start_time column to media table
-- Purpose: Store start time for videos in seconds
-- Date: 2026-01-22

-- Add video_start_time column to media table
ALTER TABLE media
ADD COLUMN video_start_time INTEGER DEFAULT 0;

COMMENT ON COLUMN media.video_start_time IS 'Video start time in seconds. Only applicable to video files. Default is 0 (start from beginning).';

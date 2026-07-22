-- Migration 005: Add creature_name column to habits table
-- Run this in Supabase SQL Editor

ALTER TABLE habits ADD COLUMN IF NOT EXISTS creature_name TEXT DEFAULT NULL;

-- Update the habits table's updated_at trigger if not already present
-- (creature_name is nullable — users name creatures when they hatch)

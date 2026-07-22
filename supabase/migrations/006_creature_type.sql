-- Migration 006: Add creature_type column to habits table
-- Stores the dragon species index (1-36) assigned at habit creation.
-- Run this in Supabase SQL Editor.

ALTER TABLE habits ADD COLUMN IF NOT EXISTS creature_type INTEGER DEFAULT NULL;

-- Migration 007: Add server-persisted UI state columns to user_preferences
-- These were previously localStorage-only, which broke on device switch.
-- Run this in Supabase SQL Editor.

ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS last_checkin_date TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS last_bonus_date TEXT;

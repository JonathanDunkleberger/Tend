-- Migration 008: Persist the wellness "three good things" gratitude log server-side.
-- Was localStorage-only, so it was lost on a device switch and couldn't be
-- surfaced in Insights. Stored as an append-only JSONB array of
-- { date: 'YYYY-MM-DD', items: string[] }, capped client-side to the last 60.
-- Run this in the Supabase SQL Editor.

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS gratitude_entries JSONB NOT NULL DEFAULT '[]';

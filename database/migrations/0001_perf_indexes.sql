-- Create required extension for trigram indexes (safe if it already exists)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Composite indexes to speed up common filters and sorts
-- Newest first queries: WHERE locale = ? AND is_public = true ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_created_at
  ON scenario (locale, is_public, created_at DESC);

-- Popular queries: WHERE locale = ? AND is_public = true ORDER BY view_count DESC
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_view_count
  ON scenario (locale, is_public, view_count DESC);

-- Return-sorted queries: WHERE locale = ? AND is_public = true ORDER BY annual_return DESC
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_annual_return
  ON scenario (locale, is_public, annual_return DESC);

-- Amount-sorted queries: WHERE locale = ? AND is_public = true ORDER BY initial_amount DESC
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_initial_amount
  ON scenario (locale, is_public, initial_amount DESC);

-- Filter by predefined status and recency: WHERE locale = ? AND is_public = true AND is_predefined = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_predef_created_at
  ON scenario (locale, is_public, is_predefined, created_at DESC);

-- Speed up trending queries that consider a recent updated window and order by views
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_updated_at
  ON scenario (locale, is_public, updated_at DESC);

-- GIN index for fast array overlap on tags ("tags && ARRAY[...]" queries)
CREATE INDEX IF NOT EXISTS idx_scenario_tags_gin
  ON scenario USING GIN (tags);

-- Trigram GIN indexes for substring search in name/description
CREATE INDEX IF NOT EXISTS idx_scenario_name_trgm
  ON scenario USING GIN (lower(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_scenario_description_trgm
  ON scenario USING GIN (lower(description) gin_trgm_ops);

-- Covering partial indexes replacing earlier non-covering versions to enable index-only scans for listings.
-- Drops older simple composite indexes (if present) and recreates them with INCLUDE + partial predicate.

-- 1. Drop previous indexes (safe if missing)
DROP INDEX IF EXISTS idx_scenario_locale_public_created_at;
DROP INDEX IF EXISTS idx_scenario_locale_public_view_count;
DROP INDEX IF EXISTS idx_scenario_locale_public_annual_return;
DROP INDEX IF EXISTS idx_scenario_locale_public_initial_amount;

-- 2. Recreate as covering partial indexes (WHERE is_public = true)
-- Newest first listings & recent scenarios
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_created_at
  ON scenario (locale, created_at DESC)
  INCLUDE (slug, name, initial_amount, monthly_contribution, annual_return, time_horizon, view_count, is_predefined)
  WHERE is_public = true;

-- Popular (by view count)
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_view_count
  ON scenario (locale, view_count DESC)
  INCLUDE (slug, name, initial_amount, monthly_contribution, annual_return, time_horizon, created_at, is_predefined)
  WHERE is_public = true;

-- High return ordering
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_annual_return
  ON scenario (locale, annual_return DESC)
  INCLUDE (slug, name, initial_amount, monthly_contribution, time_horizon, view_count, created_at, is_predefined)
  WHERE is_public = true;

-- Large initial amount ordering
CREATE INDEX IF NOT EXISTS idx_scenario_locale_public_initial_amount
  ON scenario (locale, initial_amount DESC)
  INCLUDE (slug, name, monthly_contribution, annual_return, time_horizon, view_count, created_at, is_predefined)
  WHERE is_public = true;

-- Note: If index bloat becomes an issue, consider consolidating by dropping the least used ordering paths
-- or leveraging a single multi-purpose BRIN for very large tables. For current scale, these targeted btree
-- indexes provide fast index-only scans for principal sort modes.

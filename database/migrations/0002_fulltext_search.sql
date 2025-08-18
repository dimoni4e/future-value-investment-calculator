-- Full-text search migration: adds tsvector column and GIN index, plus trigger for automatic updates.
-- Idempotent where possible.

-- Ensure required extension for full text is present (should be default in Postgres)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1. Add tsvector column (if not exists) to scenario for combined searchable text (locale-specific config)
ALTER TABLE scenario
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Backfill existing rows (use simple config; could vary by locale if needed)
UPDATE scenario
SET search_vector =
  to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,''));

-- 3. Create GIN index on the tsvector
CREATE INDEX IF NOT EXISTS idx_scenario_search_vector
  ON scenario USING GIN (search_vector);

-- 4. Trigger function to keep search_vector updated
CREATE OR REPLACE FUNCTION scenario_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger (fires on insert or update of name/description)
CREATE TRIGGER trg_scenario_search_vector_update
  BEFORE INSERT OR UPDATE OF name, description ON scenario
  FOR EACH ROW EXECUTE FUNCTION scenario_search_vector_update();

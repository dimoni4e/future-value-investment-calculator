\echo 'Starting restore'
\set ON_ERROR_STOP on
BEGIN;
-- Optional clean (comment out if restoring into empty fresh DB)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'locale' AND pg_namespace.nspname = 'public') THEN
    EXECUTE 'DROP TYPE public.locale CASCADE';
  END IF;
END $$;
DROP SCHEMA IF EXISTS drizzle CASCADE;
DROP TABLE IF EXISTS public.scenario_trending_snapshot;
DROP TABLE IF EXISTS public.scenario_category_counts;
DROP TABLE IF EXISTS public.scenario;
DROP TABLE IF EXISTS public.pages;
DROP TABLE IF EXISTS public.home_content;
-- Recreate everything from the plain SQL dump
\i backup-full.sql
COMMIT;
\echo 'Restore complete'

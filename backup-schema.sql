--
-- PostgreSQL database dump
--

\restrict ZEeDUnTaOg6c8cMvLXJLtRvuvcYHUdhKr2VlxTovKiWM1Il0RwrHJbq9GTlpREp

-- Dumped from database version 17.5 (1b53132)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO neondb_owner;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: locale; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.locale AS ENUM (
    'en',
    'pl',
    'es'
);


ALTER TYPE public.locale OWNER TO neondb_owner;

--
-- Name: scenario_search_vector_update(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.scenario_search_vector_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.scenario_search_vector_update() OWNER TO neondb_owner;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: neondb_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: neondb_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: neondb_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: home_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.home_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    locale character varying(5) NOT NULL,
    section character varying(50) NOT NULL,
    key character varying(100) NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT home_content_locale_check CHECK (((locale)::text = ANY ((ARRAY['en'::character varying, 'pl'::character varying, 'es'::character varying])::text[])))
);


ALTER TABLE public.home_content OWNER TO neondb_owner;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(100) NOT NULL,
    locale character varying(5) NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    meta_description character varying(300),
    meta_keywords text,
    published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pages_locale_check CHECK (((locale)::text = ANY ((ARRAY['en'::character varying, 'pl'::character varying, 'es'::character varying])::text[])))
);


ALTER TABLE public.pages OWNER TO neondb_owner;

--
-- Name: scenario; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.scenario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(100) NOT NULL,
    locale character varying(5) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    initial_amount numeric(15,2) NOT NULL,
    monthly_contribution numeric(15,2) NOT NULL,
    annual_return numeric(5,2) NOT NULL,
    time_horizon integer NOT NULL,
    tags text[],
    is_predefined boolean DEFAULT false,
    is_public boolean DEFAULT false,
    created_by character varying(100) DEFAULT 'system'::character varying,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    search_vector tsvector,
    CONSTRAINT scenarios_annual_return_check CHECK (((annual_return >= (0)::numeric) AND (annual_return <= (100)::numeric))),
    CONSTRAINT scenarios_initial_amount_check CHECK ((initial_amount >= (0)::numeric)),
    CONSTRAINT scenarios_locale_check CHECK (((locale)::text = ANY ((ARRAY['en'::character varying, 'pl'::character varying, 'es'::character varying])::text[]))),
    CONSTRAINT scenarios_monthly_contribution_check CHECK ((monthly_contribution >= (0)::numeric)),
    CONSTRAINT scenarios_time_horizon_check CHECK (((time_horizon > 0) AND (time_horizon <= 100)))
);


ALTER TABLE public.scenario OWNER TO neondb_owner;

--
-- Name: scenario_category_counts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.scenario_category_counts (
    locale public.locale NOT NULL,
    category character varying(100) NOT NULL,
    count integer NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.scenario_category_counts OWNER TO neondb_owner;

--
-- Name: scenario_trending_snapshot; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.scenario_trending_snapshot (
    locale public.locale NOT NULL,
    slug character varying(100) NOT NULL,
    rank integer NOT NULL,
    view_count integer NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.scenario_trending_snapshot OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: home_content home_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.home_content
    ADD CONSTRAINT home_content_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: scenario scenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenarios_pkey PRIMARY KEY (id);


--
-- Name: home_content unique_content_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.home_content
    ADD CONSTRAINT unique_content_key UNIQUE (locale, section, key);


--
-- Name: pages unique_page_locale; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT unique_page_locale UNIQUE (slug, locale);


--
-- Name: scenario unique_scenario_locale; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT unique_scenario_locale UNIQUE (slug, locale);


--
-- Name: idx_category_locale_category; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_category_locale_category ON public.scenario_category_counts USING btree (locale, category);


--
-- Name: idx_category_locale_count; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_category_locale_count ON public.scenario_category_counts USING btree (locale, count DESC);


--
-- Name: idx_home_content_locale_section; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_home_content_locale_section ON public.home_content USING btree (locale, section);


--
-- Name: idx_pages_locale_published; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pages_locale_published ON public.pages USING btree (locale, published);


--
-- Name: idx_scenario_locale_public_annual_return; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenario_locale_public_annual_return ON public.scenario USING btree (locale, annual_return DESC) INCLUDE (slug, name, initial_amount, monthly_contribution, time_horizon, view_count, created_at, is_predefined) WHERE (is_public = true);


--
-- Name: idx_scenario_locale_public_created_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenario_locale_public_created_at ON public.scenario USING btree (locale, created_at DESC) INCLUDE (slug, name, initial_amount, monthly_contribution, annual_return, time_horizon, view_count, is_predefined) WHERE (is_public = true);


--
-- Name: idx_scenario_locale_public_initial_amount; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenario_locale_public_initial_amount ON public.scenario USING btree (locale, initial_amount DESC) INCLUDE (slug, name, monthly_contribution, annual_return, time_horizon, view_count, created_at, is_predefined) WHERE (is_public = true);


--
-- Name: idx_scenario_locale_public_view_count; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenario_locale_public_view_count ON public.scenario USING btree (locale, view_count DESC) INCLUDE (slug, name, initial_amount, monthly_contribution, annual_return, time_horizon, created_at, is_predefined) WHERE (is_public = true);


--
-- Name: idx_scenario_search_vector; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenario_search_vector ON public.scenario USING gin (search_vector);


--
-- Name: idx_scenarios_locale_predefined; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenarios_locale_predefined ON public.scenario USING btree (locale, is_predefined);


--
-- Name: idx_scenarios_public; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenarios_public ON public.scenario USING btree (is_public) WHERE (is_public = true);


--
-- Name: idx_scenarios_tags; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenarios_tags ON public.scenario USING gin (tags);


--
-- Name: idx_scenarios_view_count; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_scenarios_view_count ON public.scenario USING btree (view_count DESC);


--
-- Name: idx_trending_locale_rank; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_trending_locale_rank ON public.scenario_trending_snapshot USING btree (locale, rank);


--
-- Name: idx_trending_locale_slug; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_trending_locale_slug ON public.scenario_trending_snapshot USING btree (locale, slug);


--
-- Name: scenario trg_scenario_search_vector_update; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_scenario_search_vector_update BEFORE INSERT OR UPDATE OF name, description ON public.scenario FOR EACH ROW EXECUTE FUNCTION public.scenario_search_vector_update();


--
-- Name: home_content update_home_content_updated_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON public.home_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pages update_pages_updated_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: scenario update_scenarios_updated_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON public.scenario FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict ZEeDUnTaOg6c8cMvLXJLtRvuvcYHUdhKr2VlxTovKiWM1Il0RwrHJbq9GTlpREp


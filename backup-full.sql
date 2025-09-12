--
-- PostgreSQL database dump
--

\restrict bTh3lHViyMzMZ4iaNoAeqEbJnYW2LWDT0RYTTChVkNsd5mSwjXr9YePKnJVUrVo

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
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: locale; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.locale AS ENUM (
    'en',
    'pl',
    'es'
);


--
-- Name: scenario_search_vector_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.scenario_search_vector_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: home_content; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: scenario; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: scenario_category_counts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scenario_category_counts (
    locale public.locale NOT NULL,
    category character varying(100) NOT NULL,
    count integer NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: scenario_trending_snapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scenario_trending_snapshot (
    locale public.locale NOT NULL,
    slug character varying(100) NOT NULL,
    rank integer NOT NULL,
    view_count integer NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: home_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.home_content (id, locale, section, key, value, created_at, updated_at) FROM stdin;
ee96558c-480a-43f8-a814-4b64eeb1dcc3	en	layout	title	Financial Growth Planner	2025-06-23 11:09:42.980936+00	2025-06-23 11:09:42.980936+00
0069be7c-2bb0-41c1-9999-cae2fa9dd7aa	en	layout	description	Plan Your Financial Future	2025-06-23 11:09:42.980936+00	2025-06-23 11:09:42.980936+00
e6b9eeb3-7c5e-4890-9b7e-2efa684d0680	en	navigation	home	Home	2025-06-23 11:09:43.11743+00	2025-06-23 11:09:43.11743+00
6f60e1be-a378-4626-aff0-41ab4d438f4b	en	navigation	about	About	2025-06-23 11:09:43.11743+00	2025-06-23 11:09:43.11743+00
de383200-0f44-4d0c-9750-cafd85b265de	en	navigation	contact	Contact	2025-06-23 11:09:43.11743+00	2025-06-23 11:09:43.11743+00
e66433e4-55e5-405f-ae1d-906d5adc6b1a	en	navigation	getStarted	Get Started	2025-06-23 11:09:43.11743+00	2025-06-23 11:09:43.11743+00
5bfddb8e-d019-4c7f-8266-b955cb970f5e	en	hero	badge	Professional Investment Planning	2025-06-23 11:09:43.251456+00	2025-06-23 11:09:43.251456+00
993ec088-5f4b-4021-a7d8-29880b6e549d	en	hero	subtitle	Make informed investment decisions with our advanced compound interest calculator. Visualize growth scenarios, compare strategies, and build confidence in your financial journey.	2025-06-23 11:09:43.251456+00	2025-06-23 11:09:43.251456+00
72cc386f-2282-450b-ab2e-7e1885cccb6d	en	hero	startCalculating	Start Calculating	2025-06-23 11:09:43.251456+00	2025-06-23 11:09:43.251456+00
ffbdb18e-7ee8-41b6-abd1-70c48a08f58b	en	hero	watchDemo	Watch Demo	2025-06-23 11:09:43.251456+00	2025-06-23 11:09:43.251456+00
c35f2856-dce1-40fc-8a06-9d7f26288437	en	hero	compoundInterest	Compound Interest	2025-06-23 11:09:43.251456+00	2025-06-23 11:09:43.251456+00
55d85969-8d27-4874-a59e-5a44091359c0	en	hero	interactiveCharts	Interactive Charts	2025-06-23 11:09:43.251456+00	2025-06-23 11:09:43.251456+00
62ef8303-b600-44ac-9599-d7df32b40979	en	hero	scenarioPlanning	Scenario Planning	2025-06-23 11:09:43.251456+00	2025-06-23 11:09:43.251456+00
fbfda447-e915-4951-8309-e8c3d1a2c0ac	en	hero	exportResults	Export Results	2025-06-23 11:09:43.251456+00	2025-06-23 11:09:43.251456+00
1ce2126f-70b6-46ef-b839-a29adc2c66df	en	features	advancedCalculator	Advanced Calculator	2025-06-23 11:09:43.383373+00	2025-06-23 11:09:43.383373+00
5ec38cc2-b31e-435e-b8f2-3af0f9d6ccfe	en	features	advancedCalculatorDesc	Precise compound interest calculations with customizable parameters for any investment scenario	2025-06-23 11:09:43.383373+00	2025-06-23 11:09:43.383373+00
06776284-e331-4cbc-be31-1c6906d3e178	en	features	visualAnalytics	Visual Analytics	2025-06-23 11:09:43.383373+00	2025-06-23 11:09:43.383373+00
4d1ed75e-4d57-4e77-8852-2ae36754d236	en	features	visualAnalyticsDesc	Interactive charts and graphs that bring your investment projections to life	2025-06-23 11:09:43.383373+00	2025-06-23 11:09:43.383373+00
5d71cf24-2b15-458f-97cb-4b7969c1b76d	en	features	goalPlanning	Goal Planning	2025-06-23 11:09:43.383373+00	2025-06-23 11:09:43.383373+00
03798e6f-31d1-4ec1-a611-a625c530c79f	en	features	goalPlanningDesc	Set financial targets and see exactly what it takes to achieve your investment goals	2025-06-23 11:09:43.383373+00	2025-06-23 11:09:43.383373+00
26cbcfbb-00f7-4c93-b7f5-ef09b758fca2	es	layout	title	Planificador de Crecimiento Financiero	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
cfbe7e64-dc72-4cb1-9040-f846674cd1f9	es	layout	description	Planifica Tu Futuro Financiero	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
d7de8a16-31fe-4292-a7ce-25859fae5cba	es	navigation	home	Inicio	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
09246bb7-14d2-4c34-bf9f-5f2539f16276	es	navigation	about	Acerca de	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
f62beb77-1a89-4262-bab4-164527d28a16	es	navigation	contact	Contacto	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
41066677-8eb6-4ae5-9199-e07b69db6148	es	navigation	getStarted	Comenzar	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
08c69993-bfd1-4f4e-8f07-515924b35206	es	hero	badge	Planificación de Inversiones Profesional	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
dd07af86-1956-40d5-a48c-77b8768ea6cc	es	hero	subtitle	Toma decisiones de inversión informadas con nuestra calculadora avanzada de interés compuesto. Visualiza escenarios de crecimiento, compara estrategias y construye confianza en tu viaje financiero.	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
31a4b363-8c0e-47c1-9133-261fa6b67b16	es	hero	startCalculating	Comenzar Cálculo	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
ae448180-e71a-4c6d-9e87-83ffafb18e5a	es	hero	watchDemo	Ver Demo	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
b4451934-7489-4890-8e36-944c07d02531	es	hero	compoundInterest	Interés Compuesto	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
8db46b5c-19b5-43dc-b282-186ec6162ffc	es	hero	interactiveCharts	Gráficos Interactivos	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
3027d40b-2dbf-48ec-b748-1968990cceb0	es	hero	scenarioPlanning	Planificación de Escenarios	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
f81a5a9d-a9c0-4441-9b72-83e0e919f0db	es	hero	exportResults	Exportar Resultados	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
1f8d2f85-759b-4ebd-bd8a-4349f31199de	es	features	subtitle	Herramientas avanzadas y análisis para ayudarte a tomar decisiones de inversión informadas con confianza	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
667c75d5-c8c5-4456-ad44-0827395d4454	es	features	advancedCalculator	Calculadora Avanzada	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
05bbae6d-d138-4ecb-b498-18a5b8472f79	es	features	advancedCalculatorDesc	Cálculos precisos de interés compuesto con parámetros personalizables para cualquier escenario de inversión	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
da0fa768-836e-4158-a03c-85226320c81b	es	features	visualAnalytics	Análisis Visual	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
f6380ee4-a786-4ac9-aa50-249ac9285403	es	features	visualAnalyticsDesc	Gráficos interactivos que dan vida a tus proyecciones de inversión	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
6f98e34d-9347-4a0b-88cd-453c77053f20	es	features	goalPlanning	Planificación de Objetivos	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
a52118d8-2fad-4bf6-b4f8-9bd62f430714	es	features	goalPlanningDesc	Establece metas financieras y ve exactamente lo que se necesita para lograr tus objetivos de inversión	2025-06-23 11:54:45.604094+00	2025-06-23 11:54:45.604094+00
49428f26-af43-405e-95c5-aee28d88574f	pl	layout	title	Planer Wzrostu Finansowego	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
9126d13f-8e11-46a6-9ce5-5528ccfd3851	pl	layout	description	Zaplanuj Swoją Przyszłość Finansową	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
9c9e8e80-a472-4ce3-bcef-3fc797ba9698	pl	navigation	home	Strona główna	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
a2f79a67-fdf8-49e5-9236-006ac4fbe014	pl	navigation	about	O nas	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
5cd8319e-9ee6-4ec2-a285-582c49a2283f	pl	navigation	contact	Kontakt	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
3e0561ad-44a7-47b2-b9ee-f7d23f1a263c	pl	navigation	getStarted	Rozpocznij	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
d820b681-d807-4550-b7db-09733ade5bca	pl	hero	badge	Profesjonalne Planowanie Inwestycji	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
96fae691-012d-4bbe-b3ed-fed065935b32	pl	hero	subtitle	Podejmuj świadome decyzje inwestycyjne dzięki naszemu zaawansowanemu kalkulatorowi odsetek składanych. Wizualizuj scenariusze wzrostu, porównuj strategie i buduj pewność w swojej podróży finansowej.	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
af09e0e6-eb69-4187-8a61-2b3e7b3ceedc	pl	hero	startCalculating	Rozpocznij Obliczenia	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
7f97a499-14db-456a-b5d3-1bae7947add7	pl	hero	watchDemo	Zobacz Demo	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
0d45b956-8816-4c1f-8a56-a90e401706d3	pl	hero	compoundInterest	Odsetki Składane	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
7c3999d1-9756-4d30-99b3-679cb2c85625	pl	hero	interactiveCharts	Interaktywne Wykresy	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
6dcf8cb3-a1cd-4ba9-96b0-8765f88de2d5	pl	hero	scenarioPlanning	Planowanie Scenariuszy	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
6ff8c961-392c-4350-832a-37cab124791e	pl	hero	exportResults	Eksport Wyników	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
53364c84-3f6a-4963-951e-95dd224fb801	pl	features	subtitle	Zaawansowane narzędzia i analityka pomagające podejmować świadome decyzje inwestycyjne z pewnością siebie	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
4f78ac40-b2a9-443e-b9ab-cce18a286d9e	pl	features	advancedCalculator	Zaawansowany Kalkulator	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
6253fe8c-5cc9-42eb-9e35-2ad5936d5504	pl	features	advancedCalculatorDesc	Precyzyjne obliczenia odsetek składanych z konfigurowalnymi parametrami dla każdego scenariusza inwestycyjnego	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
93b49df2-d26f-49da-8f79-752f91f8dc69	pl	features	visualAnalytics	Analityka Wizualna	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
6ce45990-dfd1-4166-b200-cb5f135e02f4	pl	trust_signals	calculations_count	1M+	2025-07-30 14:36:35.861728+00	2025-07-30 14:36:35.861728+00
b6c80409-25aa-4dff-949a-9754ad406cfe	es	features	title	Características Avanzadas de la Calculadora	2025-06-23 11:54:45.604094+00	2025-07-30 14:55:09.493853+00
6eded893-e45e-45d3-948b-162e57327d7d	pl	features	title	Zaawansowane Funkcje Kalkulatora	2025-06-23 11:54:45.742014+00	2025-07-30 14:55:10.546116+00
5628e07f-a7cc-4909-ac15-8edf33ce3929	pl	features	visualAnalyticsDesc	Interaktywne wykresy i grafy, które ożywiają twoje prognozy inwestycyjne	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
58ed094c-8214-4ea7-864d-cfb0f8b2868b	pl	features	goalPlanning	Planowanie Celów	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
0caa0128-3275-40de-be67-cf456e216b03	pl	features	goalPlanningDesc	Ustaw cele finansowe i zobacz dokładnie, co trzeba zrobić, aby osiągnąć swoje cele inwestycyjne	2025-06-23 11:54:45.742014+00	2025-06-23 11:54:45.742014+00
317d7b8e-7391-48a8-887d-cafd13d52351	en	hero	main_headline	Calculate Your Financial Future with Precision - Free Investment Calculator	2025-07-30 14:36:25.836005+00	2025-07-30 14:36:25.836005+00
6a58545b-c02b-482a-a68f-a7db87e20c8c	pl	hero	main_headline	Oblicz Swoją Finansową Przyszłość z Precyzją - Darmowy Kalkulator Inwestycji	2025-07-30 14:36:26.100615+00	2025-07-30 14:36:26.100615+00
42c0ffd0-5591-418f-8a72-4e2c80efc22a	es	hero	main_headline	Calcula Tu Futuro Financiero con Precisión - Calculadora de Inversión Gratuita	2025-07-30 14:36:26.34871+00	2025-07-30 14:36:26.34871+00
dd920018-80db-4007-884d-379be320a628	en	hero	sub_headline	Plan your retirement, track compound interest growth, and make informed investment decisions with our advanced future value calculator. Trusted by over 50,000 investors worldwide.	2025-07-30 14:36:26.601352+00	2025-07-30 14:36:26.601352+00
202d8b8d-8a6a-40a2-b7b8-34b695da1a41	pl	hero	sub_headline	Planuj swoją emeryturę, śledź wzrost składanych odsetek i podejmuj świadome decyzje inwestycyjne dzięki naszemu zaawansowanemu kalkulatorowi wartości przyszłej. Zaufało nam ponad 50 000 inwestorów na całym świecie.	2025-07-30 14:36:26.84943+00	2025-07-30 14:36:26.84943+00
ce437caf-6fd1-455d-bbbc-2b42f7be712b	es	hero	sub_headline	Planifica tu jubilación, rastrea el crecimiento del interés compuesto y toma decisiones de inversión informadas con nuestra calculadora avanzada de valor futuro. Confiado por más de 50,000 inversores en todo el mundo.	2025-07-30 14:36:27.092833+00	2025-07-30 14:36:27.092833+00
d19ba5b5-b96b-452a-aad2-717867ecb706	en	hero	cta_primary	Start Calculating Now - Its Free	2025-07-30 14:36:27.335608+00	2025-07-30 14:36:27.335608+00
0e996bb7-6aa6-4b8d-bb98-1bd11d7465b2	pl	hero	cta_primary	Zacznij Liczyć Teraz - To Bezpłatne	2025-07-30 14:36:27.576938+00	2025-07-30 14:36:27.576938+00
66d8acb3-1b01-4beb-8052-7dd86f893892	es	hero	cta_primary	Comenzar a Calcular Ahora - Es Gratis	2025-07-30 14:36:27.821016+00	2025-07-30 14:36:27.821016+00
ca2d90a4-b9fd-4fb3-a451-742e5bed18ce	en	benefits	title	Why Choose Our Investment Calculator?	2025-07-30 14:36:28.062752+00	2025-07-30 14:36:28.062752+00
0916740d-c028-446e-9093-edb57d11f04b	pl	benefits	title	Dlaczego Wybrać Nasz Kalkulator Inwestycji?	2025-07-30 14:36:28.312538+00	2025-07-30 14:36:28.312538+00
b5f07c0a-4b08-43b3-b74b-721145a9e746	es	benefits	title	¿Por Qué Elegir Nuestra Calculadora de Inversión?	2025-07-30 14:36:28.552993+00	2025-07-30 14:36:28.552993+00
23dbbc0e-cb9f-4937-9092-20d1a706f89c	en	benefits	benefit_1_title	Accurate Compound Interest Calculations	2025-07-30 14:36:28.792968+00	2025-07-30 14:36:28.792968+00
6d43f54f-2c6a-43ef-9267-121c9f310065	pl	benefits	benefit_1_title	Dokładne Obliczenia Składanych Odsetek	2025-07-30 14:36:29.034692+00	2025-07-30 14:36:29.034692+00
7aff3132-72a4-4656-ad1c-326e3c2f8f9c	es	benefits	benefit_1_title	Cálculos Precisos de Interés Compuesto	2025-07-30 14:36:29.279706+00	2025-07-30 14:36:29.279706+00
140500a1-7b8e-430c-a66c-56c279e98d75	en	benefits	benefit_1_description	Our advanced algorithm considers monthly contributions, annual returns, and time horizons to provide precise future value projections for your investments.	2025-07-30 14:36:29.522835+00	2025-07-30 14:36:29.522835+00
fa9ab229-e936-465d-b187-6f3b74d9161f	pl	benefits	benefit_1_description	Nasz zaawansowany algorytm uwzględnia miesięczne składki, roczne zwroty i horyzonty czasowe, aby zapewnić precyzyjne prognozy wartości przyszłej Twoich inwestycji.	2025-07-30 14:36:29.765656+00	2025-07-30 14:36:29.765656+00
b6b2d193-8d31-417e-89fe-932efb5f0509	es	benefits	benefit_1_description	Nuestro algoritmo avanzado considera contribuciones mensuales, rendimientos anuales y horizontes temporales para proporcionar proyecciones precisas del valor futuro de tus inversiones.	2025-07-30 14:36:30.009833+00	2025-07-30 14:36:30.009833+00
112d6b3e-d7b7-4b67-9d45-2ebd82949b3c	en	benefits	benefit_2_title	Multiple Investment Scenarios	2025-07-30 14:36:30.255706+00	2025-07-30 14:36:30.255706+00
f247b014-d3c6-4732-bc3e-92061aa53a2d	pl	benefits	benefit_2_title	Wielokrotne Scenariusze Inwestycyjne	2025-07-30 14:36:30.50296+00	2025-07-30 14:36:30.50296+00
f0662982-d2d9-4d09-81e5-dedb1d04e672	es	benefits	benefit_2_title	Múltiples Escenarios de Inversión	2025-07-30 14:36:30.750249+00	2025-07-30 14:36:30.750249+00
983e646e-a01a-453e-90a2-b35115c363ee	en	benefits	benefit_2_description	Compare different investment strategies including conservative retirement planning, aggressive growth investing, and balanced portfolio approaches.	2025-07-30 14:36:31.003096+00	2025-07-30 14:36:31.003096+00
f75c5e1e-f79e-4dde-9b19-8a2532c771b1	pl	benefits	benefit_2_description	Porównaj różne strategie inwestycyjne, w tym konserwatywne planowanie emerytalne, agresywne inwestowanie wzrostowe i zrównoważone podejścia portfelowe.	2025-07-30 14:36:31.245365+00	2025-07-30 14:36:31.245365+00
f140f30b-aff7-4db9-ba43-0f253fb37d73	es	benefits	benefit_2_description	Compara diferentes estrategias de inversión incluyendo planificación conservadora de jubilación, inversión agresiva de crecimiento y enfoques de cartera equilibrada.	2025-07-30 14:36:31.489205+00	2025-07-30 14:36:31.489205+00
74bfa676-12a2-46a3-9232-f610d3e739a6	en	benefits	benefit_3_title	Visual Growth Charts & Analytics	2025-07-30 14:36:31.735128+00	2025-07-30 14:36:31.735128+00
adbe5dae-40a5-44e7-895d-b8406a442b12	pl	benefits	benefit_3_title	Wizualne Wykresy Wzrostu i Analityka	2025-07-30 14:36:32.051906+00	2025-07-30 14:36:32.051906+00
22eec444-95d3-477b-96ae-aa1163d5f038	es	benefits	benefit_3_title	Gráficos de Crecimiento Visual y Análisis	2025-07-30 14:36:32.298996+00	2025-07-30 14:36:32.298996+00
2305aa36-785d-457a-9b51-ab04a8fa9a24	en	benefits	benefit_3_description	Interactive charts show your investment growth over time, helping you understand the power of compound interest and make data-driven financial decisions.	2025-07-30 14:36:32.547366+00	2025-07-30 14:36:32.547366+00
35a34ad5-5d87-43fa-b328-013107b6f624	pl	benefits	benefit_3_description	Interaktywne wykresy pokazują wzrost Twoich inwestycji w czasie, pomagając zrozumieć siłę składanych odsetek i podejmować finansowe decyzje oparte na danych.	2025-07-30 14:36:32.799451+00	2025-07-30 14:36:32.799451+00
f7963104-eecb-4ac7-98cc-4cac71bb5aca	es	benefits	benefit_3_description	Los gráficos interactivos muestran el crecimiento de tu inversión a lo largo del tiempo, ayudándote a entender el poder del interés compuesto y tomar decisiones financieras basadas en datos.	2025-07-30 14:36:33.057429+00	2025-07-30 14:36:33.057429+00
42bb71b9-952d-4052-9225-85e91f43721f	en	trust_signals	title	Trusted by Investors Worldwide	2025-07-30 14:36:33.305293+00	2025-07-30 14:36:33.305293+00
9ea93957-a768-4ae7-b04d-bf4ba1c18125	pl	trust_signals	title	Zaufany przez Inwestorów na Całym Świecie	2025-07-30 14:36:33.559349+00	2025-07-30 14:36:33.559349+00
fe5b34f3-d2d2-4182-8806-66bfcdd97cce	es	trust_signals	title	Confiado por Inversores en Todo el Mundo	2025-07-30 14:36:33.806948+00	2025-07-30 14:36:33.806948+00
33d9fd45-0953-498e-8cf5-0747bdd9182b	en	trust_signals	users_count	50,000+	2025-07-30 14:36:34.051818+00	2025-07-30 14:36:34.051818+00
9b5e3295-98ab-4031-a285-1f5fccacdc8e	pl	trust_signals	users_count	50,000+	2025-07-30 14:36:34.296288+00	2025-07-30 14:36:34.296288+00
629cbd62-09b6-43da-a99d-d62d22a33f3f	es	trust_signals	users_count	50,000+	2025-07-30 14:36:34.547471+00	2025-07-30 14:36:34.547471+00
05a0a63c-95cb-4ac9-a83b-429b6b3ab121	en	trust_signals	users_label	Active Users	2025-07-30 14:36:34.793231+00	2025-07-30 14:36:34.793231+00
c55df1e1-e769-4eb4-8929-171b6d252be4	pl	trust_signals	users_label	Aktywni Użytkownicy	2025-07-30 14:36:35.101917+00	2025-07-30 14:36:35.101917+00
08bf4988-e3ed-4858-bda3-95de3c043971	es	trust_signals	users_label	Usuarios Activos	2025-07-30 14:36:35.354956+00	2025-07-30 14:36:35.354956+00
9a8ad91a-0c43-4378-8e25-78761e5fc909	en	trust_signals	calculations_count	1M+	2025-07-30 14:36:35.610663+00	2025-07-30 14:36:35.610663+00
89fadf45-0d26-4019-80d9-34c5667319c5	es	trust_signals	calculations_count	1M+	2025-07-30 14:36:36.113041+00	2025-07-30 14:36:36.113041+00
84d0e668-bcd9-46bb-890a-96f0eef26bc2	en	trust_signals	calculations_label	Calculations Performed	2025-07-30 14:36:36.362901+00	2025-07-30 14:36:36.362901+00
f9ed0cf7-c9b2-4e24-a083-5910cf26e897	pl	trust_signals	calculations_label	Wykonanych Obliczeń	2025-07-30 14:36:36.613112+00	2025-07-30 14:36:36.613112+00
dd775ecf-3cb1-43b9-a8da-7540bfa51bba	es	trust_signals	calculations_label	Cálculos Realizados	2025-07-30 14:36:36.859106+00	2025-07-30 14:36:36.859106+00
7e6e4d29-d673-460a-9ecb-c3853763a4aa	en	trust_signals	accuracy_rate	99.9%	2025-07-30 14:36:37.113095+00	2025-07-30 14:36:37.113095+00
4cd68c5e-634f-414d-94ac-ed14ced8c19e	pl	trust_signals	accuracy_rate	99.9%	2025-07-30 14:36:37.430074+00	2025-07-30 14:36:37.430074+00
bfb3d921-07fa-46df-90f6-85b5edede725	es	trust_signals	accuracy_rate	99.9%	2025-07-30 14:36:37.680955+00	2025-07-30 14:36:37.680955+00
0e5d1a3e-f32e-40c9-9ddf-5457ae815878	en	trust_signals	accuracy_label	Calculation Accuracy	2025-07-30 14:36:37.931336+00	2025-07-30 14:36:37.931336+00
5e03f213-1b14-4588-ac69-97213a679c4f	pl	trust_signals	accuracy_label	Dokładność Obliczeń	2025-07-30 14:36:38.207326+00	2025-07-30 14:36:38.207326+00
68886b32-fa76-43ce-8c06-1972423471be	es	trust_signals	accuracy_label	Precisión de Cálculo	2025-07-30 14:36:38.457218+00	2025-07-30 14:36:38.457218+00
0b94e3f2-7e79-40f2-b889-b020e372f43d	en	seo	meta_title	Investment Calculator - Future Value & Compound Interest Calculator | Free Tool	2025-07-30 14:36:38.716105+00	2025-07-30 14:36:38.716105+00
ff06fa7d-d8a1-4090-a381-94a543d5afff	pl	seo	meta_title	Kalkulator Inwestycji - Kalkulator Wartości Przyszłej i Składanych Odsetek | Darmowe Narzędzie	2025-07-30 14:36:38.971758+00	2025-07-30 14:36:38.971758+00
25cf1162-dea1-4ffe-a232-8582b8712344	es	seo	meta_title	Calculadora de Inversión - Calculadora de Valor Futuro e Interés Compuesto | Herramienta Gratuita	2025-07-30 14:36:39.217184+00	2025-07-30 14:36:39.217184+00
1a34c206-bd83-4c11-ad48-050922c0f5d2	en	seo	meta_description	Free investment calculator for future value projections. Calculate compound interest, retirement savings, and investment growth with our advanced financial planning tool. Start planning your financial future today!	2025-07-30 14:36:39.462992+00	2025-07-30 14:36:39.462992+00
4701f240-5530-4462-82f5-0a6350107a38	pl	seo	meta_description	Darmowy kalkulator inwestycji do prognozowania wartości przyszłej. Oblicz składane odsetki, oszczędności emerytalne i wzrost inwestycji za pomocą naszego zaawansowanego narzędzia planowania finansowego. Zacznij planować swoją finansową przyszłość już dziś!	2025-07-30 14:36:39.707379+00	2025-07-30 14:36:39.707379+00
78bcf298-392a-475a-a453-f03fabb8547e	es	seo	meta_description	Calculadora de inversión gratuita para proyecciones de valor futuro. Calcula interés compuesto, ahorros de jubilación y crecimiento de inversión con nuestra herramienta avanzada de planificación financiera. ¡Comienza a planificar tu futuro financiero hoy!	2025-07-30 14:36:39.96156+00	2025-07-30 14:36:39.96156+00
ee7e0435-659d-46d4-bb41-7899dc89691c	en	seo	keywords	investment calculator, compound interest calculator, future value calculator, retirement planning, financial calculator, investment growth, savings calculator, wealth building, financial planning tool, investment projections	2025-07-30 14:36:40.211268+00	2025-07-30 14:36:40.211268+00
709c531c-5c4e-49aa-a682-6667fe8abbd0	pl	seo	keywords	kalkulator inwestycji, kalkulator składanych odsetek, kalkulator wartości przyszłej, planowanie emerytury, kalkulator finansowy, wzrost inwestycji, kalkulator oszczędności, budowanie bogactwa, narzędzie planowania finansowego, prognozy inwestycyjne	2025-07-30 14:36:40.457389+00	2025-07-30 14:36:40.457389+00
d4348756-5052-4467-b415-7180c690e3ce	es	seo	keywords	calculadora de inversión, calculadora de interés compuesto, calculadora de valor futuro, planificación de jubilación, calculadora financiera, crecimiento de inversión, calculadora de ahorros, construcción de riqueza, herramienta de planificación financiera, proyecciones de inversión	2025-07-30 14:36:40.713474+00	2025-07-30 14:36:40.713474+00
d009d75f-7162-43a6-a8a8-22704341587f	en	how_it_works	title	How Our Investment Calculator Works	2025-07-30 14:55:02.795858+00	2025-07-30 14:55:02.795858+00
ed9a8af4-36c1-49fa-bc3c-72da35ac5a59	en	how_it_works	subtitle	Simple steps to calculate your investment growth and build wealth	2025-07-30 14:55:02.975929+00	2025-07-30 14:55:02.975929+00
9fa225cb-2920-4d29-a779-65fbf5e9a9c2	en	how_it_works	step_1_title	Enter Your Investment Details	2025-07-30 14:55:03.10197+00	2025-07-30 14:55:03.10197+00
14f784da-f471-4777-bbdc-c797e6d85411	en	how_it_works	step_1_description	Input your initial investment amount, monthly contributions, expected annual return, and investment timeline to get started.	2025-07-30 14:55:03.22717+00	2025-07-30 14:55:03.22717+00
af21d3dc-4374-454d-a843-18f30efde371	en	how_it_works	step_2_title	Calculate Compound Interest	2025-07-30 14:55:03.410184+00	2025-07-30 14:55:03.410184+00
04f6e6b8-7e2a-4b69-a17f-f1ec6d312eb4	en	how_it_works	step_2_description	Our advanced algorithm calculates your future value using compound interest formulas, showing you the power of long-term investing.	2025-07-30 14:55:03.534785+00	2025-07-30 14:55:03.534785+00
fb168011-3bc3-45f6-88ed-ee9cd99eb5bd	en	how_it_works	step_3_title	Visualize Your Growth	2025-07-30 14:55:03.727837+00	2025-07-30 14:55:03.727837+00
bfad2ad1-2d01-46e8-9d1e-7a95fb04181d	en	how_it_works	step_3_description	View interactive charts and detailed breakdowns of your investment growth, including principal vs. interest earned over time.	2025-07-30 14:55:03.930146+00	2025-07-30 14:55:03.930146+00
b76e9436-52fb-4413-a1cb-6e470998feab	en	strategies	title	Investment Strategies & Financial Planning	2025-07-30 14:55:04.051801+00	2025-07-30 14:55:04.051801+00
74111977-9729-48bc-a039-e56b9d00de61	en	strategies	subtitle	Learn proven investment strategies to maximize your wealth building potential	2025-07-30 14:55:04.25392+00	2025-07-30 14:55:04.25392+00
c1dec8d4-aa81-4e75-b546-574ccbefffe4	en	strategies	strategy_1_title	Dollar-Cost Averaging	2025-07-30 14:55:04.453749+00	2025-07-30 14:55:04.453749+00
73fd842d-fb5c-4fc0-a9f2-99f653800614	en	strategies	strategy_1_description	Invest a fixed amount regularly regardless of market conditions. This strategy reduces the impact of market volatility and builds disciplined investing habits.	2025-07-30 14:55:04.576961+00	2025-07-30 14:55:04.576961+00
88f324a0-37e2-4bee-b75f-a8f6be955b6c	en	strategies	strategy_2_title	Long-Term Compound Growth	2025-07-30 14:55:04.777952+00	2025-07-30 14:55:04.777952+00
893b4a5e-8ede-4107-8727-def5fe8e1908	en	strategies	strategy_2_description	Harness the power of compound interest by staying invested for longer periods. Time is your greatest asset in wealth building.	2025-07-30 14:55:04.976678+00	2025-07-30 14:55:04.976678+00
8b98b9ec-18b7-477d-8dd8-bac2422c5d22	en	strategies	strategy_3_title	Diversified Portfolio Planning	2025-07-30 14:55:05.099819+00	2025-07-30 14:55:05.099819+00
7b34a8ec-dfc5-4d8a-a725-263e7f081d66	en	strategies	strategy_3_description	Spread risk across different asset classes and investment vehicles to optimize returns while managing risk effectively.	2025-07-30 14:55:05.300624+00	2025-07-30 14:55:05.300624+00
497c5118-1499-4876-add5-e740b437b81d	en	faq	title	Frequently Asked Questions	2025-07-30 14:55:05.501835+00	2025-07-30 14:55:05.501835+00
c925de6e-d75b-4463-905a-f965eeeabfc1	en	faq	subtitle	Get answers to common questions about investment calculators and financial planning	2025-07-30 14:55:05.629746+00	2025-07-30 14:55:05.629746+00
a0810673-16d2-4785-89fd-9a212b6c05bc	en	faq	q1_question	How accurate is the investment calculator?	2025-07-30 14:55:05.828009+00	2025-07-30 14:55:05.828009+00
12363307-a97b-4708-9eac-34370ff195bd	en	faq	q1_answer	Our calculator uses proven compound interest formulas and is 99.9% accurate for projections. However, actual investment returns may vary due to market volatility and other factors.	2025-07-30 14:55:06.020895+00	2025-07-30 14:55:06.020895+00
64ff182a-72d2-4935-948c-a61b33c93560	en	faq	q2_question	What is compound interest and why is it important?	2025-07-30 14:55:06.181195+00	2025-07-30 14:55:06.181195+00
d59cdb86-743a-4f7b-8663-75e80041aa0d	en	faq	q2_answer	Compound interest is earning interest on both your principal and previously earned interest. It accelerates wealth building over time, making it crucial for long-term financial success.	2025-07-30 14:55:06.348645+00	2025-07-30 14:55:06.348645+00
51f51bba-afde-45e4-808e-7c9de2da66e2	en	faq	q3_question	Can I use this for retirement planning?	2025-07-30 14:55:06.544324+00	2025-07-30 14:55:06.544324+00
e003d69c-c1d2-409e-bf04-e169b0e938c1	en	faq	q3_answer	Absolutely! Our calculator is perfect for retirement planning, helping you determine how much to save monthly to reach your retirement goals.	2025-07-30 14:55:06.668615+00	2025-07-30 14:55:06.668615+00
47ed358b-2188-4ed3-a95b-697d372ad87e	en	features	title	Advanced Calculator Features	2025-06-23 11:09:43.383373+00	2025-07-30 14:55:06.877696+00
9ad1053c-b51f-4429-8c63-9997da142b46	en	features	subtitle	Powerful tools to optimize your investment planning and decision making	2025-06-23 11:09:43.383373+00	2025-07-30 14:55:07.072788+00
a3de0f95-5b76-4b49-9493-bd501cf017fa	en	features	feature_1_title	Interactive Growth Charts	2025-07-30 14:55:07.199926+00	2025-07-30 14:55:07.199926+00
2b3464b9-faa4-4852-914a-8e8f428e96ed	en	features	feature_1_description	Visualize your investment growth with beautiful, interactive charts that show principal vs. interest over time.	2025-07-30 14:55:07.404623+00	2025-07-30 14:55:07.404623+00
66893d1c-2aff-4adc-be38-a5eabdbed428	en	features	feature_2_title	Scenario Comparison	2025-07-30 14:55:07.694213+00	2025-07-30 14:55:07.694213+00
377e08f8-2248-4647-8337-0b4caa7de987	en	features	feature_2_description	Compare multiple investment scenarios side-by-side to find the optimal strategy for your financial goals.	2025-07-30 14:55:07.986471+00	2025-07-30 14:55:07.986471+00
3f881ad4-8e2e-445b-83c4-a3a27d17d7eb	en	features	feature_3_title	Export & Share Results	2025-07-30 14:55:08.119879+00	2025-07-30 14:55:08.119879+00
df0943d8-8e41-4d6a-ac18-74a86eaf9abe	en	features	feature_3_description	Export your calculations as PDF or share custom URLs with financial advisors and family members.	2025-07-30 14:55:08.248166+00	2025-07-30 14:55:08.248166+00
9cecd036-3311-4932-b155-bd153fb3dd78	en	features	feature_4_title	Mobile-Optimized	2025-07-30 14:55:08.44781+00	2025-07-30 14:55:08.44781+00
8badf2ce-8272-4b22-9a71-a977f6ca1210	en	features	feature_4_description	Calculate investments anywhere with our fully responsive design that works perfectly on all devices.	2025-07-30 14:55:08.576578+00	2025-07-30 14:55:08.576578+00
dfbff2dc-9ca2-4bd5-aada-83c1b0359052	es	how_it_works	title	Cómo Funciona Nuestra Calculadora de Inversión	2025-07-30 14:55:08.704688+00	2025-07-30 14:55:08.704688+00
db0e85a1-75a8-457d-85a9-d0e2751067a3	es	how_it_works	subtitle	Pasos simples para calcular el crecimiento de tu inversión y construir riqueza	2025-07-30 14:55:08.83373+00	2025-07-30 14:55:08.83373+00
53ba6d6e-6b16-496f-8246-d977921267cf	es	how_it_works	step_1_title	Ingresa los Detalles de tu Inversión	2025-07-30 14:55:08.976004+00	2025-07-30 14:55:08.976004+00
ef7b0997-609e-4a57-81fe-2e3747fb79a4	es	how_it_works	step_1_description	Introduce tu monto inicial de inversión, contribuciones mensuales, rendimiento anual esperado y horizonte temporal para comenzar.	2025-07-30 14:55:09.106424+00	2025-07-30 14:55:09.106424+00
ba0e496c-21c8-44b0-a673-ca9dc76ee19a	es	strategies	title	Estrategias de Inversión y Planificación Financiera	2025-07-30 14:55:09.232862+00	2025-07-30 14:55:09.232862+00
83a057a3-e69a-491a-9c02-566141e854a5	es	faq	title	Preguntas Frecuentes	2025-07-30 14:55:09.35683+00	2025-07-30 14:55:09.35683+00
5fe679c2-3cd3-41f5-9601-3f443212b4b5	pl	how_it_works	title	Jak Działa Nasz Kalkulator Inwestycji	2025-07-30 14:55:09.619886+00	2025-07-30 14:55:09.619886+00
96c848ac-88b0-44cb-91d7-2f7fa6c168c4	pl	how_it_works	subtitle	Proste kroki do obliczenia wzrostu inwestycji i budowania bogactwa	2025-07-30 14:55:09.741882+00	2025-07-30 14:55:09.741882+00
60f11b55-51c7-4a11-9101-5186d9ebc467	pl	how_it_works	step_1_title	Wprowadź Szczegóły Swojej Inwestycji	2025-07-30 14:55:09.876095+00	2025-07-30 14:55:09.876095+00
651d199c-10c5-4efb-a488-29da97987950	pl	how_it_works	step_1_description	Podaj początkową kwotę inwestycji, miesięczne wpłaty, oczekiwany roczny zwrot i horyzont czasowy, aby rozpocząć.	2025-07-30 14:55:10.02699+00	2025-07-30 14:55:10.02699+00
4503d6c1-709e-423c-aa37-8036f1dd0488	pl	strategies	title	Strategie Inwestycyjne i Planowanie Finansowe	2025-07-30 14:55:10.183564+00	2025-07-30 14:55:10.183564+00
c94322ba-b02e-4daf-acda-56ae7b998eb8	pl	faq	title	Często Zadawane Pytania	2025-07-30 14:55:10.345858+00	2025-07-30 14:55:10.345858+00
c6daf9dc-5f09-4ce7-9756-30a65fcd18fc	en	scenarios	expert_title	Expert-Curated Investment Plans	2025-07-31 13:32:23.642507+00	2025-07-31 13:32:23.642507+00
3ad094b5-046d-4336-93b6-5225409aa00a	en	scenarios	expert_subtitle	Professionally designed investment scenarios based on real-world market analysis and proven strategies.	2025-07-31 13:32:23.642507+00	2025-07-31 13:32:23.642507+00
f5f59c04-f68d-4576-9f20-eb45c3e3b5ae	en	scenarios	view_all_scenarios	View All Scenarios	2025-07-31 13:32:23.642507+00	2025-07-31 13:32:23.642507+00
cde50f98-2ce3-4158-b561-9642c15954f8	en	scenarios	popular_title	Popular Investment Scenarios	2025-07-31 13:32:23.642507+00	2025-07-31 13:32:23.642507+00
935df82d-8def-49bf-9f3f-60b60e2e41b5	en	scenarios	latest_title	Latest Investment Scenarios	2025-07-31 13:32:23.642507+00	2025-07-31 13:32:23.642507+00
048d3d81-974d-4857-a711-d1847714f308	en	scenarios	user_created	User Created	2025-07-31 13:32:23.642507+00	2025-07-31 13:32:23.642507+00
35f596a2-11aa-49c5-8867-5cdca61e4491	en	scenarios	views	views	2025-07-31 13:32:23.642507+00	2025-07-31 13:32:23.642507+00
1b4d6083-f2b5-420c-903d-4b0042db1199	en	scenarios	explore_all	Explore all scenarios	2025-07-31 13:32:23.642507+00	2025-07-31 13:32:23.642507+00
e731212b-a60e-41a3-b10f-66d12e651a25	es	scenarios	expert_title	Planes de Inversión Curados por Expertos	2025-07-31 13:32:23.791992+00	2025-07-31 13:32:23.791992+00
c5d45729-f487-4abb-9975-56a519273c76	es	scenarios	expert_subtitle	Escenarios de inversión diseñados profesionalmente basados en análisis de mercado del mundo real y estrategias probadas.	2025-07-31 13:32:23.791992+00	2025-07-31 13:32:23.791992+00
de5f23ad-11f5-41a8-a371-de0456553398	es	scenarios	view_all_scenarios	Ver Todos los Escenarios	2025-07-31 13:32:23.791992+00	2025-07-31 13:32:23.791992+00
38790d2f-59fc-4a9d-ae16-3ca318e7a045	es	scenarios	popular_title	Escenarios de Inversión Populares	2025-07-31 13:32:23.791992+00	2025-07-31 13:32:23.791992+00
00b12610-172c-491f-b910-338a85680710	es	scenarios	latest_title	Últimos Escenarios de Inversión	2025-07-31 13:32:23.791992+00	2025-07-31 13:32:23.791992+00
ef7d3ba0-0fd6-4046-bef0-fdac16e2f94d	es	scenarios	user_created	Creado por Usuario	2025-07-31 13:32:23.791992+00	2025-07-31 13:32:23.791992+00
543f5f1f-8110-4747-a83a-bb88bde1b8b9	es	scenarios	views	visualizaciones	2025-07-31 13:32:23.791992+00	2025-07-31 13:32:23.791992+00
2f8dd6db-9439-4b2f-a712-ef9a18e09ef3	es	scenarios	explore_all	Explorar todos los escenarios	2025-07-31 13:32:23.791992+00	2025-07-31 13:32:23.791992+00
fed657ac-75cc-4f4e-aaaf-2608cbd50bd6	pl	scenarios	expert_title	Plany Inwestycyjne Opracowane przez Ekspertów	2025-07-31 13:32:23.914965+00	2025-07-31 13:32:23.914965+00
79e54cf7-6c71-4476-9615-7543bce4c830	pl	scenarios	expert_subtitle	Profesjonalnie zaprojektowane scenariusze inwestycyjne oparte na rzeczywistej analizie rynku i sprawdzonych strategiach.	2025-07-31 13:32:23.914965+00	2025-07-31 13:32:23.914965+00
2cf73242-c24e-47fd-8b88-d5b1cf3e64f6	pl	scenarios	view_all_scenarios	Zobacz Wszystkie Scenariusze	2025-07-31 13:32:23.914965+00	2025-07-31 13:32:23.914965+00
32f21efd-a953-4eb3-a6c2-fc4c2285eeb8	pl	scenarios	popular_title	Popularne Scenariusze Inwestycyjne	2025-07-31 13:32:23.914965+00	2025-07-31 13:32:23.914965+00
fb5f2f03-18c2-4161-8c2d-388a36424acd	pl	scenarios	latest_title	Najnowsze Scenariusze Inwestycyjne	2025-07-31 13:32:23.914965+00	2025-07-31 13:32:23.914965+00
9f347fa9-73de-46b8-8c47-d571b12b8233	pl	scenarios	user_created	Utworzone przez Użytkownika	2025-07-31 13:32:23.914965+00	2025-07-31 13:32:23.914965+00
aba66b65-2d3e-4b01-b04d-d9f3c667398e	pl	scenarios	views	wyświetlenia	2025-07-31 13:32:23.914965+00	2025-07-31 13:32:23.914965+00
27333a2c-6565-483e-8fb3-ef5ed5397e75	pl	scenarios	explore_all	Przeglądaj wszystkie scenariusze	2025-07-31 13:32:23.914965+00	2025-07-31 13:32:23.914965+00
ac039ec6-d5b0-4d09-bb73-0a45fcde606c	en	education	section_title	Understanding Investment Growth	2025-07-31 13:35:05.730128+00	2025-07-31 13:35:05.730128+00
82ba5646-bd6e-47cf-a5cf-5aaf2940bdcc	en	education	section_subtitle	Learn how compound interest and smart investing can transform your financial future	2025-07-31 13:35:05.730128+00	2025-07-31 13:35:05.730128+00
9d83894d-47ab-4aa2-8434-88c8309c150c	en	education	cta_title	Ready to Calculate Your Investment Growth?	2025-07-31 13:35:05.730128+00	2025-07-31 13:35:05.730128+00
ef3c8bef-e42d-4dd7-b3df-021d7beca038	en	education	cta_subtitle	Use our advanced investment calculator to see how compound interest can work for your specific financial situation. Input your numbers and watch your wealth grow over time.	2025-07-31 13:35:05.730128+00	2025-07-31 13:35:05.730128+00
f5fd6609-0086-4a01-beea-da04f220c14c	en	education	cta_button	Start Calculating Now	2025-07-31 13:35:05.730128+00	2025-07-31 13:35:05.730128+00
58c2ba6d-5386-41ea-844a-8a6689925334	es	education	section_title	Comprendiendo el Crecimiento de la Inversión	2025-07-31 13:35:06.098674+00	2025-07-31 13:35:06.098674+00
c954a2dc-cd03-440a-b43c-8940c96eb3b0	es	education	section_subtitle	Aprende cómo el interés compuesto y la inversión inteligente pueden transformar tu futuro financiero	2025-07-31 13:35:06.098674+00	2025-07-31 13:35:06.098674+00
acf2e5e8-4cc9-43ce-bcba-bc1b150c6e3c	es	education	cta_title	¿Listo para Calcular el Crecimiento de tu Inversión?	2025-07-31 13:35:06.098674+00	2025-07-31 13:35:06.098674+00
69069eb7-cd30-43f8-bbaa-48ec33363036	es	education	cta_subtitle	Usa nuestra calculadora avanzada de inversión para ver cómo el interés compuesto puede funcionar para tu situación financiera específica. Ingresa tus números y observa cómo crece tu riqueza con el tiempo.	2025-07-31 13:35:06.098674+00	2025-07-31 13:35:06.098674+00
c51e940a-12b0-45f3-9d69-aeda6d1a17da	es	education	cta_button	Comenzar a Calcular Ahora	2025-07-31 13:35:06.098674+00	2025-07-31 13:35:06.098674+00
8dcf10e5-9f57-4214-a532-a95fccf7820c	pl	education	section_title	Zrozumienie Wzrostu Inwestycji	2025-07-31 13:35:06.220532+00	2025-07-31 13:35:06.220532+00
d8a46812-01f4-4a3a-8061-3a9cb1e81852	pl	education	section_subtitle	Dowiedz się, jak składane odsetki i inteligentne inwestowanie mogą przekształcić twoją finansową przyszłość	2025-07-31 13:35:06.220532+00	2025-07-31 13:35:06.220532+00
0bb6062f-ae45-4bf1-a7dd-4cf8ea4e6d01	pl	education	cta_title	Gotowy na Obliczenie Wzrostu Swoich Inwestycji?	2025-07-31 13:35:06.220532+00	2025-07-31 13:35:06.220532+00
5ffa71d0-6912-4ac8-a87e-0dfb0db4574d	pl	education	cta_subtitle	Użyj naszego zaawansowanego kalkulatora inwestycji, aby zobaczyć, jak składane odsetki mogą działać w twojej konkretnej sytuacji finansowej. Wprowadź swoje liczby i obserwuj, jak twoje bogactwo rośnie z czasem.	2025-07-31 13:35:06.220532+00	2025-07-31 13:35:06.220532+00
41174da1-f3e3-4e85-8e5c-0cbcc3901e6b	pl	education	cta_button	Zacznij Obliczać Teraz	2025-07-31 13:35:06.220532+00	2025-07-31 13:35:06.220532+00
22f1e415-7dd2-4ff8-a8e0-04116050380e	en	comparison	section_title	Investment Strategy Comparison	2025-07-31 13:35:06.34347+00	2025-07-31 13:35:06.34347+00
cc86051f-f262-4078-a25d-85c2c235850a	en	comparison	section_subtitle	See how different investment approaches can dramatically impact your long-term wealth	2025-07-31 13:35:06.34347+00	2025-07-31 13:35:06.34347+00
3827b9ad-2d7b-42d6-a2fe-696e72b4ff22	en	comparison	risk_reward_title	📊 Risk vs. Reward	2025-07-31 13:35:06.34347+00	2025-07-31 13:35:06.34347+00
808f947a-2c84-4ad7-a511-e637f8c7861f	en	comparison	risk_reward_text	Higher potential returns come with increased volatility. Your risk tolerance should match your investment timeline and financial goals.	2025-07-31 13:35:06.34347+00	2025-07-31 13:35:06.34347+00
6876833c-8640-4ce4-abc3-6b56cf6db495	en	comparison	time_horizon_title	Time Horizon Matters	2025-07-31 13:35:06.34347+00	2025-07-31 13:35:06.34347+00
13dce239-0b07-489f-aaf9-f4dd0cb417f4	en	comparison	time_horizon_text	Longer investment periods allow for more aggressive strategies, as you have time to recover from market downturns.	2025-07-31 13:35:06.34347+00	2025-07-31 13:35:06.34347+00
56cbbb4d-e584-4108-a1f3-bc2d6cf2aad1	en	comparison	diversification_title	🎯 Diversification Benefits	2025-07-31 13:35:06.34347+00	2025-07-31 13:35:06.34347+00
d3406b6c-bf03-4133-b29d-e19e4c456091	en	comparison	diversification_text	A balanced portfolio can help optimize the risk-return ratio, potentially offering better risk-adjusted returns.	2025-07-31 13:35:06.34347+00	2025-07-31 13:35:06.34347+00
d660fbe1-4339-4d58-a182-611bd2b061ec	es	comparison	section_title	Comparación de Estrategias de Inversión	2025-07-31 13:35:06.466971+00	2025-07-31 13:35:06.466971+00
a91e5494-3dbb-4fdd-842b-55ab3ef26c1c	es	comparison	section_subtitle	Ve cómo diferentes enfoques de inversión pueden impactar dramáticamente tu riqueza a largo plazo	2025-07-31 13:35:06.466971+00	2025-07-31 13:35:06.466971+00
e9f16ec8-6c1b-41d0-8d56-f6842837d3e0	es	comparison	risk_reward_title	📊 Riesgo vs. Recompensa	2025-07-31 13:35:06.466971+00	2025-07-31 13:35:06.466971+00
e18f7a19-768f-40d5-911d-71e688040509	es	comparison	risk_reward_text	Mayores rendimientos potenciales vienen con mayor volatilidad. Tu tolerancia al riesgo debe coincidir con tu horizonte de inversión y objetivos financieros.	2025-07-31 13:35:06.466971+00	2025-07-31 13:35:06.466971+00
ea8c8c36-87aa-4a5a-951d-c00e4a2c7161	es	comparison	time_horizon_title	El Horizonte Temporal Importa	2025-07-31 13:35:06.466971+00	2025-07-31 13:35:06.466971+00
6c85625a-d4d6-4c7b-b4b9-30ffca7ac35d	es	comparison	time_horizon_text	Períodos de inversión más largos permiten estrategias más agresivas, ya que tienes tiempo para recuperarte de las caídas del mercado.	2025-07-31 13:35:06.466971+00	2025-07-31 13:35:06.466971+00
562d85af-ad93-4ad0-a6f4-2c8bfde9be95	es	comparison	diversification_title	🎯 Beneficios de la Diversificación	2025-07-31 13:35:06.466971+00	2025-07-31 13:35:06.466971+00
6648bb05-90be-4add-8784-8a8e3c8c2282	es	comparison	diversification_text	Una cartera equilibrada puede ayudar a optimizar la relación riesgo-rendimiento, potencialmente ofreciendo mejores rendimientos ajustados al riesgo.	2025-07-31 13:35:06.466971+00	2025-07-31 13:35:06.466971+00
10393fe0-05da-49aa-8842-ab5d59cb73d9	pl	comparison	section_title	Porównanie Strategii Inwestycyjnych	2025-07-31 13:35:06.589531+00	2025-07-31 13:35:06.589531+00
340d4b34-50b8-4f13-8a84-865d0f159b77	pl	comparison	section_subtitle	Zobacz, jak różne podejścia inwestycyjne mogą dramatycznie wpłynąć na twoje długoterminowe bogactwo	2025-07-31 13:35:06.589531+00	2025-07-31 13:35:06.589531+00
86bdb0d8-06f4-486d-9df4-4760f20ac22d	pl	comparison	risk_reward_title	📊 Ryzyko vs. Nagroda	2025-07-31 13:35:06.589531+00	2025-07-31 13:35:06.589531+00
4f3c2e83-5734-4ddb-815e-d5772c7ff3e4	pl	comparison	risk_reward_text	Wyższe potencjalne zwroty wiążą się ze zwiększoną zmiennością. Twoja tolerancja ryzyka powinna odpowiadać twojemu horyzontowi inwestycyjnemu i celom finansowym.	2025-07-31 13:35:06.589531+00	2025-07-31 13:35:06.589531+00
a724e021-5e1a-4ad0-912f-1c9026ba2626	pl	comparison	time_horizon_title	Horyzont Czasowy Ma Znaczenie	2025-07-31 13:35:06.589531+00	2025-07-31 13:35:06.589531+00
ac28c6f9-6ee9-454f-b795-562e55fee3f0	pl	comparison	time_horizon_text	Dłuższe okresy inwestycyjne pozwalają na bardziej agresywne strategie, ponieważ masz czas na odzyskanie po spadkach rynkowych.	2025-07-31 13:35:06.589531+00	2025-07-31 13:35:06.589531+00
ab47f769-d690-41eb-aa25-8fa597b7ed36	pl	comparison	diversification_title	🎯 Korzyści z Dywersyfikacji	2025-07-31 13:35:06.589531+00	2025-07-31 13:35:06.589531+00
3d14f581-b9d0-4088-b7b5-64382ccffa61	pl	comparison	diversification_text	Zbilansowany portfel może pomóc zoptymalizować stosunek ryzyka do zwrotu, potencjalnie oferując lepsze zwroty skorygowane o ryzyko.	2025-07-31 13:35:06.589531+00	2025-07-31 13:35:06.589531+00
abbf0e1e-dbea-4ec8-8e82-42f61b1ce683	en	scenarios	latest_section_title	Latest Investment Scenarios	2025-07-31 13:42:20.533059+00	2025-07-31 13:42:20.533059+00
b16cb3e1-6423-46b7-8445-6fea90adcef5	es	scenarios	latest_section_title	Últimos Escenarios de Inversión	2025-07-31 13:42:20.533059+00	2025-07-31 13:42:20.533059+00
bbdfac45-420a-44ed-ba5a-a6fe74cfc62d	pl	scenarios	latest_section_title	Najnowsze Scenariusze Inwestycyjne	2025-07-31 13:42:20.533059+00	2025-07-31 13:42:20.533059+00
0a040e88-3220-4506-ae8f-544a46deedc1	en	education	compound_interest_title	The Power of Compound Interest: Your Money's Best Friend	2025-07-31 13:42:20.930263+00	2025-07-31 13:42:20.930263+00
115802f4-89b6-40c4-af20-ff7b8424da92	en	education	example_title	Real Example: $50K Starting Investment	2025-07-31 13:42:20.930263+00	2025-07-31 13:42:20.930263+00
1b3a6daa-0706-474e-910a-e2ecc88c2043	en	education	tip_1_title	Start Early	2025-07-31 13:42:20.930263+00	2025-07-31 13:42:20.930263+00
81f30251-c49d-4cd8-9749-09e8ebc669b7	en	education	tip_1_text	Time is your greatest asset in investing. Starting even a few years earlier can mean hundreds of thousands more in your final portfolio due to compound growth.	2025-07-31 13:42:20.930263+00	2025-07-31 13:42:20.930263+00
e52eeb60-80b2-4f76-858b-bad944dd5cb8	en	education	tip_2_title	Be Consistent	2025-07-31 13:42:20.930263+00	2025-07-31 13:42:20.930263+00
78dba491-3b31-4f74-b532-5fa884d13380	en	education	tip_2_text	Regular monthly contributions, even small ones, can lead to significant wealth accumulation. Consistency beats trying to time the market.	2025-07-31 13:42:20.930263+00	2025-07-31 13:42:20.930263+00
aa3ecb6a-3cf6-45e8-8ad2-0f6b47849abd	en	education	tip_3_title	Think Long-Term	2025-07-31 13:42:20.930263+00	2025-07-31 13:42:20.930263+00
c09ce0f7-0ac9-434e-a7d7-0c1829881193	en	education	tip_3_text	The magic of compound interest truly shines over long periods. Stay invested through market ups and downs for maximum growth potential.	2025-07-31 13:42:20.930263+00	2025-07-31 13:42:20.930263+00
bebe32f6-c817-489c-a149-d6ebda98aa65	es	education	compound_interest_title	El Poder del Interés Compuesto: El Mejor Amigo de Tu Dinero	2025-07-31 13:42:21.057573+00	2025-07-31 13:42:21.057573+00
6c93de8f-443e-462f-8683-16a9f4c90c6b	es	education	example_title	Ejemplo Real: Inversión Inicial de $50K	2025-07-31 13:42:21.057573+00	2025-07-31 13:42:21.057573+00
3af317b0-fdb6-4f47-a2ca-2cbc1868dd00	es	education	tip_1_title	Comenzar Temprano	2025-07-31 13:42:21.057573+00	2025-07-31 13:42:21.057573+00
d3b40929-8b05-41b5-96ee-f0a64bb3c0b7	es	education	tip_1_text	El tiempo es tu mayor activo en las inversiones. Comenzar incluso unos años antes puede significar cientos de miles más en tu cartera final debido al crecimiento compuesto.	2025-07-31 13:42:21.057573+00	2025-07-31 13:42:21.057573+00
7b85963f-3681-4cc9-919c-8230fa0965b2	es	education	tip_2_title	Ser Constante	2025-07-31 13:42:21.057573+00	2025-07-31 13:42:21.057573+00
8c6d81d8-dc03-47ff-9fb5-d85829b8b18d	es	education	tip_2_text	Las contribuciones mensuales regulares, incluso pequeñas, pueden llevar a una acumulación significativa de riqueza. La constancia supera intentar cronometrar el mercado.	2025-07-31 13:42:21.057573+00	2025-07-31 13:42:21.057573+00
29399c83-a630-41d9-bd01-69501908f50f	es	education	tip_3_title	Pensar a Largo Plazo	2025-07-31 13:42:21.057573+00	2025-07-31 13:42:21.057573+00
9252fef2-c797-4f7d-b808-7ae1a4d43fce	es	education	tip_3_text	La magia del interés compuesto realmente brilla en períodos largos. Mantente invertido a través de altos y bajos del mercado para máximo potencial de crecimiento.	2025-07-31 13:42:21.057573+00	2025-07-31 13:42:21.057573+00
1ae0cab4-fca2-4039-a4d9-e4af363b0b10	pl	education	compound_interest_title	Siła Odsetek Składanych: Najlepszy Przyjaciel Twoich Pieniędzy	2025-07-31 13:42:21.183059+00	2025-07-31 13:42:21.183059+00
6e78d3ac-58f4-4194-965d-8fac784f1ccd	pl	education	example_title	Prawdziwy Przykład: Początkowa Inwestycja $50K	2025-07-31 13:42:21.183059+00	2025-07-31 13:42:21.183059+00
833328c0-84e8-45c2-8dc3-1ca418346dba	pl	education	tip_1_title	Zacznij Wcześnie	2025-07-31 13:42:21.183059+00	2025-07-31 13:42:21.183059+00
310a643e-5c33-4771-9a9f-8d2ed4acd5bd	pl	education	tip_1_text	Czas to twój największy atut w inwestowaniu. Rozpoczęcie nawet kilka lat wcześniej może oznaczać setki tysięcy więcej w twoim końcowym portfelu dzięki wzrostowi składanemu.	2025-07-31 13:42:21.183059+00	2025-07-31 13:42:21.183059+00
66c733b5-1c3f-4d91-b530-05a301b0cf43	pl	education	tip_2_title	Bądź Konsekwentny	2025-07-31 13:42:21.183059+00	2025-07-31 13:42:21.183059+00
a40f7f88-0b04-45eb-ba64-a7eff8a588ba	pl	education	tip_2_text	Regularne miesięczne składki, nawet małe, mogą prowadzić do znaczącej akumulacji bogactwa. Konsekwencja przewyższa próby wyczucia rynku.	2025-07-31 13:42:21.183059+00	2025-07-31 13:42:21.183059+00
a099b036-a898-4da7-89aa-dacda9d4e3d9	pl	education	tip_3_title	Myśl Długoterminowo	2025-07-31 13:42:21.183059+00	2025-07-31 13:42:21.183059+00
9f6bc7fc-00a6-4f8d-acb0-972210af6175	pl	education	tip_3_text	Magia odsetek składanych naprawdę błyszczy w długich okresach. Pozostań zainwestowany przez wzloty i upadki rynku dla maksymalnego potencjału wzrostu.	2025-07-31 13:42:21.183059+00	2025-07-31 13:42:21.183059+00
4c702f72-e713-49a4-9b5f-3d91bcd459f2	en	comparison	conservative_title	Conservative	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
e77bfcc3-39ed-4d73-8e70-1de4b0df6979	en	comparison	conservative_return	4-5% annually	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
09da4cee-3876-4b04-abb2-995c66bfeb86	en	comparison	conservative_risk	Low	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
523d597a-a184-46a7-849d-134293311330	en	comparison	conservative_result	$266K	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
2d3537cb-0aa2-4db1-9c80-9f5a3ee3ea19	en	comparison	balanced_title	Balanced	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
9aeafe34-0644-4dc1-a5ea-c9a2081248e9	en	comparison	balanced_return	6-7% annually	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
a54bef15-7f63-468a-b5d9-84744f792fbe	en	comparison	balanced_risk	Moderate	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
805759b2-9b33-4be0-9d50-ee6e7c6b5253	en	comparison	balanced_result	$429K	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
a844180b-1da6-45c6-bbf3-358a4df356f3	en	comparison	aggressive_title	Aggressive	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
905c0108-d6ee-498d-9193-b81fa26fc362	en	comparison	aggressive_return	8-10% annually	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
6ee1e3d4-c87e-4615-ae47-13c3cfffb91b	en	comparison	aggressive_risk	High	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
435397e4-0339-499a-9e7f-a373fd540afc	en	comparison	aggressive_result	$685K	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
0203100f-8834-4215-a608-1f560479f0a6	en	comparison	return_label	Return:	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
f9d65b9a-aeb9-4cfd-8163-877c52ced759	en	comparison	risk_label	Risk:	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
99ca3447-0314-4627-86d7-7fb4b7bd6999	en	comparison	result_label	$100K in 25 years:	2025-07-31 13:42:21.311407+00	2025-07-31 13:42:21.311407+00
a0e7e140-3259-476e-9122-c482b84f430f	es	comparison	conservative_title	Conservador	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
259a8b0f-591c-4f09-a9bc-1dadf480ce01	es	comparison	conservative_return	4-5% anual	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
14044d20-8292-48b8-8259-2c816e3851a0	es	comparison	conservative_risk	Bajo	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
348fb5ce-adf1-49d0-b3b8-f49142be6354	es	comparison	conservative_result	$266K	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
48d5c8ca-124c-4df4-a60f-10e371fc9d49	es	comparison	balanced_title	Equilibrado	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
b9159bc6-61a7-4df4-97dd-98371518e420	es	comparison	balanced_return	6-7% anual	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
e2163dc8-1900-4292-bf32-9a7aa6585a6e	es	comparison	balanced_risk	Moderado	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
30f00bca-eec0-4707-937d-44ef8e15241f	es	comparison	balanced_result	$429K	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
7d90349c-32c6-48dd-b70a-3577744f945f	es	comparison	aggressive_title	Agresivo	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
2a8ffd43-0461-4959-8ff0-4d6f04944189	es	comparison	aggressive_return	8-10% anual	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
1240dcae-be3d-4fae-8be5-7bd92ba9228e	es	comparison	aggressive_risk	Alto	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
af6f7a28-955f-4aa0-9176-610919628de2	es	comparison	aggressive_result	$685K	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
0fb8fe7f-cd0c-41e6-9c6b-061f835fc254	es	comparison	return_label	Rendimiento:	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
9f9c6b58-026a-411d-a346-d2d3216bbd8b	es	comparison	risk_label	Riesgo:	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
d35b6430-d3c7-4849-908d-ff899c06866c	es	comparison	result_label	$100K en 25 años:	2025-07-31 13:42:21.509036+00	2025-07-31 13:42:21.509036+00
ca2606be-8918-4bfc-94a7-6fcd9c36b2ad	pl	comparison	conservative_title	Konserwatywny	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
d96ee49f-d68a-4e65-bc0a-0e98885e4fad	pl	comparison	conservative_return	4-5% rocznie	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
170f120a-0165-48c7-bd7e-5b136baf88b2	pl	comparison	conservative_risk	Niskie	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
c95a0e8a-c54a-41a8-b716-ed376cd3ac17	pl	comparison	conservative_result	$266K	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
88772785-e137-4180-8e49-ea4bb8d4084e	pl	comparison	balanced_title	Zrównoważony	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
9ca86259-a019-453d-a882-58836bc83a13	pl	comparison	balanced_return	6-7% rocznie	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
229f472e-53d9-4490-921e-f6378acea52f	pl	comparison	balanced_risk	Umiarkowane	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
ae370882-0049-459f-932d-037fc16d9ba4	pl	comparison	balanced_result	$429K	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
e44d6f0e-24a0-4624-abbe-86e7fa60c62a	pl	comparison	aggressive_title	Agresywny	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
e34ace95-8cfc-4721-859d-16169c2121cf	pl	comparison	aggressive_return	8-10% rocznie	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
d9b4ac44-f071-4b6e-afbb-e96f6fa2687c	pl	comparison	aggressive_risk	Wysokie	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
ffd178fc-671c-483c-ac8e-17784b89dfa5	pl	comparison	aggressive_result	$685K	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
1d141d3c-2a6c-4ba1-b03e-039066145029	pl	comparison	return_label	Zwrot:	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
b2abcb4f-de0b-4219-859a-9f145f4a36c7	pl	comparison	risk_label	Ryzyko:	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
ae0f1896-e39e-476b-a202-1d65dbed719a	pl	comparison	result_label	$100K w 25 lat:	2025-07-31 13:42:21.645551+00	2025-07-31 13:42:21.645551+00
119783f9-0771-43ce-9a16-9ac5ecd6368b	en	education	compound_description_1	Compound interest is often called the "eighth wonder of the world" for good reason. Unlike simple interest, which only calculates returns on your initial investment, compound interest calculates returns on both your principal AND the interest you've already earned.	2025-07-31 13:55:12.958422+00	2025-07-31 13:55:12.958422+00
12bdf516-79b6-4693-ac24-6920b92719e3	en	education	compound_description_2	This creates a snowball effect where your money grows exponentially over time. The earlier you start investing and the longer you stay invested, the more dramatic this effect becomes. Even small, consistent contributions can grow into substantial wealth over decades.	2025-07-31 13:55:12.958422+00	2025-07-31 13:55:12.958422+00
b7d7c511-7b33-430d-bca1-e0b2ef1fcb4e	en	education	formula_title	Key Formula: A = P(1 + r/n)^(nt)	2025-07-31 13:55:12.958422+00	2025-07-31 13:55:12.958422+00
752da55d-db62-40d8-82a2-935b6bb5c5f1	en	education	formula_a	A = Final amount	2025-07-31 13:55:12.958422+00	2025-07-31 13:55:12.958422+00
1462f457-f5a3-4d56-addc-7a0fa5d346b6	en	education	formula_p	P = Principal (initial investment)	2025-07-31 13:55:12.958422+00	2025-07-31 13:55:12.958422+00
4057ecc8-5979-420a-bad7-4eeae37b84bc	en	education	formula_r	r = Annual interest rate	2025-07-31 13:55:12.958422+00	2025-07-31 13:55:12.958422+00
5d25f7af-e6b4-475f-a2b9-ccad941cd8f9	en	education	formula_n	n = Number of times interest compounds per year	2025-07-31 13:55:12.958422+00	2025-07-31 13:55:12.958422+00
eceb1b5d-b18e-459d-a454-80f6dbb078f2	en	education	formula_t	t = Time in years	2025-07-31 13:55:12.958422+00	2025-07-31 13:55:12.958422+00
6dbf66cc-4224-4826-89d2-1696e9ea888d	es	education	compound_description_1	El interés compuesto a menudo se llama la "octava maravilla del mundo" por una buena razón. A diferencia del interés simple, que solo calcula rendimientos sobre tu inversión inicial, el interés compuesto calcula rendimientos tanto sobre tu capital principal COMO sobre los intereses que ya has ganado.	2025-07-31 13:55:13.328229+00	2025-07-31 13:55:13.328229+00
b7930261-c523-456c-965d-e746bae81fa0	pl	calculator	good_starting_amount	Dobra kwota początkowa!	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
4622ca75-57bd-4148-94a0-6ec5f53062ba	en	calculator	excellent_regular_investing	Excellent! Regular investing builds wealth	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
55f90737-6cd9-485a-84af-740e7ea16b47	es	education	compound_description_2	Esto crea un efecto bola de nieve donde tu dinero crece exponencialmente con el tiempo. Cuanto antes comiences a invertir y más tiempo permanezcas invertido, más dramático se vuelve este efecto. Incluso pequeñas contribuciones consistentes pueden crecer hasta convertirse en riqueza sustancial durante décadas.	2025-07-31 13:55:13.328229+00	2025-07-31 13:55:13.328229+00
a288f5d2-acba-47e0-bbea-b8a6d82b8a8f	es	education	formula_title	Fórmula Clave: A = P(1 + r/n)^(nt)	2025-07-31 13:55:13.328229+00	2025-07-31 13:55:13.328229+00
95ce7ae3-473b-41ed-b661-562b036371bc	es	education	formula_a	A = Cantidad final	2025-07-31 13:55:13.328229+00	2025-07-31 13:55:13.328229+00
6f5a7534-cb73-4fed-b63a-b062a8b0fd6c	es	education	formula_p	P = Principal (inversión inicial)	2025-07-31 13:55:13.328229+00	2025-07-31 13:55:13.328229+00
5df0c5f7-de3e-4cbf-9238-ed68e7df6db9	es	education	formula_r	r = Tasa de interés anual	2025-07-31 13:55:13.328229+00	2025-07-31 13:55:13.328229+00
4c0ea6b2-46b5-4594-846d-00d108185c8c	es	education	formula_n	n = Número de veces que se capitaliza el interés por año	2025-07-31 13:55:13.328229+00	2025-07-31 13:55:13.328229+00
8cb6a99e-76d1-46e8-880a-22f3fb10af70	es	education	formula_t	t = Tiempo en años	2025-07-31 13:55:13.328229+00	2025-07-31 13:55:13.328229+00
2cec8b34-0241-4a07-8763-d45181f35972	pl	education	compound_description_1	Odsetki składane są często nazywane "ósmym cudem świata" nie bez powodu. W przeciwieństwie do odsetek prostych, które obliczają tylko zwroty z twojej początkowej inwestycji, odsetki składane obliczają zwroty zarówno z twojego kapitału głównego, JAK I z odsetek, które już zarobiłeś.	2025-07-31 13:55:13.474652+00	2025-07-31 13:55:13.474652+00
62764453-edb0-49cb-9a42-256e83b21095	pl	education	compound_description_2	To tworzy efekt kuli śnieżnej, gdzie twoje pieniądze rosną wykładniczo w czasie. Im wcześniej zaczniesz inwestować i im dłużej pozostaniesz zainwestowany, tym bardziej dramatyczny staje się ten efekt. Nawet małe, konsekwentne wpłaty mogą urosnąć do znacznego bogactwa w ciągu dekad.	2025-07-31 13:55:13.474652+00	2025-07-31 13:55:13.474652+00
12208de2-6258-4591-a650-837ea1b1b080	pl	education	formula_title	Kluczowa Formuła: A = P(1 + r/n)^(nt)	2025-07-31 13:55:13.474652+00	2025-07-31 13:55:13.474652+00
ae0d1bf5-2400-4393-8015-8a4f84ec6cca	pl	education	formula_a	A = Końcowa kwota	2025-07-31 13:55:13.474652+00	2025-07-31 13:55:13.474652+00
c1f2027f-9b18-473c-ade3-aec519b97642	pl	education	formula_p	P = Kapitał główny (początkowa inwestycja)	2025-07-31 13:55:13.474652+00	2025-07-31 13:55:13.474652+00
41e7c2c9-8b8c-4bca-a77c-4cc56de02d39	pl	education	formula_r	r = Roczna stopa procentowa	2025-07-31 13:55:13.474652+00	2025-07-31 13:55:13.474652+00
0ae6e04b-2de3-4e78-a90a-da7b1885f749	pl	education	formula_n	n = Liczba razy składania odsetek w roku	2025-07-31 13:55:13.474652+00	2025-07-31 13:55:13.474652+00
55e7f058-c91f-4090-9360-f0c8efdbd98e	pl	education	formula_t	t = Czas w latach	2025-07-31 13:55:13.474652+00	2025-07-31 13:55:13.474652+00
bf84fadb-b242-4322-8283-31afba512c2b	en	education	example_initial_label	Initial Investment	2025-07-31 13:55:13.595153+00	2025-07-31 13:55:13.595153+00
fe425ec4-1b7b-4245-9a4e-1dba1efa1fc3	en	education	example_monthly_label	Monthly Addition	2025-07-31 13:55:13.595153+00	2025-07-31 13:55:13.595153+00
6f49e7ae-006c-4eb8-88d1-17ee1238faf2	en	education	example_return_label	Annual Return	2025-07-31 13:55:13.595153+00	2025-07-31 13:55:13.595153+00
86441375-c532-440a-8d8a-b7d568f2bc7a	en	education	example_time_label	Time Horizon	2025-07-31 13:55:13.595153+00	2025-07-31 13:55:13.595153+00
dd774c5b-c550-4fe1-800f-e3bad64984f7	en	education	example_result_label	Final Value	2025-07-31 13:55:13.595153+00	2025-07-31 13:55:13.595153+00
18a7385b-89e2-4dd4-b7a1-c815b89ebeca	es	education	example_initial_label	Inversión Inicial	2025-07-31 13:55:13.715443+00	2025-07-31 13:55:13.715443+00
f983479c-1dfd-4b37-8649-4ca208071b31	es	education	example_monthly_label	Adición Mensual	2025-07-31 13:55:13.715443+00	2025-07-31 13:55:13.715443+00
9e8a0cd1-0ce8-4769-84af-628e6bf3917b	es	education	example_return_label	Rendimiento Anual	2025-07-31 13:55:13.715443+00	2025-07-31 13:55:13.715443+00
4787145b-8b40-4ece-97be-0b9533703787	es	education	example_time_label	Horizonte Temporal	2025-07-31 13:55:13.715443+00	2025-07-31 13:55:13.715443+00
30647720-f537-480b-b473-2edb936a116d	es	education	example_result_label	Valor Final	2025-07-31 13:55:13.715443+00	2025-07-31 13:55:13.715443+00
7d2f7945-ba68-45f0-8891-17865efe462c	pl	education	example_initial_label	Początkowa Inwestycja	2025-07-31 13:55:13.83514+00	2025-07-31 13:55:13.83514+00
2d01d3b0-fa25-4fa1-b2b3-ea046605ef99	pl	education	example_monthly_label	Miesięczny Dodatek	2025-07-31 13:55:13.83514+00	2025-07-31 13:55:13.83514+00
31f6fa56-ab47-4b62-aa19-0ccc0a13f9aa	pl	education	example_return_label	Roczny Zwrot	2025-07-31 13:55:13.83514+00	2025-07-31 13:55:13.83514+00
8d4cbc03-fd6f-4033-8056-8477d920db38	pl	education	example_time_label	Horyzont Czasowy	2025-07-31 13:55:13.83514+00	2025-07-31 13:55:13.83514+00
442e4767-c27b-420e-a878-c6f32f0feed9	pl	education	example_result_label	Końcowa Wartość	2025-07-31 13:55:13.83514+00	2025-07-31 13:55:13.83514+00
31ec67b0-dd82-4d2f-a0e6-3b859b98eda6	en	scenarios	latest_section_subtitle	Discover investment plans recently created by our community	2025-07-31 13:55:13.957648+00	2025-07-31 13:55:13.957648+00
d3dc8ce3-f7ea-4f26-bc8e-ed58febad303	es	scenarios	latest_section_subtitle	Descubre planes de inversión creados recientemente por nuestra comunidad	2025-07-31 13:55:13.957648+00	2025-07-31 13:55:13.957648+00
ee6af744-c165-431a-86cc-d563e9e1bd1e	pl	scenarios	latest_section_subtitle	Odkryj plany inwestycyjne niedawno utworzone przez naszą społeczność	2025-07-31 13:55:13.957648+00	2025-07-31 13:55:13.957648+00
b2d91623-5574-4c07-8043-2a094a638352	en	badges	investment_calculator	Investment Calculator	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
fe7b873f-171a-4d28-a0ef-edce7f128643	es	badges	investment_calculator	Calculadora de Inversión	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
496a0437-fc06-4701-ad69-f94fec668ed1	pl	badges	investment_calculator	Kalkulator Inwestycji	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
08e5ffe2-4d96-4a90-96d1-a4a5acaa5644	en	badges	investment_scenarios	Investment Scenarios	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
a8d1a440-ecb6-40d6-8258-581e8526ba7d	es	badges	investment_scenarios	Escenarios de Inversión	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
c79d198e-4690-498d-b855-b87e029df908	pl	badges	investment_scenarios	Scenariusze Inwestycyjne	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
fb6ce992-ae1a-471b-89e3-cf8ebc2c3a70	en	badges	recently_created	Recently Created	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
8b416432-8a3c-4141-934d-02bbf46670fd	es	badges	recently_created	Creados Recientemente	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
f11ceaae-e641-4eaa-aec9-7a1b23792246	pl	badges	recently_created	Ostatnio Utworzone	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
6015fc2c-87af-4ba1-b2fc-b59010629a36	en	badges	simple_process	Simple Process	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
63f5ca98-925f-4274-883d-98a66f1fa2b5	es	badges	simple_process	Proceso Simple	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
47226727-02b4-495b-bbd4-9f5bc24d1679	pl	badges	simple_process	Prosty Proces	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
6e9bc512-750d-4521-8e95-04971598b3e7	en	badges	expert_guidance	Expert Guidance	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
b4e2d0af-362d-490b-9f4f-1418db1118f7	es	badges	expert_guidance	Orientación de Expertos	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
2474cf2f-4a63-483b-95a2-198b35f40f03	pl	badges	expert_guidance	Wskazówki Ekspertów	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
7008b886-c3bf-4f68-973b-d94b8983ea62	en	badges	powerful_features	Powerful Features	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
be76af80-9b73-4af5-8e24-2a2cf014e582	es	badges	powerful_features	Características Potentes	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
7c5966c8-3528-4fad-93ab-3773e81ed978	pl	badges	powerful_features	Potężne Funkcje	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
2152cba8-ee9d-4929-96dc-a0befc6108f9	en	badges	help_center	Help Center	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
e25cdab2-e493-4cab-95d7-b42849318e3e	es	badges	help_center	Centro de Ayuda	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
d96da5e6-1ad0-45bd-bc4e-5830c9bb54fd	pl	badges	help_center	Centrum Pomocy	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
0ba5d943-2c71-46f0-8333-a4bada374b09	en	badges	investment_education	Investment Education	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
3c1b591a-34bd-41aa-b634-cf9f4527cd72	es	badges	investment_education	Educación de Inversión	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
5696e7ca-d160-407b-a1c2-e1dc3941fb44	pl	badges	investment_education	Edukacja Inwestycyjna	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
9db1ef9d-ddd6-480d-91fe-86981a54babe	en	badges	smart_comparisons	Smart Comparisons	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
fc2ddc15-13b3-41ff-b47a-eb12829570b5	es	badges	smart_comparisons	Comparaciones Inteligentes	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
b2274dd8-ef13-4832-8e9a-1f89a74b8257	pl	badges	smart_comparisons	Inteligentne Porównania	2025-07-31 14:24:32.04234+00	2025-07-31 14:24:32.04234+00
f377764f-8054-4527-a606-24b910039f51	en	calculator	good_starting_amount	Good starting amount!	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
5fd6505c-7253-432a-bb8d-ae55d2f2d0e9	es	calculator	good_starting_amount	¡Buena cantidad inicial!	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
3e2cbf12-b19a-4be4-8647-309d59f75c73	es	calculator	excellent_regular_investing	¡Excelente! La inversión regular construye riqueza	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
966a81fc-3f52-4d89-8c32-783f6c439a6e	pl	calculator	excellent_regular_investing	Świetnie! Regularne inwestowanie buduje bogactwo	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
5d4053ba-dee8-450f-a1fd-e4662465ff60	en	calculator	realistic_return_rate	Realistic return rate for long-term investing	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
49fbe777-5d68-4111-9eb3-e91b0fe4ed22	es	calculator	realistic_return_rate	Tasa de rendimiento realista para inversión a largo plazo	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
4f79c504-fd77-46bb-bd1f-c01b6b11bcb9	pl	calculator	realistic_return_rate	Realistyczna stopa zwrotu dla długoterminowego inwestowania	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
e1e49983-ae4a-40e9-b735-b339ce9015a1	en	calculator	time_best_friend	Great! Time is your best friend in investing	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
d7791f45-15b6-4e84-9c39-4bee389188fe	es	calculator	time_best_friend	¡Genial! El tiempo es tu mejor amigo en la inversión	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
1ed85a7a-1f6b-47d1-b9b6-5b3eae9b8c17	pl	calculator	time_best_friend	Świetnie! Czas to twój najlepszy przyjaciel w inwestowaniu	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
ee423d37-2de6-45a2-a046-a6fdf78a5036	en	calculator	time_horizon_label	Time Horizon	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
f65b7c87-6d96-45c7-9a17-461df173a6b7	es	calculator	time_horizon_label	Horizonte Temporal	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
6c6c4e4f-70e8-471b-bc08-8b09a7932e70	pl	calculator	time_horizon_label	Horyzont Czasowy	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
f3295931-ec0e-45a0-99c3-0944fcb93067	en	calculator	years_suffix	years	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
8b8146ae-7774-4faf-8e0f-cd62b2b050ad	es	calculator	years_suffix	años	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
2a2c43e6-84bd-408d-ba79-7b9d1645a0e6	pl	calculator	years_suffix	lat	2025-07-31 14:24:32.464024+00	2025-07-31 14:24:32.464024+00
40a77728-459c-4238-8201-433d58d3e720	es	how_it_works	step_2_title	Ver Gráfico de Crecimiento Interactivo	2025-07-31 14:24:32.591931+00	2025-07-31 14:24:32.591931+00
ae6f6ea3-187e-4073-896f-eb8ac19b03ee	pl	how_it_works	step_2_title	Zobacz Interaktywny Wykres Wzrostu	2025-07-31 14:24:32.591931+00	2025-07-31 14:24:32.591931+00
03069047-cbd9-4e5e-9f27-c2e0a718a976	es	how_it_works	step_2_description	Nuestra calculadora genera instantáneamente una representación visual del crecimiento de tu inversión, mostrando el poder del interés compuesto a lo largo del tiempo.	2025-07-31 14:24:32.591931+00	2025-07-31 14:24:32.591931+00
65c2cec4-7c0f-4575-8c20-8e10a0931ebe	pl	how_it_works	step_2_description	Nasz kalkulator natychmiastowo generuje wizualną reprezentację wzrostu twojej inwestycji, pokazując siłę odsetek składanych w czasie.	2025-07-31 14:24:32.591931+00	2025-07-31 14:24:32.591931+00
0ee160ae-5144-4539-8e94-3c4e16e0586d	es	how_it_works	step_3_title	Exporta y Comparte tus Resultados	2025-07-31 14:24:32.591931+00	2025-07-31 14:24:32.591931+00
acfd4e58-69fa-40b4-8559-48eacb1f6619	pl	how_it_works	step_3_title	Eksportuj i Udostępnij Swoje Wyniki	2025-07-31 14:24:32.591931+00	2025-07-31 14:24:32.591931+00
30bcb786-7054-42bf-80bb-ee9e12b1a217	es	how_it_works	step_3_description	Guarda tus escenarios de inversión como PDFs o compártelos con asesores financieros para tomar decisiones informadas sobre tu futuro financiero.	2025-07-31 14:24:32.591931+00	2025-07-31 14:24:32.591931+00
dd9e3758-8a5b-4f6b-9c99-8b5bb91f26ae	pl	how_it_works	step_3_description	Zapisz swoje scenariusze inwestycyjne jako pliki PDF lub udostępnij je doradcom finansowym, aby podejmować świadome decyzje o swojej finansowej przyszłości.	2025-07-31 14:24:32.591931+00	2025-07-31 14:24:32.591931+00
216ba7ae-2589-455a-ad20-33214481c345	en	calculator	years_to_goal	Years to goal	2025-07-31 14:40:14.013609+00	2025-07-31 14:40:14.013609+00
45a7acdb-9c1c-433a-9f79-8e92753a80d8	es	calculator	years_to_goal	Años hasta el objetivo	2025-07-31 14:40:14.460143+00	2025-07-31 14:40:14.460143+00
f5232c52-c382-43c6-b0de-251da8ac478c	pl	calculator	years_to_goal	Lata do celu	2025-07-31 14:40:14.592234+00	2025-07-31 14:40:14.592234+00
3ca709e8-d37f-4297-b048-b43b1048a3b3	en	calculator	monthly_growth	Monthly growth	2025-07-31 14:40:50.521167+00	2025-07-31 14:40:50.521167+00
5c647219-4d33-42e5-a138-1a088a332833	es	calculator	monthly_growth	Crecimiento mensual	2025-07-31 14:40:50.894515+00	2025-07-31 14:40:50.894515+00
3eaf8892-e91e-4beb-ad95-4248070079fa	pl	calculator	monthly_growth	Wzrost miesięczny	2025-07-31 14:40:51.016143+00	2025-07-31 14:40:51.016143+00
ff73e610-4cf2-480d-8a51-e1cf90b27727	en	calculator	annual_return	Annual Return	2025-07-31 14:40:51.138445+00	2025-07-31 14:40:51.138445+00
7f777918-a91a-4eef-9999-353ffb1fc3ea	es	calculator	annual_return	Retorno Anual	2025-07-31 14:40:51.26018+00	2025-07-31 14:40:51.26018+00
93ef32fd-83b2-41fd-9843-16b589a39c31	pl	calculator	annual_return	Zwrot Roczny	2025-07-31 14:40:51.386385+00	2025-07-31 14:40:51.386385+00
6fedee1a-e5a5-4849-91fb-0b835c0f6464	en	calculator	initial_amount	Initial Amount	2025-07-31 14:40:51.508293+00	2025-07-31 14:40:51.508293+00
16348a0b-e568-4748-aaf8-a3508eeb5615	es	calculator	initial_amount	Cantidad Inicial	2025-07-31 14:40:51.632293+00	2025-07-31 14:40:51.632293+00
2d2f948f-d45e-46a3-9b2f-33baa32fb9b8	pl	calculator	initial_amount	Kwota Początkowa	2025-07-31 14:40:51.754227+00	2025-07-31 14:40:51.754227+00
5e77b861-1f33-49d3-86e5-9d57b6c5ef45	en	calculator	future_value	Future Value	2025-07-31 14:40:51.880174+00	2025-07-31 14:40:51.880174+00
111be9c7-366c-49f3-811f-11bddd98912e	es	calculator	future_value	Valor Futuro	2025-07-31 14:40:52.002206+00	2025-07-31 14:40:52.002206+00
9c142155-f350-408d-b7cf-eaa80af4d573	pl	calculator	future_value	Wartość Przyszła	2025-07-31 14:40:52.12431+00	2025-07-31 14:40:52.12431+00
e246ca75-e533-4a86-8e34-804426590b51	en	calculator	monthly	Monthly	2025-07-31 14:40:52.244356+00	2025-07-31 14:40:52.244356+00
0a4e0373-eda9-4a4a-b2ee-d62bdb7999d4	es	calculator	monthly	Mensual	2025-07-31 14:40:52.366602+00	2025-07-31 14:40:52.366602+00
088c6f1c-06f2-4620-b335-7fedb97f1f58	pl	calculator	monthly	Miesięczne	2025-07-31 14:40:52.486287+00	2025-07-31 14:40:52.486287+00
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pages (id, slug, locale, title, content, meta_description, meta_keywords, published, created_at, updated_at) FROM stdin;
e47da6dd-4d57-4b71-a7ef-d1680e496f84	about	en	About - Future Value Investment Calculator	<h1>About Our Mission</h1>\n<p>We are dedicated to democratizing financial planning by providing accurate, accessible, and transparent investment calculation tools for everyone.</p>\n<h2>Our Mission</h2>\n<p>Financial planning shouldn't be a privilege reserved for the wealthy. We believe everyone deserves access to powerful, accurate tools that help understand their investment potential and plan their financial future.</p>	Learn about our mission to democratize financial planning through accurate, accessible investment calculation tools.	\N	t	2025-06-23 11:09:43.932488+00	2025-06-23 11:09:43.932488+00
f25ec5fe-b796-4b57-b662-8151114d1685	about	pl	O Nas - Kalkulator Wartości Przyszłej Inwestycji	<h1>O Naszej Misji</h1>\n<p>Jesteśmy dedykowani demokratyzacji planowania finansowego poprzez dostarczanie dokładnych, dostępnych i przejrzystych narzędzi kalkulacji inwestycji dla wszystkich.</p>\n<h2>Nasza Misja</h2>\n<p>Planowanie finansowe nie powinno być przywilejem zarezerwowanym dla bogatych. Wierzymy, że każdy zasługuje na dostęp do potężnych, dokładnych narzędzi, które pomagają zrozumieć potencjał swoich inwestycji i planować swoją finansową przyszłość.</p>	Poznaj naszą misję demokratyzacji planowania finansowego za pomocą dokładnych, dostępnych narzędzi kalkulacji inwestycji.	\N	t	2025-06-23 11:09:43.932488+00	2025-06-23 11:09:43.932488+00
d94f23f8-4959-4e05-bb43-70ee9c44d1dd	about	es	Acerca de - Calculadora de Valor Futuro de Inversión	<h1>Acerca de Nuestra Misión</h1>\n<p>Estamos dedicados a democratizar la planificación financiera proporcionando herramientas de cálculo de inversiones precisas, accesibles y transparentes para todos.</p>\n<h2>Nuestra Misión</h2>\n<p>La planificación financiera no debería ser un privilegio reservado para los ricos. Creemos que todos merecen acceso a herramientas poderosas y precisas que ayuden a entender su potencial de inversión y planificar su futuro financiero.</p>	Conoce nuestra misión de democratizar la planificación financiera a través de herramientas de cálculo de inversiones precisas y accesibles.	\N	t	2025-06-23 11:09:43.932488+00	2025-06-23 11:09:43.932488+00
a13ab6f6-d089-40a2-b464-ffd2136c2771	contact	en	Contact Us - Future Value Investment Calculator	<h1>Contact Us</h1>\n<p>Have questions, suggestions, or feedback? We'd love to hear from you.</p>\n<h2>Get in Touch</h2>\n<p>Email us at: <a href="mailto:contact@nature2pixel.com">contact@nature2pixel.com</a></p>\n<p>Please read our <a href="/privacy">privacy policy</a> to understand how we handle your information.</p>	Contact us for questions, suggestions, or feedback about our financial planning tools.	\N	t	2025-06-23 11:09:44.074328+00	2025-06-23 11:09:44.074328+00
a68b2402-3b3b-428c-aedb-afe0efdc8e16	contact	pl	Skontaktuj się z Nami - Kalkulator Wartości Przyszłej Inwestycji	<h1>Skontaktuj się z Nami</h1>\n<p>Masz pytania, sugestie lub opinie? Chcielibyśmy o Tobie usłyszeć.</p>\n<h2>Skontaktuj się</h2>\n<p>Wyślij nam e-mail: <a href="mailto:contact@nature2pixel.com">contact@nature2pixel.com</a></p>\n<p>Przeczytaj naszą <a href="/privacy">politykę prywatności</a>, aby zrozumieć, jak obsługujemy Twoje informacje.</p>	Skontaktuj się z nami w sprawie pytań, sugestii lub opinii o naszych narzędziach planowania finansowego.	\N	t	2025-06-23 11:09:44.074328+00	2025-06-23 11:09:44.074328+00
71f731f6-9c30-4727-84b0-9492287f1a60	contact	es	Contáctanos - Calculadora de Valor Futuro de Inversión	<h1>Contáctanos</h1>\n<p>¿Tienes preguntas, sugerencias o comentarios? Nos encantaría saber de ti.</p>\n<h2>Ponte en Contacto</h2>\n<p>Envíanos un email: <a href="mailto:contact@nature2pixel.com">contact@nature2pixel.com</a></p>\n<p>Por favor lee nuestra <a href="/privacy">política de privacidad</a> para entender cómo manejamos tu información.</p>	Contáctanos para preguntas, sugerencias o comentarios sobre nuestras herramientas de planificación financiera.	\N	t	2025-06-23 11:09:44.074328+00	2025-06-23 11:09:44.074328+00
06c4274c-8cac-49ca-8ea5-6ad301b80458	privacy	en	Privacy Policy - Future Value Investment Calculator	<h1>Privacy Policy</h1>\n <h2>Introduction</h2>\n <p>Welcome to Future Value Investment Calculator. We respect your privacy and are committed to protecting your personal data.</p>\n <h2>Information We Collect</h2>\n <p>We collect information to provide better services to our users, including:</p>\n <ul>\n   <li>Browser and device information for analytics</li>\n   <li>Usage data to improve our calculator</li>\n   <li>Investment parameters you enter (stored locally only)</li>\n </ul>\n <h2>How We Use Your Information</h2>\n <p>We use this information to:</p>\n <ul>\n   <li>Provide and improve our financial planning tools</li>\n   <li>Analyze usage patterns to enhance user experience</li>\n   <li>Ensure security and prevent fraud</li>\n </ul>\n <p>For complete privacy details, please refer to our static privacy policy.</p>	Learn how Future Value Investment Calculator protects your privacy and handles your data.	\N	t	2025-06-23 11:56:31.540491+00	2025-06-23 11:56:31.540491+00
f39bd6e9-382c-4cf2-ac6b-c3a240d59fe3	terms	en	Terms of Service - Future Value Investment Calculator	<h1>Terms of Service</h1>\n <h2>Acceptance of Terms</h2>\n <p>By using the Future Value Investment Calculator, you agree to these terms of service.</p>\n <h2>Use of Service</h2>\n <p>Our calculator is provided for educational and planning purposes only. All calculations are estimates.</p>\n <h2>Disclaimers</h2>\n <p>Investment results may vary. Past performance does not guarantee future results. Please consult with a financial advisor for personalized advice.</p>\n <h2>Liability</h2>\n <p>We are not liable for any investment decisions made based on our calculator results.</p>	Terms of service for using the Future Value Investment Calculator.	\N	t	2025-06-23 11:56:31.540491+00	2025-06-23 11:56:31.540491+00
3c95f706-bec6-4518-96c4-08987bfafb2f	cookies	en	Cookie Policy - Future Value Investment Calculator	<h1>Cookie Policy</h1>\n <h2>What Are Cookies</h2>\n <p>Cookies are small text files stored on your device to enhance your browsing experience.</p>\n <h2>How We Use Cookies</h2>\n <p>We use cookies for:</p>\n <ul>\n   <li>Remembering your preferences (currency, language)</li>\n   <li>Analytics to improve our service</li>\n   <li>Security and fraud prevention</li>\n </ul>\n <h2>Managing Cookies</h2>\n <p>You can control cookies through your browser settings. Disabling cookies may affect functionality.</p>	Information about how Future Value Investment Calculator uses cookies.	\N	t	2025-06-23 11:56:31.540491+00	2025-06-23 11:56:31.540491+00
e70ec1d2-b4d0-4008-bcd1-4649218916d5	privacy	es	Política de Privacidad - Calculadora de Valor Futuro de Inversión	<h1>Política de Privacidad</h1>\n <h2>Introducción</h2>\n <p>Bienvenido a la Calculadora de Valor Futuro de Inversión. Respetamos tu privacidad y nos comprometemos a proteger tus datos personales.</p>\n <h2>Información que Recopilamos</h2>\n <p>Recopilamos información para proporcionar mejores servicios, incluyendo:</p>\n <ul>\n   <li>Información del navegador y dispositivo para análisis</li>\n   <li>Datos de uso para mejorar nuestra calculadora</li>\n   <li>Parámetros de inversión que ingresas (almacenados solo localmente)</li>\n </ul>\n <h2>Cómo Usamos tu Información</h2>\n <p>Usamos esta información para:</p>\n <ul>\n   <li>Proporcionar y mejorar nuestras herramientas de planificación financiera</li>\n   <li>Analizar patrones de uso para mejorar la experiencia del usuario</li>\n   <li>Garantizar la seguridad y prevenir fraudes</li>\n </ul>	Aprende cómo la Calculadora de Valor Futuro de Inversión protege tu privacidad.	\N	t	2025-06-23 11:56:31.663722+00	2025-06-23 11:56:31.663722+00
b8b27631-cd00-41f1-abeb-6711c4317150	terms	es	Términos de Servicio - Calculadora de Valor Futuro de Inversión	<h1>Términos de Servicio</h1>\n <h2>Aceptación de Términos</h2>\n <p>Al usar la Calculadora de Valor Futuro de Inversión, aceptas estos términos de servicio.</p>\n <h2>Uso del Servicio</h2>\n <p>Nuestra calculadora se proporciona solo con fines educativos y de planificación. Todos los cálculos son estimaciones.</p>\n <h2>Descargos de Responsabilidad</h2>\n <p>Los resultados de inversión pueden variar. El rendimiento pasado no garantiza resultados futuros.</p>	Términos de servicio para usar la Calculadora de Valor Futuro de Inversión.	\N	t	2025-06-23 11:56:31.663722+00	2025-06-23 11:56:31.663722+00
a5261259-1d22-41f8-a85c-2456c66ad719	cookies	es	Política de Cookies - Calculadora de Valor Futuro de Inversión	<h1>Política de Cookies</h1>\n <h2>Qué son las Cookies</h2>\n <p>Las cookies son pequeños archivos de texto almacenados en tu dispositivo para mejorar tu experiencia de navegación.</p>\n <h2>Cómo Usamos las Cookies</h2>\n <p>Usamos cookies para:</p>\n <ul>\n   <li>Recordar tus preferencias (moneda, idioma)</li>\n   <li>Análisis para mejorar nuestro servicio</li>\n   <li>Seguridad y prevención de fraudes</li>\n </ul>	Información sobre cómo usa cookies la Calculadora de Valor Futuro de Inversión.	\N	t	2025-06-23 11:56:31.663722+00	2025-06-23 11:56:31.663722+00
5e6d66e1-ba1b-4040-b17c-0363402e7408	privacy	pl	Polityka Prywatności - Kalkulator Wartości Przyszłej Inwestycji	<h1>Polityka Prywatności</h1>\n <h2>Wprowadzenie</h2>\n <p>Witamy w Kalkulatorze Wartości Przyszłej Inwestycji. Szanujemy Twoją prywatność i zobowiązujemy się do ochrony Twoich danych osobowych.</p>\n <h2>Informacje, które Zbieramy</h2>\n <p>Zbieramy informacje, aby zapewnić lepsze usługi, w tym:</p>\n <ul>\n   <li>Informacje o przeglądarce i urządzeniu do analiz</li>\n   <li>Dane użytkowania w celu usprawnienia naszego kalkulatora</li>\n   <li>Parametry inwestycyjne, które wprowadzasz (przechowywane tylko lokalnie)</li>\n </ul>\n <h2>Jak Używamy Twoich Informacji</h2>\n <p>Używamy tych informacji do:</p>\n <ul>\n   <li>Dostarczania i ulepszania naszych narzędzi planowania finansowego</li>\n   <li>Analizowania wzorców użytkowania w celu poprawy doświadczenia użytkownika</li>\n   <li>Zapewnienia bezpieczeństwa i zapobiegania oszustwom</li>\n </ul>	Dowiedz się, jak Kalkulator Wartości Przyszłej Inwestycji chroni Twoją prywatność.	\N	t	2025-06-23 11:56:31.792046+00	2025-06-23 11:56:31.792046+00
7354b467-dacd-4f92-be44-ec9cbc8e3a89	terms	pl	Warunki Korzystania - Kalkulator Wartości Przyszłej Inwestycji	<h1>Warunki Korzystania</h1>\n <h2>Akceptacja Warunków</h2>\n <p>Korzystając z Kalkulatora Wartości Przyszłej Inwestycji, zgadzasz się na te warunki korzystania.</p>\n <h2>Korzystanie z Usługi</h2>\n <p>Nasz kalkulator jest dostarczany wyłącznie w celach edukacyjnych i planistycznych. Wszystkie obliczenia to szacunki.</p>\n <h2>Zastrzeżenia</h2>\n <p>Wyniki inwestycji mogą się różnić. Wyniki z przeszłości nie gwarantują przyszłych rezultatów.</p>	Warunki korzystania z Kalkulatora Wartości Przyszłej Inwestycji.	\N	t	2025-06-23 11:56:31.792046+00	2025-06-23 11:56:31.792046+00
3340adbe-31d0-4c65-97f5-099d70abb72a	cookies	pl	Polityka Cookies - Kalkulator Wartości Przyszłej Inwestycji	<h1>Polityka Cookies</h1>\n <h2>Czym są Cookies</h2>\n <p>Cookies to małe pliki tekstowe przechowywane na Twoim urządzeniu w celu poprawy doświadczenia przeglądania.</p>\n <h2>Jak Używamy Cookies</h2>\n <p>Używamy cookies do:</p>\n <ul>\n   <li>Zapamiętywania Twoich preferencji (waluta, język)</li>\n   <li>Analiz w celu poprawy naszej usługi</li>\n   <li>Bezpieczeństwa i zapobiegania oszustwom</li>\n </ul>	Informacje o tym, jak Kalkulator Wartości Przyszłej Inwestycji używa cookies.	\N	t	2025-06-23 11:56:31.792046+00	2025-06-23 11:56:31.792046+00
\.


--
-- Data for Name: scenario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scenario (id, slug, locale, name, description, initial_amount, monthly_contribution, annual_return, time_horizon, tags, is_predefined, is_public, created_by, view_count, created_at, updated_at, search_vector) FROM stdin;
2689bd6b-cace-4a0a-8c38-f43f7d3c04ce	invest-34600-monthly-550-7percent-27years-investment	en	Investment Plan: $34,600 + $550/month	Explore the investment strategy: $34,600 initial investment, $550 monthly contributions over 27 years targeting 7% annual return.	34600.00	550.00	7.00	27	{investment}	f	t	system	0	2025-08-19 15:42:27.411973+00	2025-08-19 15:42:27.394395+00	'27':18 '34':3,10 '550':14 '550/month':5 '600':4,11 '7':21 'annual':22 'contributions':16 'explore':6 'initial':12 'investment':1,8,13 'monthly':15 'over':17 'plan':2 'return':23 'strategy':9 'targeting':20 'the':7 'years':19
a7f98989-38b1-4b1b-b02a-41a424bb4b7a	invest-34600-monthly-550-7percent-27years-investment	pl	Plan inwestycyjny: 34 600 USD + 550 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 34 600 USD, miesięczne składki 550 USD przez 27 lat z celem 7% rocznego zwrotu.	34600.00	550.00	7.00	27	{investment}	f	t	system	0	2025-08-19 15:43:03.945324+00	2025-08-19 15:43:03.962587+00	'27':21 '34':3,13 '550':6,18 '600':4,14 '7':25 'celem':24 'inwestycja':11 'inwestycyjny':2 'inwestycyjną':10 'lat':22 'miesięczne':16 'plan':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
f035f2f2-dd0a-4847-896c-42fa0c0c1296	starter-10k-500-7-10	en	Beginner Investor	Conservative start with moderate monthly contributions	10000.00	500.00	7.00	10	{beginner,conservative,starter}	t	t	system	0	2025-06-23 11:09:43.516314+00	2025-08-18 13:54:42.059898+00	'beginner':1 'conservative':3 'contributions':8 'investor':2 'moderate':6 'monthly':7 'start':4 'with':5
84224082-33bd-43d8-9903-497ccaeb97be	retirement-50k-2k-6-30	en	Retirement Planning	Long-term retirement strategy with steady contributions	50000.00	2000.00	6.00	30	{retirement,long-term,conservative}	t	t	system	0	2025-06-23 11:09:43.516314+00	2025-08-18 13:54:42.059898+00	'contributions':10 'long':4 'long-term':3 'planning':2 'retirement':1,6 'steady':9 'strategy':7 'term':5 'with':8
6de30d12-f0ef-4c3f-aebe-5b0af7061193	invest-34600-monthly-550-7percent-27years-investment	es	Plan de inversión: 34.600 US$ + 550 US$/mes	Explora la estrategia de inversión: inversión inicial de 34.600 US$, contribuciones mensuales de 550 US$ durante 27 años con objetivo de 7% de rendimiento anual.	34600.00	550.00	7.00	27	{investment}	f	t	system	0	2025-08-19 23:09:18.777243+00	2025-08-19 23:09:18.797574+00	'/mes':8 '27':25 '34.600':4,17 '550':6,22 '7':30 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':3,13,14 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
633eff65-6703-4110-9eee-cb9a327eb276	invest-100000-monthly-5000-10percent-25years-retirement	pl	Planowanie emerytalne: 100 000 USD + 5000 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 100 000 USD, miesięczne składki 5000 USD przez 25 lat z celem 10% rocznego zwrotu.	100000.00	5000.00	10.00	25	{retirement}	f	t	system	0	2025-08-11 10:25:35.433062+00	2025-08-18 13:54:42.059898+00	'000':4,14 '10':25 '100':3,13 '25':21 '5000':6,18 'celem':24 'emerytalne':2 'inwestycja':11 'inwestycyjną':10 'lat':22 'miesięczne':16 'planowanie':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
f6ac72cd-1408-4a82-9727-cc8fe14c3bf1	invest-2000-monthly-1000-8percent-15years-retirement	es	Investment Plan: $2,000 + $1000/month	Calculate investing $2,000 initially with $1000 monthly contributions at 8% annual return over 15 years.	2000.00	1000.00	8.00	15	{retirement}	f	t	system	0	2025-08-11 10:26:11.423278+00	2025-08-18 13:54:42.059898+00	'000':4,9 '1000':12 '1000/month':5 '15':20 '2':3,8 '8':16 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
69eda7ac-e03c-4857-ae6d-ad5cadfb4cdb	invest-25000-monthly-1000-8percent-25years-retirement	pl	Planowanie emerytalne: 25 000 USD + 1000 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 25 000 USD, miesięczne składki 1000 USD przez 25 lat z celem 8% rocznego zwrotu.	25000.00	1000.00	8.00	25	{retirement}	f	t	system	0	2025-08-11 10:26:17.432516+00	2025-08-18 13:54:42.059898+00	'000':4,14 '1000':6,18 '25':3,13,21 '8':25 'celem':24 'emerytalne':2 'inwestycja':11 'inwestycyjną':10 'lat':22 'miesięczne':16 'planowanie':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
03cde4b4-194c-47ab-891b-77ea16457a16	invest-50000-monthly-500-7percent-10years-house	pl	Wkład własny na dom: 50 000 USD + 500 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 50 000 USD, miesięczne składki 500 USD przez 10 lat z celem 7% rocznego zwrotu.	50000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 10:25:47.43473+00	2025-08-18 13:54:42.059898+00	'000':6,16 '10':23 '50':5,15 '500':8,20 '7':27 'celem':26 'dom':4 'inwestycja':13 'inwestycyjną':12 'lat':24 'miesięczne':18 'na':3 'początkowa':14 'poznaj':10 'przez':22 'rocznego':28 'składki':19 'strategię':11 'usd':7,17,21 'usd/mies':9 'wkład':1 'własny':2 'z':25 'zwrotu':29
2f23c1f8-39a5-4aa2-878f-d7a750fc5d06	invest-11000-monthly-550-11percent-50years-investment	pl	Plan inwestycyjny: 11 000 USD + 550 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 11 000 USD, miesięczne składki 550 USD przez 50 lat z celem 11% rocznego zwrotu.	11000.00	550.00	11.00	50	{investment}	f	t	system	0	2025-08-11 10:26:23.450494+00	2025-08-18 13:54:42.059898+00	'000':4,14 '11':3,13,25 '50':21 '550':6,18 'celem':24 'inwestycja':11 'inwestycyjny':2 'inwestycyjną':10 'lat':22 'miesięczne':16 'plan':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
02a17174-6f9a-4e5c-8c98-9c31a8377a2b	invest-2000-monthly-1000-8percent-15years-retirement	pl	Investment Plan: $2,000 + $1000/month	Calculate investing $2,000 initially with $1000 monthly contributions at 8% annual return over 15 years.	2000.00	1000.00	8.00	15	{retirement}	f	t	system	0	2025-08-11 10:26:09.496039+00	2025-08-18 13:54:42.059898+00	'000':4,9 '1000':12 '1000/month':5 '15':20 '2':3,8 '8':16 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
ac63c36f-3b46-48f9-b5cc-f9e8b8d7df1c	invest-500-monthly-100-5percent-30years-starter	es	Investment Plan: $500 + $100/month	Calculate investing $500 initially with $100 monthly contributions at 5% annual return over 30 years.	500.00	100.00	5.00	30	{starter}	f	t	system	0	2025-08-11 10:26:13.435184+00	2025-08-18 13:54:42.059898+00	'100':10 '100/month':4 '30':18 '5':14 '500':3,7 'annual':15 'at':13 'calculate':5 'contributions':12 'initially':8 'investing':6 'investment':1 'monthly':11 'over':17 'plan':2 'return':16 'with':9 'years':19
3702adc6-3d90-47ab-8e36-05952c3335a7	invest-10000-monthly-500-7percent-10years-house	es	Entrada para vivienda: 10.000 US$ + 500 US$/mes	Explora la estrategia de inversión: inversión inicial de 10.000 US$, contribuciones mensuales de 500 US$ durante 10 años con objetivo de 7% de rendimiento anual.	10000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 09:35:51.791504+00	2025-08-18 13:54:42.059898+00	'/mes':8 '10':25 '10.000':4,17 '500':6,22 '7':30 'anual':33 'años':26 'con':27 'contribuciones':19 'de':12,16,21,29,31 'durante':24 'entrada':1 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'para':2 'rendimiento':32 'us':5,7,18,23 'vivienda':3
35803c4e-1463-49dd-8f7a-1bc54e230910	aggressive-25k-1k-12-20	en	Growth Investor	Higher risk, higher reward investment strategy	25000.00	1000.00	12.00	20	{aggressive,growth,high-risk}	t	t	system	0	2025-06-23 11:09:43.516314+00	2025-08-18 13:54:42.059898+00	'growth':1 'higher':3,5 'investment':7 'investor':2 'reward':6 'risk':4 'strategy':8
d13b888d-01f3-4373-85d4-062b71695c00	young-5k-300-8-15	en	Young Professional	Starting early with modest contributions	5000.00	300.00	8.00	15	{young,early-start,moderate}	t	t	system	0	2025-06-23 11:09:43.516314+00	2025-08-18 13:54:42.059898+00	'contributions':7 'early':4 'modest':6 'professional':2 'starting':3 'with':5 'young':1
bfd25117-3c52-41fe-9d14-fa2f09d53ea5	wealth-100k-5k-10-25	en	Wealth Building	High-value investments for serious wealth accumulation	100000.00	5000.00	10.00	25	{wealth,high-value,aggressive}	t	t	system	0	2025-06-23 11:09:43.516314+00	2025-08-18 13:54:42.059898+00	'accumulation':10 'building':2 'for':7 'high':4 'high-value':3 'investments':6 'serious':8 'value':5 'wealth':1,9
0fb8b806-f360-4637-a034-85fbcf1b0cdd	emergency-1k-200-4-5	en	Emergency Fund	Building a safety net with conservative returns	1000.00	200.00	4.00	5	{emergency,safety,conservative}	t	t	system	0	2025-06-23 11:09:43.516314+00	2025-08-18 13:54:42.059898+00	'a':4 'building':3 'conservative':8 'emergency':1 'fund':2 'net':6 'returns':9 'safety':5 'with':7
6fd7b71e-1f36-4aee-a224-ac0e2acb4006	house-5k-1500-5-7	en	Down Payment Savings	Saving for a house with conservative returns	5000.00	1500.00	5.00	7	{house,down-payment,savings,conservative}	t	t	system	0	2025-06-23 11:09:43.516314+00	2025-08-18 13:54:42.059898+00	'a':6 'conservative':9 'down':1 'for':5 'house':7 'payment':2 'returns':10 'saving':4 'savings':3 'with':8
fe9b0fe1-15a1-4900-af3f-8d90e757a7f7	invest-500-monthly-100-5percent-30years-starter	en	Investment Plan: $500 + $100/month	Calculate investing $500 initially with $100 monthly contributions at 5% annual return over 30 years.	500.00	100.00	5.00	30	{education}	f	t	system	0	2025-07-03 14:10:33.467678+00	2025-08-18 13:54:42.059898+00	'100':10 '100/month':4 '30':18 '5':14 '500':3,7 'annual':15 'at':13 'calculate':5 'contributions':12 'initially':8 'investing':6 'investment':1 'monthly':11 'over':17 'plan':2 'return':16 'with':9 'years':19
0fed4e94-6cfb-40ce-bc04-43881ae531fb	invest-2000-monthly-1000-8percent-15years-retirement	en	Investment Plan: $2,000 + $1000/month	Calculate investing $2,000 initially with $1000 monthly contributions at 8% annual return over 15 years.	2000.00	1000.00	8.00	15	{retirement}	f	t	system	0	2025-07-08 13:06:00.133389+00	2025-08-18 13:54:42.059898+00	'000':4,9 '1000':12 '1000/month':5 '15':20 '2':3,8 '8':16 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
b2dcd078-b9e7-45bf-945c-820d67073def	starter-10k-500-7-10	pl	Wkład własny na dom: 10 000 USD + 500 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 10 000 USD, miesięczne składki 500 USD przez 10 lat z celem 7% rocznego zwrotu.	10000.00	500.00	7.00	10	{beginner,conservative,starter}	t	t	system	0	2025-06-23 11:09:43.66124+00	2025-08-18 13:54:42.059898+00	'000':6,16 '10':5,15,23 '500':8,20 '7':27 'celem':26 'dom':4 'inwestycja':13 'inwestycyjną':12 'lat':24 'miesięczne':18 'na':3 'początkowa':14 'poznaj':10 'przez':22 'rocznego':28 'składki':19 'strategię':11 'usd':7,17,21 'usd/mies':9 'wkład':1 'własny':2 'z':25 'zwrotu':29
cbbfc9a6-6b94-4671-bfa3-ce8bcc7fd086	starter-10k-500-7-10	es	Entrada para vivienda: 10.000 US$ + 500 US$/mes	Explora la estrategia de inversión: inversión inicial de 10.000 US$, contribuciones mensuales de 500 US$ durante 10 años con objetivo de 7% de rendimiento anual.	10000.00	500.00	7.00	10	{beginner,conservative,starter}	t	t	system	0	2025-06-23 11:09:43.796399+00	2025-08-18 13:54:42.059898+00	'/mes':8 '10':25 '10.000':4,17 '500':6,22 '7':30 'anual':33 'años':26 'con':27 'contribuciones':19 'de':12,16,21,29,31 'durante':24 'entrada':1 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'para':2 'rendimiento':32 'us':5,7,18,23 'vivienda':3
fa54a0ea-6fc3-41f3-88c2-4bd1a3d03288	emergency-1k-200-4-5	es	Fondo de emergencia: 1000 US$ + 200 US$/mes	Explora la estrategia de inversión: inversión inicial de 1000 US$, contribuciones mensuales de 200 US$ durante 5 años con objetivo de 4% de rendimiento anual.	1000.00	200.00	4.00	5	{emergency,safety,conservative}	t	t	system	0	2025-06-23 11:09:43.796399+00	2025-08-18 13:54:42.059898+00	'/mes':8 '1000':4,17 '200':6,22 '4':30 '5':25 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'emergencia':3 'estrategia':11 'explora':9 'fondo':1 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'rendimiento':32 'us':5,7,18,23
9c146067-07b2-4034-9132-d0ab4837eb9a	young-5k-300-8-15	pl	Inwestycja startowa: 5000 USD + 300 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 5000 USD, miesięczne składki 300 USD przez 15 lat z celem 8% rocznego zwrotu.	5000.00	300.00	8.00	15	{young,early-start,moderate}	t	t	system	0	2025-06-23 11:09:43.66124+00	2025-08-18 13:54:42.059898+00	'15':19 '300':5,16 '5000':3,12 '8':23 'celem':22 'inwestycja':1,10 'inwestycyjną':9 'lat':20 'miesięczne':14 'początkowa':11 'poznaj':7 'przez':18 'rocznego':24 'składki':15 'startowa':2 'strategię':8 'usd':4,13,17 'usd/mies':6 'z':21 'zwrotu':25
b799cb9b-f287-45cc-972c-44b162ac0db7	aggressive-25k-1k-12-20	pl	Planowanie emerytalne: 25 000 USD + 1000 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 25 000 USD, miesięczne składki 1000 USD przez 20 lat z celem 12% rocznego zwrotu.	25000.00	1000.00	12.00	20	{aggressive,growth,high-risk}	t	t	system	0	2025-06-23 11:09:43.66124+00	2025-08-18 13:54:42.059898+00	'000':4,14 '1000':6,18 '12':25 '20':21 '25':3,13 'celem':24 'emerytalne':2 'inwestycja':11 'inwestycyjną':10 'lat':22 'miesięczne':16 'planowanie':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
532cf7c9-2a1e-41a5-b146-dc7d7eef2a78	aggressive-25k-1k-12-20	es	Plan de jubilación: 25.000 US$ + 1000 US$/mes	Explora la estrategia de inversión: inversión inicial de 25.000 US$, contribuciones mensuales de 1000 US$ durante 20 años con objetivo de 12% de rendimiento anual.	25000.00	1000.00	12.00	20	{aggressive,growth,high-risk}	t	t	system	0	2025-06-23 11:09:43.796399+00	2025-08-18 13:54:42.059898+00	'/mes':8 '1000':6,22 '12':30 '20':25 '25.000':4,17 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'jubilación':3 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
e454ece7-a14b-411a-8597-6d554785a0ba	retirement-50k-2k-6-30	es	Plan de jubilación: 50.000 US$ + 2000 US$/mes	Explora la estrategia de inversión: inversión inicial de 50.000 US$, contribuciones mensuales de 2000 US$ durante 30 años con objetivo de 6% de rendimiento anual.	50000.00	2000.00	6.00	30	{retirement,long-term,conservative}	t	t	system	0	2025-06-23 11:09:43.796399+00	2025-08-18 13:54:42.059898+00	'/mes':8 '2000':6,22 '30':25 '50.000':4,17 '6':30 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'jubilación':3 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
903265fb-bd21-4fc3-9d03-946cf52e7441	house-5k-1500-5-7	pl	Wkład własny na dom: 5000 USD + 1500 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 5000 USD, miesięczne składki 1500 USD przez 7 lat z celem 5% rocznego zwrotu.	5000.00	1500.00	5.00	7	{house,down-payment,savings,conservative}	t	t	system	0	2025-06-23 11:09:43.66124+00	2025-08-18 13:54:42.059898+00	'1500':7,18 '5':25 '5000':5,14 '7':21 'celem':24 'dom':4 'inwestycja':12 'inwestycyjną':11 'lat':22 'miesięczne':16 'na':3 'początkowa':13 'poznaj':9 'przez':20 'rocznego':26 'składki':17 'strategię':10 'usd':6,15,19 'usd/mies':8 'wkład':1 'własny':2 'z':23 'zwrotu':27
a48892d7-86b4-4c7f-82ea-5b0c699b57db	wealth-100k-5k-10-25	pl	Planowanie emerytalne: 100 000 USD + 5000 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 100 000 USD, miesięczne składki 5000 USD przez 25 lat z celem 10% rocznego zwrotu.	100000.00	5000.00	10.00	25	{wealth,high-value,aggressive}	t	t	system	0	2025-06-23 11:09:43.66124+00	2025-08-18 13:54:42.059898+00	'000':4,14 '10':25 '100':3,13 '25':21 '5000':6,18 'celem':24 'emerytalne':2 'inwestycja':11 'inwestycyjną':10 'lat':22 'miesięczne':16 'planowanie':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
d9b6d846-a013-4c98-a4c7-b3c5816a0af0	wealth-100k-5k-10-25	es	Plan de jubilación: 100.000 US$ + 5000 US$/mes	Explora la estrategia de inversión: inversión inicial de 100.000 US$, contribuciones mensuales de 5000 US$ durante 25 años con objetivo de 10% de rendimiento anual.	100000.00	5000.00	10.00	25	{wealth,high-value,aggressive}	t	t	system	0	2025-06-23 11:09:43.796399+00	2025-08-18 13:54:42.059898+00	'/mes':8 '10':30 '100.000':4,17 '25':25 '5000':6,22 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'jubilación':3 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
ac1e8f1b-b9b8-4813-92d8-bd5102991068	invest-25000-monthly-1000-8percent-25years-retirement	en	Retirement Planning: $25,000 + $1,000/month	Explore the investment strategy: $25,000 initial investment, $1,000 monthly contributions over 25 years targeting 8% annual return.	25000.00	1000.00	8.00	25	{retirement}	f	t	system	1	2025-07-03 14:05:19.723349+00	2025-08-18 13:54:42.059898+00	'000':4,12,16 '000/month':6 '1':5,15 '25':3,11,20 '8':23 'annual':24 'contributions':18 'explore':7 'initial':13 'investment':9,14 'monthly':17 'over':19 'planning':2 'retirement':1 'return':25 'strategy':10 'targeting':22 'the':8 'years':21
8b0349ce-4b0a-461e-a267-cdd248e71bc9	invest-3000-monthly-400-7percent-20years-education	en	Starter Investment: $3,000 + $400/month	Explore the investment strategy: $3,000 initial investment, $400 monthly contributions over 20 years targeting 7% annual return.	3000.00	400.00	7.00	20	{education}	f	t	system	0	2025-07-08 13:16:42.377113+00	2025-08-18 13:54:42.059898+00	'000':4,11 '20':18 '3':3,10 '400':14 '400/month':5 '7':21 'annual':22 'contributions':16 'explore':6 'initial':12 'investment':2,8,13 'monthly':15 'over':17 'return':23 'starter':1 'strategy':9 'targeting':20 'the':7 'years':19
47fc3553-1244-44cc-b195-5d4754dcd939	invest-100000-monthly-5000-10percent-25years-retirement	en	Retirement Planning: $100,000 + $5,000/month	Explore the investment strategy: $100,000 initial investment, $5,000 monthly contributions over 25 years targeting 10% annual return.	100000.00	5000.00	10.00	25	{retirement}	f	t	system	0	2025-07-31 10:48:16.475877+00	2025-08-18 13:54:42.059898+00	'000':4,12,16 '000/month':6 '10':23 '100':3,11 '25':20 '5':5,15 'annual':24 'contributions':18 'explore':7 'initial':13 'investment':9,14 'monthly':17 'over':19 'planning':2 'retirement':1 'return':25 'strategy':10 'targeting':22 'the':8 'years':21
5027bfd8-c2d0-4992-9c37-0b0a95d22e9b	invest-80000-monthly-500-7percent-10years-house	en	Investment Plan: $80,000 + $500/month	Calculate investing $80,000 initially with $500 monthly contributions at 7% annual return over 10 years.	80000.00	500.00	7.00	10	{house}	f	t	system	0	2025-07-08 14:14:42.415505+00	2025-08-18 13:54:42.059898+00	'000':4,9 '10':20 '500':12 '500/month':5 '7':16 '80':3,8 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
29115729-d6e6-4ca9-bd58-2773b970229e	invest-10000-monthly-500-7percent-10years-house	en	House Down Payment: $10,000 + $500/month	Explore the investment strategy: $10,000 initial investment, $500 monthly contributions over 10 years targeting 7% annual return.	10000.00	500.00	7.00	10	{house}	f	t	system	0	2025-07-08 14:19:01.814924+00	2025-08-18 13:54:42.059898+00	'000':5,12 '10':4,11,19 '500':15 '500/month':6 '7':22 'annual':23 'contributions':17 'down':2 'explore':7 'house':1 'initial':13 'investment':9,14 'monthly':16 'over':18 'payment':3 'return':24 'strategy':10 'targeting':21 'the':8 'years':20
44b0b7a4-907d-41c6-ad7b-cd8542cf1b2d	invest-25000-monthly-1000-12percent-20years-retirement	en	Investment Plan: $25,000 + $1000/month	Calculate investing $25,000 initially with $1000 monthly contributions at 12% annual return over 20 years.	25000.00	1000.00	12.00	20	{retirement}	f	t	system	0	2025-08-05 13:59:59.991086+00	2025-08-18 13:54:42.059898+00	'000':4,9 '1000':12 '1000/month':5 '12':16 '20':20 '25':3,8 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
634ebe68-afe3-40da-a63b-400cde367cfc	invest-1000-monthly-200-0percent-1years-emergency	en	Investment Plan: $1,000 + $200/month	Calculate investing $1,000 initially with $200 monthly contributions at 0% annual return over 1 years.	1000.00	200.00	0.00	1	{emergency}	f	t	system	0	2025-07-23 18:58:46.041346+00	2025-08-18 13:54:42.059898+00	'0':16 '000':4,9 '1':3,8,20 '200':12 '200/month':5 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
bcab6851-89b5-43e0-b35a-320c8314cbd6	invest-10000-monthly-900-12percent-20years-investment	en	Investment Plan: $10,000 + $900/month	Calculate investing $10,000 initially with $900 monthly contributions at 12% annual return over 20 years.	10000.00	900.00	12.00	20	{investment}	f	t	system	0	2025-07-09 10:37:18.351333+00	2025-08-18 13:54:42.059898+00	'000':4,9 '10':3,8 '12':16 '20':20 '900':12 '900/month':5 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
9a33017c-cede-4506-9e25-a7671ae77842	invest-50000-monthly-500-7percent-10years-house	en	Investment Plan: $50,000 + $500/month	Calculate investing $50,000 initially with $500 monthly contributions at 7% annual return over 10 years.	50000.00	500.00	7.00	10	{house}	f	t	system	0	2025-07-09 14:03:17.989998+00	2025-08-18 13:54:42.059898+00	'000':4,9 '10':20 '50':3,8 '500':12 '500/month':5 '7':16 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
b6bd5d80-da93-4cfe-bdc0-e19b5a8d0120	invest-1000-monthly-200-4percent-5years-emergency	en	Investment Plan: $1,000 + $200/month	Calculate investing $1,000 initially with $200 monthly contributions at 4% annual return over 5 years.	1000.00	200.00	4.00	5	{emergency}	f	t	system	0	2025-07-28 01:49:58.757886+00	2025-08-18 13:54:42.059898+00	'000':4,9 '1':3,8 '200':12 '200/month':5 '4':16 '5':20 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
65a8be96-de4e-43b9-8a2d-f800a0a9a61f	invest-50000-monthly-2000-6percent-30years-retirement	en	Investment Plan: $50,000 + $2000/month	Calculate investing $50,000 initially with $2000 monthly contributions at 6% annual return over 30 years.	50000.00	2000.00	6.00	30	{retirement}	f	t	system	0	2025-07-15 11:43:11.892018+00	2025-08-18 13:54:42.059898+00	'000':4,9 '2000':12 '2000/month':5 '30':20 '50':3,8 '6':16 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
1838620a-6bcd-4bc0-b036-ffca285801e4	invest-1000-monthly-200-0percent-1years-emergency	es	Fondo de emergencia: 1000 US$ + 200 US$/mes	Explora la estrategia de inversión: inversión inicial de 1000 US$, contribuciones mensuales de 200 US$ durante 1 años con objetivo de 0% de rendimiento anual.	1000.00	200.00	0.00	1	{emergency}	f	t	system	0	2025-07-30 13:54:49.108549+00	2025-08-18 13:54:42.059898+00	'/mes':8 '0':30 '1':25 '1000':4,17 '200':6,22 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'emergencia':3 'estrategia':11 'explora':9 'fondo':1 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'rendimiento':32 'us':5,7,18,23
5298eb4e-3f34-4df5-8624-3ce518eabb2e	invest-100000-monthly-5000-10percent-25years-retirement	es	Plan de jubilación: 100.000 US$ + 5000 US$/mes	Explora la estrategia de inversión: inversión inicial de 100.000 US$, contribuciones mensuales de 5000 US$ durante 25 años con objetivo de 10% de rendimiento anual.	100000.00	5000.00	10.00	25	{retirement}	f	t	system	0	2025-08-11 10:25:33.420844+00	2025-08-18 13:54:42.059898+00	'/mes':8 '10':30 '100.000':4,17 '25':25 '5000':6,22 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'jubilación':3 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
c173e9d4-5b9d-4315-bc82-f96ef8cf3a3d	invest-25000-monthly-1000-12percent-20years-retirement	es	Plan de jubilación: 25.000 US$ + 1000 US$/mes	Explora la estrategia de inversión: inversión inicial de 25.000 US$, contribuciones mensuales de 1000 US$ durante 20 años con objetivo de 12% de rendimiento anual.	25000.00	1000.00	12.00	20	{retirement}	f	t	system	0	2025-08-11 10:25:29.448215+00	2025-08-18 13:54:42.059898+00	'/mes':8 '1000':6,22 '12':30 '20':25 '25.000':4,17 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'jubilación':3 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
eda78048-45d5-408f-87b8-28de42d63529	invest-1000-monthly-200-0percent-1years-emergency	pl	Fundusz awaryjny: 1000 USD + 200 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 1000 USD, miesięczne składki 200 USD przez 1 lat z celem 0% rocznego zwrotu.	1000.00	200.00	0.00	1	{emergency}	f	t	system	0	2025-07-30 13:54:43.510164+00	2025-08-18 13:54:42.059898+00	'0':23 '1':19 '1000':3,12 '200':5,16 'awaryjny':2 'celem':22 'fundusz':1 'inwestycja':10 'inwestycyjną':9 'lat':20 'miesięczne':14 'początkowa':11 'poznaj':7 'przez':18 'rocznego':24 'składki':15 'strategię':8 'usd':4,13,17 'usd/mies':6 'z':21 'zwrotu':25
bc8d2b60-a5f9-4cbb-ac44-650e2922cbd0	invest-1000-monthly-200-4percent-5years-emergency	pl	Fundusz awaryjny: 1000 USD + 200 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 1000 USD, miesięczne składki 200 USD przez 5 lat z celem 4% rocznego zwrotu.	1000.00	200.00	4.00	5	{emergency}	f	t	system	0	2025-08-11 10:25:39.420678+00	2025-08-18 13:54:42.059898+00	'1000':3,12 '200':5,16 '4':23 '5':19 'awaryjny':2 'celem':22 'fundusz':1 'inwestycja':10 'inwestycyjną':9 'lat':20 'miesięczne':14 'początkowa':11 'poznaj':7 'przez':18 'rocznego':24 'składki':15 'strategię':8 'usd':4,13,17 'usd/mies':6 'z':21 'zwrotu':25
fd508dd3-8dbd-42b4-bf48-7d921d76c163	invest-19000-monthly-800-7percent-10years-house	en	House Down Payment: $19,000 + $800/month	Explore the investment strategy: $19,000 initial investment, $800 monthly contributions over 10 years targeting 7% annual return.	19000.00	800.00	7.00	10	{house}	f	t	system	0	2025-07-09 09:17:34.639429+00	2025-08-18 13:54:42.059898+00	'000':5,12 '10':19 '19':4,11 '7':22 '800':15 '800/month':6 'annual':23 'contributions':17 'down':2 'explore':7 'house':1 'initial':13 'investment':9,14 'monthly':16 'over':18 'payment':3 'return':24 'strategy':10 'targeting':21 'the':8 'years':20
ba15ab5b-dc75-4cd6-87e2-74ac3b7a1635	invest-50000-monthly-2000-6percent-30years-retirement	pl	Planowanie emerytalne: 50 000 USD + 2000 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 50 000 USD, miesięczne składki 2000 USD przez 30 lat z celem 6% rocznego zwrotu.	50000.00	2000.00	6.00	30	{retirement}	f	t	system	0	2025-08-11 10:25:41.457998+00	2025-08-18 13:54:42.059898+00	'000':4,14 '2000':6,18 '30':21 '50':3,13 '6':25 'celem':24 'emerytalne':2 'inwestycja':11 'inwestycyjną':10 'lat':22 'miesięczne':16 'planowanie':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
5c9771ff-83a0-4c74-aeaf-61a6101b8afe	invest-50000-monthly-2000-6percent-30years-retirement	es	Plan de jubilación: 50.000 US$ + 2000 US$/mes	Explora la estrategia de inversión: inversión inicial de 50.000 US$, contribuciones mensuales de 2000 US$ durante 30 años con objetivo de 6% de rendimiento anual.	50000.00	2000.00	6.00	30	{retirement}	f	t	system	0	2025-08-11 10:25:43.427141+00	2025-08-18 13:54:42.059898+00	'/mes':8 '2000':6,22 '30':25 '50.000':4,17 '6':30 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'jubilación':3 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
0edfad8e-0397-49b8-9973-39108b2314fb	invest-25000-monthly-1000-12percent-20years-retirement	pl	Planowanie emerytalne: 25 000 USD + 1000 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 25 000 USD, miesięczne składki 1000 USD przez 20 lat z celem 12% rocznego zwrotu.	25000.00	1000.00	12.00	20	{retirement}	f	t	system	0	2025-08-11 10:25:31.847001+00	2025-08-18 13:54:42.059898+00	'000':4,14 '1000':6,18 '12':25 '20':21 '25':3,13 'celem':24 'emerytalne':2 'inwestycja':11 'inwestycyjną':10 'lat':22 'miesięczne':16 'planowanie':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
79ef396d-70b3-40d2-8e18-6e84efdafec8	invest-3000-monthly-400-7percent-20years-education	es	Inversión inicial: 3000 US$ + 400 US$/mes	Explora la estrategia de inversión: inversión inicial de 3000 US$, contribuciones mensuales de 400 US$ durante 20 años con objetivo de 7% de rendimiento anual.	3000.00	400.00	7.00	20	{education}	f	t	system	0	2025-08-11 10:25:57.43331+00	2025-08-18 13:54:42.059898+00	'/mes':7 '20':24 '3000':3,16 '400':5,21 '7':29 'anual':32 'años':25 'con':26 'contribuciones':18 'de':11,15,20,28,30 'durante':23 'estrategia':10 'explora':8 'inicial':2,14 'inversión':1,12,13 'la':9 'mensuales':19 'objetivo':27 'rendimiento':31 'us':4,6,17,22
f5022f03-c4cb-444a-831b-69311e5a5d11	invest-19000-monthly-800-7percent-10years-house	pl	Wkład własny na dom: 19 000 USD + 800 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 19 000 USD, miesięczne składki 800 USD przez 10 lat z celem 7% rocznego zwrotu.	19000.00	800.00	7.00	10	{house}	f	t	system	0	2025-08-11 10:25:53.408301+00	2025-08-18 13:54:42.059898+00	'000':6,16 '10':23 '19':5,15 '7':27 '800':8,20 'celem':26 'dom':4 'inwestycja':13 'inwestycyjną':12 'lat':24 'miesięczne':18 'na':3 'początkowa':14 'poznaj':10 'przez':22 'rocznego':28 'składki':19 'strategię':11 'usd':7,17,21 'usd/mies':9 'wkład':1 'własny':2 'z':25 'zwrotu':29
970ef24b-e37e-4974-bd54-5fd69d585906	invest-80000-monthly-500-7percent-10years-house	es	Entrada para vivienda: 80.000 US$ + 500 US$/mes	Explora la estrategia de inversión: inversión inicial de 80.000 US$, contribuciones mensuales de 500 US$ durante 10 años con objetivo de 7% de rendimiento anual.	80000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 10:26:03.428869+00	2025-08-18 13:54:42.059898+00	'/mes':8 '10':25 '500':6,22 '7':30 '80.000':4,17 'anual':33 'años':26 'con':27 'contribuciones':19 'de':12,16,21,29,31 'durante':24 'entrada':1 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'para':2 'rendimiento':32 'us':5,7,18,23 'vivienda':3
da8aeaff-627d-4fa9-8eae-f6c00508fdd1	invest-10000-monthly-900-12percent-20years-investment	pl	Plan inwestycyjny: 10 000 USD + 900 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 10 000 USD, miesięczne składki 900 USD przez 20 lat z celem 12% rocznego zwrotu.	10000.00	900.00	12.00	20	{investment}	f	t	system	0	2025-08-11 10:25:53.331591+00	2025-08-18 13:54:42.059898+00	'000':4,14 '10':3,13 '12':25 '20':21 '900':6,18 'celem':24 'inwestycja':11 'inwestycyjny':2 'inwestycyjną':10 'lat':22 'miesięczne':16 'plan':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
bd53a595-64d7-4749-8bdb-474fe3bd0084	invest-10000-monthly-900-12percent-20years-investment	es	Plan de inversión: 10.000 US$ + 900 US$/mes	Explora la estrategia de inversión: inversión inicial de 10.000 US$, contribuciones mensuales de 900 US$ durante 20 años con objetivo de 12% de rendimiento anual.	10000.00	900.00	12.00	20	{investment}	f	t	system	0	2025-08-11 10:25:51.399215+00	2025-08-18 13:54:42.059898+00	'/mes':8 '10.000':4,17 '12':30 '20':25 '900':6,22 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':3,13,14 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
60bb5ce9-5ba6-4824-bfd1-92a7f9b05020	invest-11000-monthly-550-11percent-50years-investment	es	Plan de inversión: 11.000 US$ + 550 US$/mes	Explora la estrategia de inversión: inversión inicial de 11.000 US$, contribuciones mensuales de 550 US$ durante 50 años con objetivo de 11% de rendimiento anual.	11000.00	550.00	11.00	50	{investment}	f	t	system	0	2025-08-11 10:26:21.444035+00	2025-08-18 13:54:42.059898+00	'/mes':8 '11':30 '11.000':4,17 '50':25 '550':6,22 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':3,13,14 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
c9d65e0f-95cd-45cf-af30-440e183a8bb3	invest-19000-monthly-800-7percent-10years-house	es	Entrada para vivienda: 19.000 US$ + 800 US$/mes	Explora la estrategia de inversión: inversión inicial de 19.000 US$, contribuciones mensuales de 800 US$ durante 10 años con objetivo de 7% de rendimiento anual.	19000.00	800.00	7.00	10	{house}	f	t	system	0	2025-08-11 10:25:55.459521+00	2025-08-18 13:54:42.059898+00	'/mes':8 '10':25 '19.000':4,17 '7':30 '800':6,22 'anual':33 'años':26 'con':27 'contribuciones':19 'de':12,16,21,29,31 'durante':24 'entrada':1 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'para':2 'rendimiento':32 'us':5,7,18,23 'vivienda':3
4b4b3ad8-fbaa-47cb-a1dc-5d5ce68168a2	invest-1880000-monthly-500-7percent-10years-house	pl	Wkład własny na dom: 1 880 000 USD + 500 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 1 880 000 USD, miesięczne składki 500 USD przez 10 lat z celem 7% rocznego zwrotu.	1880000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 13:08:39.318535+00	2025-08-18 13:54:42.059898+00	'000':7,18 '1':5,16 '10':25 '500':9,22 '7':29 '880':6,17 'celem':28 'dom':4 'inwestycja':14 'inwestycyjną':13 'lat':26 'miesięczne':20 'na':3 'początkowa':15 'poznaj':11 'przez':24 'rocznego':30 'składki':21 'strategię':12 'usd':8,19,23 'usd/mies':10 'wkład':1 'własny':2 'z':27 'zwrotu':31
948cb707-f1c1-43dc-89ef-a81baf708acb	retirement-50k-2k-6-30	pl	Planowanie emerytalne: 50 000 USD + 2000 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 50 000 USD, miesięczne składki 2000 USD przez 30 lat z celem 6% rocznego zwrotu.	50000.00	2000.00	6.00	30	{retirement,long-term,conservative}	t	t	system	0	2025-06-23 11:09:43.66124+00	2025-08-18 13:54:42.059898+00	'000':4,14 '2000':6,18 '30':21 '50':3,13 '6':25 'celem':24 'emerytalne':2 'inwestycja':11 'inwestycyjną':10 'lat':22 'miesięczne':16 'planowanie':1 'początkowa':12 'poznaj':8 'przez':20 'rocznego':26 'składki':17 'strategię':9 'usd':5,15,19 'usd/mies':7 'z':23 'zwrotu':27
18bd0266-7d63-4dc5-9d4c-b4b94c46ec34	house-5k-1500-5-7	es	Entrada para vivienda: 5000 US$ + 1500 US$/mes	Explora la estrategia de inversión: inversión inicial de 5000 US$, contribuciones mensuales de 1500 US$ durante 7 años con objetivo de 5% de rendimiento anual.	5000.00	1500.00	5.00	7	{house,down-payment,savings,conservative}	t	t	system	0	2025-06-23 11:09:43.796399+00	2025-08-18 13:54:42.059898+00	'/mes':8 '1500':6,22 '5':30 '5000':4,17 '7':25 'anual':33 'años':26 'con':27 'contribuciones':19 'de':12,16,21,29,31 'durante':24 'entrada':1 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'para':2 'rendimiento':32 'us':5,7,18,23 'vivienda':3
bd0ca670-e3dd-4322-9007-ad233dfa6bcd	invest-500-monthly-100-5percent-30years-starter	pl	Inwestycja startowa: 500 USD + 100 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 500 USD, miesięczne składki 100 USD przez 30 lat z celem 5% rocznego zwrotu.	500.00	100.00	5.00	30	{education}	f	t	system	0	2025-08-11 10:26:15.446137+00	2025-08-18 13:54:42.059898+00	'100':5,16 '30':19 '5':23 '500':3,12 'celem':22 'inwestycja':1,10 'inwestycyjną':9 'lat':20 'miesięczne':14 'początkowa':11 'poznaj':7 'przez':18 'rocznego':24 'składki':15 'startowa':2 'strategię':8 'usd':4,13,17 'usd/mies':6 'z':21 'zwrotu':25
76d7c6ec-5a55-46bf-b758-20efc7150385	invest-50000-monthly-500-7percent-10years-house	es	Investment Plan: $50,000 + $500/month	Calculate investing $50,000 initially with $500 monthly contributions at 7% annual return over 10 years.	50000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 10:25:45.438248+00	2025-08-18 13:54:42.059898+00	'000':4,9 '10':20 '50':3,8 '500':12 '500/month':5 '7':16 'annual':17 'at':15 'calculate':6 'contributions':14 'initially':10 'investing':7 'investment':1 'monthly':13 'over':19 'plan':2 'return':18 'with':11 'years':21
96ef7123-02f8-4d5d-8561-8cac17448978	invest-1000-monthly-200-4percent-5years-emergency	es	Fondo de emergencia: 1000 US$ + 200 US$/mes	Explora la estrategia de inversión: inversión inicial de 1000 US$, contribuciones mensuales de 200 US$ durante 5 años con objetivo de 4% de rendimiento anual.	1000.00	200.00	4.00	5	{emergency}	f	t	system	0	2025-08-11 10:25:37.391526+00	2025-08-18 13:54:42.059898+00	'/mes':8 '1000':4,17 '200':6,22 '4':30 '5':25 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'emergencia':3 'estrategia':11 'explora':9 'fondo':1 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'rendimiento':32 'us':5,7,18,23
fc60ee88-c9fc-4bbb-b5df-6fc3d0e0d3bb	invest-80000-monthly-500-7percent-10years-house	pl	Wkład własny na dom: 80 000 USD + 500 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 80 000 USD, miesięczne składki 500 USD przez 10 lat z celem 7% rocznego zwrotu.	80000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 10:26:01.435161+00	2025-08-18 13:54:42.059898+00	'000':6,16 '10':23 '500':8,20 '7':27 '80':5,15 'celem':26 'dom':4 'inwestycja':13 'inwestycyjną':12 'lat':24 'miesięczne':18 'na':3 'początkowa':14 'poznaj':10 'przez':22 'rocznego':28 'składki':19 'strategię':11 'usd':7,17,21 'usd/mies':9 'wkład':1 'własny':2 'z':25 'zwrotu':29
27316ad4-f6b6-4b61-ad49-19f989b30732	emergency-1k-200-4-5	pl	Fundusz awaryjny: 1000 USD + 200 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 1000 USD, miesięczne składki 200 USD przez 5 lat z celem 4% rocznego zwrotu.	1000.00	200.00	4.00	5	{emergency,safety,conservative}	t	t	system	0	2025-06-23 11:09:43.66124+00	2025-08-18 13:54:42.059898+00	'1000':3,12 '200':5,16 '4':23 '5':19 'awaryjny':2 'celem':22 'fundusz':1 'inwestycja':10 'inwestycyjną':9 'lat':20 'miesięczne':14 'początkowa':11 'poznaj':7 'przez':18 'rocznego':24 'składki':15 'strategię':8 'usd':4,13,17 'usd/mies':6 'z':21 'zwrotu':25
c035aaac-2b56-463a-959e-9d4442b2be62	young-5k-300-8-15	es	Inversión inicial: 5000 US$ + 300 US$/mes	Explora la estrategia de inversión: inversión inicial de 5000 US$, contribuciones mensuales de 300 US$ durante 15 años con objetivo de 8% de rendimiento anual.	5000.00	300.00	8.00	15	{young,early-start,moderate}	t	t	system	0	2025-06-23 11:09:43.796399+00	2025-08-18 13:54:42.059898+00	'/mes':7 '15':24 '300':5,21 '5000':3,16 '8':29 'anual':32 'años':25 'con':26 'contribuciones':18 'de':11,15,20,28,30 'durante':23 'estrategia':10 'explora':8 'inicial':2,14 'inversión':1,12,13 'la':9 'mensuales':19 'objetivo':27 'rendimiento':31 'us':4,6,17,22
3b1f1e26-f9be-42b7-9e79-d2254922d454	invest-10000-monthly-500-7percent-10years-house	pl	Wkład własny na dom: 10 000 USD + 500 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 10 000 USD, miesięczne składki 500 USD przez 10 lat z celem 7% rocznego zwrotu.	10000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 09:33:34.535308+00	2025-08-18 13:54:42.059898+00	'000':6,16 '10':5,15,23 '500':8,20 '7':27 'celem':26 'dom':4 'inwestycja':13 'inwestycyjną':12 'lat':24 'miesięczne':18 'na':3 'początkowa':14 'poznaj':10 'przez':22 'rocznego':28 'składki':19 'strategię':11 'usd':7,17,21 'usd/mies':9 'wkład':1 'własny':2 'z':25 'zwrotu':29
c6b002bb-585e-46ae-91bd-ec48fcde804e	invest-25000-monthly-1000-8percent-25years-retirement	es	Plan de jubilación: 25.000 US$ + 1000 US$/mes	Explora la estrategia de inversión: inversión inicial de 25.000 US$, contribuciones mensuales de 1000 US$ durante 25 años con objetivo de 8% de rendimiento anual.	25000.00	1000.00	8.00	25	{retirement}	f	t	system	0	2025-08-11 10:26:19.469908+00	2025-08-18 13:54:42.059898+00	'/mes':8 '1000':6,22 '25':25 '25.000':4,17 '8':30 'anual':33 'años':26 'con':27 'contribuciones':19 'de':2,12,16,21,29,31 'durante':24 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'jubilación':3 'la':10 'mensuales':20 'objetivo':28 'plan':1 'rendimiento':32 'us':5,7,18,23
9a4ffed7-80d1-4170-8e01-4fc66cb6e67d	invest-1880000-monthly-500-7percent-10years-house	es	Entrada para vivienda: 1.880.000 US$ + 500 US$/mes	Explora la estrategia de inversión: inversión inicial de 1.880.000 US$, contribuciones mensuales de 500 US$ durante 10 años con objetivo de 7% de rendimiento anual.	1880000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 13:08:39.346422+00	2025-08-18 13:54:42.059898+00	'/mes':8 '1.880.000':4,17 '10':25 '500':6,22 '7':30 'anual':33 'años':26 'con':27 'contribuciones':19 'de':12,16,21,29,31 'durante':24 'entrada':1 'estrategia':11 'explora':9 'inicial':15 'inversión':13,14 'la':10 'mensuales':20 'objetivo':28 'para':2 'rendimiento':32 'us':5,7,18,23 'vivienda':3
32cca570-6dd1-4cf8-b1c2-b4d96289775e	invest-2000-monthly-300-6percent-15years-retirement	es	Inversión inicial: 2000 US$ + 300 US$/mes	Explora la estrategia de inversión: inversión inicial de 2000 US$, contribuciones mensuales de 300 US$ durante 15 años con objetivo de 6% de rendimiento anual.	2000.00	300.00	6.00	15	{retirement}	f	t	system	0	2025-08-11 10:26:08.405789+00	2025-08-18 13:54:42.059898+00	'/mes':7 '15':24 '2000':3,16 '300':5,21 '6':29 'anual':32 'años':25 'con':26 'contribuciones':18 'de':11,15,20,28,30 'durante':23 'estrategia':10 'explora':8 'inicial':2,14 'inversión':1,12,13 'la':9 'mensuales':19 'objetivo':27 'rendimiento':31 'us':4,6,17,22
9af60398-2141-421f-bc74-6ddcdd7d077e	invest-11000-monthly-550-11percent-50years-investment	en	Investment Plan: $11,000 + $550/month	Explore the investment strategy: $11,000 initial investment, $550 monthly contributions over 50 years targeting 11% annual return.	11000.00	550.00	11.00	50	{investment}	f	t	system	2	2025-07-03 14:04:39.629262+00	2025-08-18 13:54:42.059898+00	'000':4,11 '11':3,10,21 '50':18 '550':14 '550/month':5 'annual':22 'contributions':16 'explore':6 'initial':12 'investment':1,8,13 'monthly':15 'over':17 'plan':2 'return':23 'strategy':9 'targeting':20 'the':7 'years':19
ee296a30-8e80-41b7-bdcc-11b7675817bd	invest-2000-monthly-300-6percent-15years-retirement	pl	Inwestycja startowa: 2000 USD + 300 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 2000 USD, miesięczne składki 300 USD przez 15 lat z celem 6% rocznego zwrotu.	2000.00	300.00	6.00	15	{retirement}	f	t	system	0	2025-08-11 10:26:07.492129+00	2025-08-18 13:54:42.059898+00	'15':19 '2000':3,12 '300':5,16 '6':23 'celem':22 'inwestycja':1,10 'inwestycyjną':9 'lat':20 'miesięczne':14 'początkowa':11 'poznaj':7 'przez':18 'rocznego':24 'składki':15 'startowa':2 'strategię':8 'usd':4,13,17 'usd/mies':6 'z':21 'zwrotu':25
94f557bb-b1df-4533-8cf8-ef91df2983cb	invest-3000-monthly-400-7percent-20years-education	pl	Inwestycja startowa: 3000 USD + 400 USD/mies.	Poznaj strategię inwestycyjną: inwestycja początkowa 3000 USD, miesięczne składki 400 USD przez 20 lat z celem 7% rocznego zwrotu.	3000.00	400.00	7.00	20	{education}	f	t	system	0	2025-08-11 10:25:59.438473+00	2025-08-18 13:54:42.059898+00	'20':19 '3000':3,12 '400':5,16 '7':23 'celem':22 'inwestycja':1,10 'inwestycyjną':9 'lat':20 'miesięczne':14 'początkowa':11 'poznaj':7 'przez':18 'rocznego':24 'składki':15 'startowa':2 'strategię':8 'usd':4,13,17 'usd/mies':6 'z':21 'zwrotu':25
b2bbc0f8-70a3-4e27-ab52-ec7a26a1b0ea	invest-2000-monthly-300-6percent-15years-retirement	en	Starter Investment: $2,000 + $300/month	Explore the investment strategy: $2,000 initial investment, $300 monthly contributions over 15 years targeting 6% annual return.	2000.00	300.00	6.00	15	{retirement}	f	t	system	0	2025-07-08 13:08:52.74975+00	2025-08-18 13:54:42.059898+00	'000':4,11 '15':18 '2':3,10 '300':14 '300/month':5 '6':21 'annual':22 'contributions':16 'explore':6 'initial':12 'investment':2,8,13 'monthly':15 'over':17 'return':23 'starter':1 'strategy':9 'targeting':20 'the':7 'years':19
6bbb7456-0f4a-45d2-a333-8e725f3d5662	invest-1880000-monthly-500-7percent-10years-house	en	House Down Payment: $1,880,000 + $500/month	Explore the investment strategy: $1,880,000 initial investment, $500 monthly contributions over 10 years targeting 7% annual return.	1880000.00	500.00	7.00	10	{house}	f	t	system	0	2025-08-11 13:08:39.260352+00	2025-08-18 13:54:42.059898+00	'000':6,14 '1':4,12 '10':21 '500':17 '500/month':7 '7':24 '880':5,13 'annual':25 'contributions':19 'down':2 'explore':8 'house':1 'initial':15 'investment':10,16 'monthly':18 'over':20 'payment':3 'return':26 'strategy':11 'targeting':23 'the':9 'years':22
\.


--
-- Data for Name: scenario_category_counts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scenario_category_counts (locale, category, count, updated_at) FROM stdin;
en	growth	1	2025-08-20 08:58:33.724198
en	safety	1	2025-08-20 08:58:33.724198
en	emergency	3	2025-08-20 08:58:33.724198
en	conservative	4	2025-08-20 08:58:33.724198
en	beginner	1	2025-08-20 08:58:33.724198
en	early-start	1	2025-08-20 08:58:33.724198
en	aggressive	2	2025-08-20 08:58:33.724198
en	savings	1	2025-08-20 08:58:33.724198
en	down-payment	1	2025-08-20 08:58:33.724198
en	young	1	2025-08-20 08:58:33.724198
en	wealth	1	2025-08-20 08:58:33.724198
en	moderate	1	2025-08-20 08:58:33.724198
en	retirement	7	2025-08-20 08:58:33.724198
en	house	6	2025-08-20 08:58:33.724198
en	education	2	2025-08-20 08:58:33.724198
en	long-term	1	2025-08-20 08:58:33.724198
en	investment	3	2025-08-20 08:58:33.724198
en	starter	1	2025-08-20 08:58:33.724198
en	high-value	1	2025-08-20 08:58:33.724198
en	high-risk	1	2025-08-20 08:58:33.724198
pl	growth	1	2025-08-20 08:58:33.815122
pl	safety	1	2025-08-20 08:58:33.815122
pl	emergency	3	2025-08-20 08:58:33.815122
pl	conservative	4	2025-08-20 08:58:33.815122
pl	beginner	1	2025-08-20 08:58:33.815122
pl	aggressive	2	2025-08-20 08:58:33.815122
pl	early-start	1	2025-08-20 08:58:33.815122
pl	savings	1	2025-08-20 08:58:33.815122
pl	down-payment	1	2025-08-20 08:58:33.815122
pl	young	1	2025-08-20 08:58:33.815122
pl	wealth	1	2025-08-20 08:58:33.815122
pl	moderate	1	2025-08-20 08:58:33.815122
pl	retirement	7	2025-08-20 08:58:33.815122
pl	house	6	2025-08-20 08:58:33.815122
pl	education	2	2025-08-20 08:58:33.815122
pl	long-term	1	2025-08-20 08:58:33.815122
pl	investment	3	2025-08-20 08:58:33.815122
pl	starter	1	2025-08-20 08:58:33.815122
pl	high-value	1	2025-08-20 08:58:33.815122
pl	high-risk	1	2025-08-20 08:58:33.815122
es	growth	1	2025-08-20 08:58:33.899756
es	safety	1	2025-08-20 08:58:33.899756
es	emergency	3	2025-08-20 08:58:33.899756
es	conservative	4	2025-08-20 08:58:33.899756
es	beginner	1	2025-08-20 08:58:33.899756
es	early-start	1	2025-08-20 08:58:33.899756
es	aggressive	2	2025-08-20 08:58:33.899756
es	savings	1	2025-08-20 08:58:33.899756
es	down-payment	1	2025-08-20 08:58:33.899756
es	young	1	2025-08-20 08:58:33.899756
es	moderate	1	2025-08-20 08:58:33.899756
es	wealth	1	2025-08-20 08:58:33.899756
es	retirement	7	2025-08-20 08:58:33.899756
es	house	6	2025-08-20 08:58:33.899756
es	education	1	2025-08-20 08:58:33.899756
es	long-term	1	2025-08-20 08:58:33.899756
es	investment	3	2025-08-20 08:58:33.899756
es	starter	2	2025-08-20 08:58:33.899756
es	high-value	1	2025-08-20 08:58:33.899756
es	high-risk	1	2025-08-20 08:58:33.899756
\.


--
-- Data for Name: scenario_trending_snapshot; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scenario_trending_snapshot (locale, slug, rank, view_count, updated_at) FROM stdin;
en	invest-11000-monthly-550-11percent-50years-investment	1	2	2025-08-20 08:58:33.461731
en	invest-25000-monthly-1000-8percent-25years-retirement	2	1	2025-08-20 08:58:33.461731
en	retirement-50k-2k-6-30	3	0	2025-08-20 08:58:33.461731
en	invest-34600-monthly-550-7percent-27years-investment	4	0	2025-08-20 08:58:33.461731
en	starter-10k-500-7-10	5	0	2025-08-20 08:58:33.461731
en	aggressive-25k-1k-12-20	6	0	2025-08-20 08:58:33.461731
en	young-5k-300-8-15	7	0	2025-08-20 08:58:33.461731
en	wealth-100k-5k-10-25	8	0	2025-08-20 08:58:33.461731
en	emergency-1k-200-4-5	9	0	2025-08-20 08:58:33.461731
en	house-5k-1500-5-7	10	0	2025-08-20 08:58:33.461731
en	invest-500-monthly-100-5percent-30years-starter	11	0	2025-08-20 08:58:33.461731
en	invest-2000-monthly-1000-8percent-15years-retirement	12	0	2025-08-20 08:58:33.461731
en	invest-3000-monthly-400-7percent-20years-education	13	0	2025-08-20 08:58:33.461731
en	invest-100000-monthly-5000-10percent-25years-retirement	14	0	2025-08-20 08:58:33.461731
en	invest-80000-monthly-500-7percent-10years-house	15	0	2025-08-20 08:58:33.461731
en	invest-10000-monthly-500-7percent-10years-house	16	0	2025-08-20 08:58:33.461731
en	invest-25000-monthly-1000-12percent-20years-retirement	17	0	2025-08-20 08:58:33.461731
en	invest-1000-monthly-200-0percent-1years-emergency	18	0	2025-08-20 08:58:33.461731
en	invest-10000-monthly-900-12percent-20years-investment	19	0	2025-08-20 08:58:33.461731
en	invest-50000-monthly-500-7percent-10years-house	20	0	2025-08-20 08:58:33.461731
en	invest-1000-monthly-200-4percent-5years-emergency	21	0	2025-08-20 08:58:33.461731
en	invest-50000-monthly-2000-6percent-30years-retirement	22	0	2025-08-20 08:58:33.461731
en	invest-19000-monthly-800-7percent-10years-house	23	0	2025-08-20 08:58:33.461731
en	invest-2000-monthly-300-6percent-15years-retirement	24	0	2025-08-20 08:58:33.461731
en	invest-1880000-monthly-500-7percent-10years-house	25	0	2025-08-20 08:58:33.461731
en	invest-11000-monthly-550-11percent-50years-investment	1	2	2025-08-20 08:58:33.547065
en	invest-25000-monthly-1000-8percent-25years-retirement	2	1	2025-08-20 08:58:33.547065
en	retirement-50k-2k-6-30	3	0	2025-08-20 08:58:33.547065
en	invest-34600-monthly-550-7percent-27years-investment	4	0	2025-08-20 08:58:33.547065
en	starter-10k-500-7-10	5	0	2025-08-20 08:58:33.547065
en	aggressive-25k-1k-12-20	6	0	2025-08-20 08:58:33.547065
en	young-5k-300-8-15	7	0	2025-08-20 08:58:33.547065
en	wealth-100k-5k-10-25	8	0	2025-08-20 08:58:33.547065
en	emergency-1k-200-4-5	9	0	2025-08-20 08:58:33.547065
en	house-5k-1500-5-7	10	0	2025-08-20 08:58:33.547065
en	invest-500-monthly-100-5percent-30years-starter	11	0	2025-08-20 08:58:33.547065
en	invest-2000-monthly-1000-8percent-15years-retirement	12	0	2025-08-20 08:58:33.547065
en	invest-3000-monthly-400-7percent-20years-education	13	0	2025-08-20 08:58:33.547065
en	invest-100000-monthly-5000-10percent-25years-retirement	14	0	2025-08-20 08:58:33.547065
en	invest-80000-monthly-500-7percent-10years-house	15	0	2025-08-20 08:58:33.547065
en	invest-10000-monthly-500-7percent-10years-house	16	0	2025-08-20 08:58:33.547065
en	invest-25000-monthly-1000-12percent-20years-retirement	17	0	2025-08-20 08:58:33.547065
en	invest-1000-monthly-200-0percent-1years-emergency	18	0	2025-08-20 08:58:33.547065
en	invest-10000-monthly-900-12percent-20years-investment	19	0	2025-08-20 08:58:33.547065
en	invest-50000-monthly-500-7percent-10years-house	20	0	2025-08-20 08:58:33.547065
en	invest-1000-monthly-200-4percent-5years-emergency	21	0	2025-08-20 08:58:33.547065
en	invest-50000-monthly-2000-6percent-30years-retirement	22	0	2025-08-20 08:58:33.547065
en	invest-19000-monthly-800-7percent-10years-house	23	0	2025-08-20 08:58:33.547065
en	invest-2000-monthly-300-6percent-15years-retirement	24	0	2025-08-20 08:58:33.547065
en	invest-1880000-monthly-500-7percent-10years-house	25	0	2025-08-20 08:58:33.547065
pl	aggressive-25k-1k-12-20	1	0	2025-08-20 08:58:33.547065
pl	invest-19000-monthly-800-7percent-10years-house	2	0	2025-08-20 08:58:33.547065
pl	house-5k-1500-5-7	3	0	2025-08-20 08:58:33.547065
pl	wealth-100k-5k-10-25	4	0	2025-08-20 08:58:33.547065
pl	starter-10k-500-7-10	5	0	2025-08-20 08:58:33.547065
pl	invest-10000-monthly-900-12percent-20years-investment	6	0	2025-08-20 08:58:33.547065
pl	invest-1880000-monthly-500-7percent-10years-house	7	0	2025-08-20 08:58:33.547065
pl	invest-80000-monthly-500-7percent-10years-house	8	0	2025-08-20 08:58:33.547065
pl	emergency-1k-200-4-5	9	0	2025-08-20 08:58:33.547065
pl	invest-100000-monthly-5000-10percent-25years-retirement	10	0	2025-08-20 08:58:33.547065
pl	invest-10000-monthly-500-7percent-10years-house	11	0	2025-08-20 08:58:33.547065
pl	retirement-50k-2k-6-30	12	0	2025-08-20 08:58:33.547065
pl	invest-25000-monthly-1000-8percent-25years-retirement	13	0	2025-08-20 08:58:33.547065
pl	invest-50000-monthly-500-7percent-10years-house	14	0	2025-08-20 08:58:33.547065
pl	invest-34600-monthly-550-7percent-27years-investment	15	0	2025-08-20 08:58:33.547065
pl	invest-2000-monthly-300-6percent-15years-retirement	16	0	2025-08-20 08:58:33.547065
pl	invest-11000-monthly-550-11percent-50years-investment	17	0	2025-08-20 08:58:33.547065
pl	invest-2000-monthly-1000-8percent-15years-retirement	18	0	2025-08-20 08:58:33.547065
pl	young-5k-300-8-15	19	0	2025-08-20 08:58:33.547065
pl	invest-1000-monthly-200-0percent-1years-emergency	20	0	2025-08-20 08:58:33.547065
pl	invest-1000-monthly-200-4percent-5years-emergency	21	0	2025-08-20 08:58:33.547065
pl	invest-3000-monthly-400-7percent-20years-education	22	0	2025-08-20 08:58:33.547065
pl	invest-50000-monthly-2000-6percent-30years-retirement	23	0	2025-08-20 08:58:33.547065
pl	invest-500-monthly-100-5percent-30years-starter	24	0	2025-08-20 08:58:33.547065
pl	invest-25000-monthly-1000-12percent-20years-retirement	25	0	2025-08-20 08:58:33.547065
en	invest-11000-monthly-550-11percent-50years-investment	1	2	2025-08-20 08:58:33.63098
en	invest-25000-monthly-1000-8percent-25years-retirement	2	1	2025-08-20 08:58:33.63098
en	retirement-50k-2k-6-30	3	0	2025-08-20 08:58:33.63098
en	invest-34600-monthly-550-7percent-27years-investment	4	0	2025-08-20 08:58:33.63098
en	starter-10k-500-7-10	5	0	2025-08-20 08:58:33.63098
en	aggressive-25k-1k-12-20	6	0	2025-08-20 08:58:33.63098
en	young-5k-300-8-15	7	0	2025-08-20 08:58:33.63098
en	wealth-100k-5k-10-25	8	0	2025-08-20 08:58:33.63098
en	emergency-1k-200-4-5	9	0	2025-08-20 08:58:33.63098
en	house-5k-1500-5-7	10	0	2025-08-20 08:58:33.63098
en	invest-500-monthly-100-5percent-30years-starter	11	0	2025-08-20 08:58:33.63098
en	invest-2000-monthly-1000-8percent-15years-retirement	12	0	2025-08-20 08:58:33.63098
en	invest-3000-monthly-400-7percent-20years-education	13	0	2025-08-20 08:58:33.63098
en	invest-100000-monthly-5000-10percent-25years-retirement	14	0	2025-08-20 08:58:33.63098
en	invest-80000-monthly-500-7percent-10years-house	15	0	2025-08-20 08:58:33.63098
en	invest-10000-monthly-500-7percent-10years-house	16	0	2025-08-20 08:58:33.63098
en	invest-25000-monthly-1000-12percent-20years-retirement	17	0	2025-08-20 08:58:33.63098
en	invest-1000-monthly-200-0percent-1years-emergency	18	0	2025-08-20 08:58:33.63098
en	invest-10000-monthly-900-12percent-20years-investment	19	0	2025-08-20 08:58:33.63098
en	invest-50000-monthly-500-7percent-10years-house	20	0	2025-08-20 08:58:33.63098
en	invest-1000-monthly-200-4percent-5years-emergency	21	0	2025-08-20 08:58:33.63098
en	invest-50000-monthly-2000-6percent-30years-retirement	22	0	2025-08-20 08:58:33.63098
en	invest-19000-monthly-800-7percent-10years-house	23	0	2025-08-20 08:58:33.63098
en	invest-2000-monthly-300-6percent-15years-retirement	24	0	2025-08-20 08:58:33.63098
en	invest-1880000-monthly-500-7percent-10years-house	25	0	2025-08-20 08:58:33.63098
es	invest-1880000-monthly-500-7percent-10years-house	1	0	2025-08-20 08:58:33.63098
es	retirement-50k-2k-6-30	2	0	2025-08-20 08:58:33.63098
es	wealth-100k-5k-10-25	3	0	2025-08-20 08:58:33.63098
es	invest-34600-monthly-550-7percent-27years-investment	4	0	2025-08-20 08:58:33.63098
es	invest-1000-monthly-200-4percent-5years-emergency	5	0	2025-08-20 08:58:33.63098
es	young-5k-300-8-15	6	0	2025-08-20 08:58:33.63098
es	invest-25000-monthly-1000-8percent-25years-retirement	7	0	2025-08-20 08:58:33.63098
es	aggressive-25k-1k-12-20	8	0	2025-08-20 08:58:33.63098
es	invest-2000-monthly-300-6percent-15years-retirement	9	0	2025-08-20 08:58:33.63098
es	invest-1000-monthly-200-0percent-1years-emergency	10	0	2025-08-20 08:58:33.63098
es	invest-100000-monthly-5000-10percent-25years-retirement	11	0	2025-08-20 08:58:33.63098
es	invest-25000-monthly-1000-12percent-20years-retirement	12	0	2025-08-20 08:58:33.63098
es	invest-50000-monthly-2000-6percent-30years-retirement	13	0	2025-08-20 08:58:33.63098
es	invest-3000-monthly-400-7percent-20years-education	14	0	2025-08-20 08:58:33.63098
es	invest-80000-monthly-500-7percent-10years-house	15	0	2025-08-20 08:58:33.63098
es	invest-10000-monthly-900-12percent-20years-investment	16	0	2025-08-20 08:58:33.63098
es	invest-2000-monthly-1000-8percent-15years-retirement	17	0	2025-08-20 08:58:33.63098
es	invest-500-monthly-100-5percent-30years-starter	18	0	2025-08-20 08:58:33.63098
es	invest-10000-monthly-500-7percent-10years-house	19	0	2025-08-20 08:58:33.63098
es	invest-11000-monthly-550-11percent-50years-investment	20	0	2025-08-20 08:58:33.63098
es	invest-19000-monthly-800-7percent-10years-house	21	0	2025-08-20 08:58:33.63098
es	house-5k-1500-5-7	22	0	2025-08-20 08:58:33.63098
es	invest-50000-monthly-500-7percent-10years-house	23	0	2025-08-20 08:58:33.63098
es	starter-10k-500-7-10	24	0	2025-08-20 08:58:33.63098
es	emergency-1k-200-4-5	25	0	2025-08-20 08:58:33.63098
pl	aggressive-25k-1k-12-20	1	0	2025-08-20 08:58:33.63098
pl	invest-19000-monthly-800-7percent-10years-house	2	0	2025-08-20 08:58:33.63098
pl	house-5k-1500-5-7	3	0	2025-08-20 08:58:33.63098
pl	wealth-100k-5k-10-25	4	0	2025-08-20 08:58:33.63098
pl	starter-10k-500-7-10	5	0	2025-08-20 08:58:33.63098
pl	invest-10000-monthly-900-12percent-20years-investment	6	0	2025-08-20 08:58:33.63098
pl	invest-1880000-monthly-500-7percent-10years-house	7	0	2025-08-20 08:58:33.63098
pl	invest-80000-monthly-500-7percent-10years-house	8	0	2025-08-20 08:58:33.63098
pl	emergency-1k-200-4-5	9	0	2025-08-20 08:58:33.63098
pl	invest-100000-monthly-5000-10percent-25years-retirement	10	0	2025-08-20 08:58:33.63098
pl	invest-10000-monthly-500-7percent-10years-house	11	0	2025-08-20 08:58:33.63098
pl	retirement-50k-2k-6-30	12	0	2025-08-20 08:58:33.63098
pl	invest-25000-monthly-1000-8percent-25years-retirement	13	0	2025-08-20 08:58:33.63098
pl	invest-50000-monthly-500-7percent-10years-house	14	0	2025-08-20 08:58:33.63098
pl	invest-34600-monthly-550-7percent-27years-investment	15	0	2025-08-20 08:58:33.63098
pl	invest-2000-monthly-300-6percent-15years-retirement	16	0	2025-08-20 08:58:33.63098
pl	invest-11000-monthly-550-11percent-50years-investment	17	0	2025-08-20 08:58:33.63098
pl	invest-2000-monthly-1000-8percent-15years-retirement	18	0	2025-08-20 08:58:33.63098
pl	young-5k-300-8-15	19	0	2025-08-20 08:58:33.63098
pl	invest-1000-monthly-200-0percent-1years-emergency	20	0	2025-08-20 08:58:33.63098
pl	invest-1000-monthly-200-4percent-5years-emergency	21	0	2025-08-20 08:58:33.63098
pl	invest-3000-monthly-400-7percent-20years-education	22	0	2025-08-20 08:58:33.63098
pl	invest-50000-monthly-2000-6percent-30years-retirement	23	0	2025-08-20 08:58:33.63098
pl	invest-500-monthly-100-5percent-30years-starter	24	0	2025-08-20 08:58:33.63098
pl	invest-25000-monthly-1000-12percent-20years-retirement	25	0	2025-08-20 08:58:33.63098
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: home_content home_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_content
    ADD CONSTRAINT home_content_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: scenario scenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenarios_pkey PRIMARY KEY (id);


--
-- Name: home_content unique_content_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_content
    ADD CONSTRAINT unique_content_key UNIQUE (locale, section, key);


--
-- Name: pages unique_page_locale; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT unique_page_locale UNIQUE (slug, locale);


--
-- Name: scenario unique_scenario_locale; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT unique_scenario_locale UNIQUE (slug, locale);


--
-- Name: idx_category_locale_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_locale_category ON public.scenario_category_counts USING btree (locale, category);


--
-- Name: idx_category_locale_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_locale_count ON public.scenario_category_counts USING btree (locale, count DESC);


--
-- Name: idx_home_content_locale_section; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_home_content_locale_section ON public.home_content USING btree (locale, section);


--
-- Name: idx_pages_locale_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_locale_published ON public.pages USING btree (locale, published);


--
-- Name: idx_scenario_locale_public_annual_return; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenario_locale_public_annual_return ON public.scenario USING btree (locale, annual_return DESC) INCLUDE (slug, name, initial_amount, monthly_contribution, time_horizon, view_count, created_at, is_predefined) WHERE (is_public = true);


--
-- Name: idx_scenario_locale_public_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenario_locale_public_created_at ON public.scenario USING btree (locale, created_at DESC) INCLUDE (slug, name, initial_amount, monthly_contribution, annual_return, time_horizon, view_count, is_predefined) WHERE (is_public = true);


--
-- Name: idx_scenario_locale_public_initial_amount; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenario_locale_public_initial_amount ON public.scenario USING btree (locale, initial_amount DESC) INCLUDE (slug, name, monthly_contribution, annual_return, time_horizon, view_count, created_at, is_predefined) WHERE (is_public = true);


--
-- Name: idx_scenario_locale_public_view_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenario_locale_public_view_count ON public.scenario USING btree (locale, view_count DESC) INCLUDE (slug, name, initial_amount, monthly_contribution, annual_return, time_horizon, created_at, is_predefined) WHERE (is_public = true);


--
-- Name: idx_scenario_search_vector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenario_search_vector ON public.scenario USING gin (search_vector);


--
-- Name: idx_scenarios_locale_predefined; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenarios_locale_predefined ON public.scenario USING btree (locale, is_predefined);


--
-- Name: idx_scenarios_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenarios_public ON public.scenario USING btree (is_public) WHERE (is_public = true);


--
-- Name: idx_scenarios_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenarios_tags ON public.scenario USING gin (tags);


--
-- Name: idx_scenarios_view_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scenarios_view_count ON public.scenario USING btree (view_count DESC);


--
-- Name: idx_trending_locale_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trending_locale_rank ON public.scenario_trending_snapshot USING btree (locale, rank);


--
-- Name: idx_trending_locale_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trending_locale_slug ON public.scenario_trending_snapshot USING btree (locale, slug);


--
-- Name: scenario trg_scenario_search_vector_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_scenario_search_vector_update BEFORE INSERT OR UPDATE OF name, description ON public.scenario FOR EACH ROW EXECUTE FUNCTION public.scenario_search_vector_update();


--
-- Name: home_content update_home_content_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON public.home_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pages update_pages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: scenario update_scenarios_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON public.scenario FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- PostgreSQL database dump complete
--

\unrestrict bTh3lHViyMzMZ4iaNoAeqEbJnYW2LWDT0RYTTChVkNsd5mSwjXr9YePKnJVUrVo


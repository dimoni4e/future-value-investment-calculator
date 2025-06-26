-- Future Value Investment Calculator Database Schema
-- Neon Postgres 17

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Home content table for dynamic homepage content with i18n support
CREATE TABLE home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'pl', 'es')),
  section VARCHAR(50) NOT NULL, -- 'hero', 'features', 'navigation', 'layout', etc.
  key VARCHAR(100) NOT NULL, -- 'title', 'subtitle', 'description', etc.
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_content_key UNIQUE(locale, section, key)
);

-- 2. Pages table for static pages (about, contact, privacy, terms)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL, -- 'about', 'contact', 'privacy', 'terms'
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'pl', 'es')),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  meta_description VARCHAR(300),
  meta_keywords TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_page_locale UNIQUE(slug, locale)
);

-- 3. Scenario table for investment scenarios (predefined and user-created)
CREATE TABLE scenario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL, -- 'emergency-1k-200-4-5' or user-generated
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'pl', 'es')),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  initial_amount DECIMAL(15,2) NOT NULL CHECK (initial_amount >= 0),
  monthly_contribution DECIMAL(15,2) NOT NULL CHECK (monthly_contribution >= 0),
  annual_return DECIMAL(5,2) NOT NULL CHECK (annual_return >= 0 AND annual_return <= 100),
  time_horizon INTEGER NOT NULL CHECK (time_horizon > 0 AND time_horizon <= 100),
  tags TEXT[], -- Array of tags like ['conservative', 'retirement']
  is_predefined BOOLEAN DEFAULT false, -- true for expert scenarios
  is_public BOOLEAN DEFAULT false, -- true if user wants to share
  created_by VARCHAR(100) DEFAULT 'system', -- user ID or 'system' for predefined
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_scenario_locale UNIQUE(slug, locale)
);

-- Create indexes for better performance
CREATE INDEX idx_home_content_locale_section ON home_content(locale, section);
CREATE INDEX idx_pages_locale_published ON pages(locale, published);
CREATE INDEX idx_scenarios_locale_predefined ON scenarios(locale, is_predefined);
CREATE INDEX idx_scenarios_public ON scenarios(is_public) WHERE is_public = true;
CREATE INDEX idx_scenarios_tags ON scenarios USING GIN(tags);
CREATE INDEX idx_scenarios_view_count ON scenarios(view_count DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON home_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

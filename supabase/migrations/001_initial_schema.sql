-- ==============================================================================
-- 001_initial_schema.sql
-- Production Schema for Link Management & URL Shortener Platform
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Automatic profile creation on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Automatic email confirmation on auth.users insert (prevents SMTP rate limit blockage)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_confirm_user ON auth.users;
CREATE TRIGGER trigger_auto_confirm_user
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. LINKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  max_clicks INTEGER,
  click_count INTEGER NOT NULL DEFAULT 0,
  redirect_type SMALLINT NOT NULL DEFAULT 307 CHECK (redirect_type IN (301, 302, 307)),
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Links indexes for high performance redirect & user dashboards
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_slug ON public.links(slug);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON public.links(is_active);

-- ------------------------------------------------------------------------------
-- 3. CLICK EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.click_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  country VARCHAR(10),
  city VARCHAR(100),
  device VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  referrer TEXT
);

-- Click events indexes (composite index for rapid time-range link analytics)
CREATE INDEX IF NOT EXISTS idx_click_events_link_created ON public.click_events(link_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_created_at ON public.click_events(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. REPORTS TABLE (Abuse / Security)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.links(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'phishing', 'malware', 'scam', 'illegal', 'other')),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. BLOCKED DOMAINS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_domains_domain ON public.blocked_domains(domain);

-- Seed initial blocked / dangerous domain patterns
INSERT INTO public.blocked_domains (domain, reason)
VALUES
  ('malware-site.test', 'Known malicious test domain'),
  ('phishing-demo.test', 'Known phishing demonstration domain'),
  ('grabify.link', 'Known IP tracker service'),
  ('iplogger.org', 'Known IP tracker service'),
  ('2no.co', 'Known IP tracker service')
ON CONFLICT (domain) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. RPC FUNCTIONS FOR ATOMIC CLICK UPDATES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_link_clicks(target_link_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.links
  SET click_count = click_count + 1,
      updated_at = now()
  WHERE id = target_link_id;
$$;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_domains ENABLE ROW LEVEL SECURITY;

-- 7.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7.2 LINKS POLICIES
-- Public select for redirects (or server route handler with anon/service key)
DROP POLICY IF EXISTS "Public can view active links by slug" ON public.links;
CREATE POLICY "Public can view active links by slug"
  ON public.links FOR SELECT
  USING (true);

-- Authenticated users select their own links (for dashboard)
DROP POLICY IF EXISTS "Users can create links" ON public.links;
CREATE POLICY "Users can create links"
  ON public.links FOR INSERT
  WITH CHECK (
    -- Anonymous shortening (user_id is NULL) OR authenticated user saving to their account
    (user_id IS NULL) OR (auth.uid() = user_id)
  );

DROP POLICY IF EXISTS "Users can update their own links" ON public.links;
CREATE POLICY "Users can update their own links"
  ON public.links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own links" ON public.links;
CREATE POLICY "Users can delete their own links"
  ON public.links FOR DELETE
  USING (auth.uid() = user_id);

-- 7.3 CLICK EVENTS POLICIES
-- Anyone / redirect engine can record a click event
DROP POLICY IF EXISTS "Anyone can insert click events" ON public.click_events;
CREATE POLICY "Anyone can insert click events"
  ON public.click_events FOR INSERT
  WITH CHECK (true);

-- Only link owners can view click events for their links
DROP POLICY IF EXISTS "Users can view click events for their links" ON public.click_events;
CREATE POLICY "Users can view click events for their links"
  ON public.click_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE links.id = click_events.link_id
        AND links.user_id = auth.uid()
    )
  );

-- 7.4 REPORTS POLICIES
DROP POLICY IF EXISTS "Anyone can report an abuse link" ON public.reports;
CREATE POLICY "Anyone can report an abuse link"
  ON public.reports FOR INSERT
  WITH CHECK (true);

-- 7.5 BLOCKED DOMAINS POLICIES
DROP POLICY IF EXISTS "Anyone can check blocked domains" ON public.blocked_domains;
CREATE POLICY "Anyone can check blocked domains"
  ON public.blocked_domains FOR SELECT
  USING (true);

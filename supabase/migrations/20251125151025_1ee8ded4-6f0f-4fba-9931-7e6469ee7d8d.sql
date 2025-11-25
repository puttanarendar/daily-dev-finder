-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for job platforms
CREATE TYPE job_platform AS ENUM ('naukri', 'linkedin');

-- Create enum for application status
CREATE TYPE application_status AS ENUM ('pending', 'applied', 'success', 'failed');

-- Create job_listings table
CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform job_platform NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  job_url TEXT NOT NULL,
  job_description TEXT,
  posted_date TIMESTAMPTZ,
  salary_range TEXT,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  keywords TEXT[] DEFAULT ARRAY['php', 'developer'],
  location_preferences TEXT[] DEFAULT ARRAY['Remote', 'Bangalore'],
  min_experience INTEGER DEFAULT 0,
  max_experience INTEGER DEFAULT 10,
  auto_apply_enabled BOOLEAN DEFAULT FALSE,
  daily_apply_limit INTEGER DEFAULT 10,
  linkedin_email TEXT,
  naukri_email TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE NOT NULL,
  platform job_platform NOT NULL,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  cover_letter TEXT,
  notes TEXT,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_listings (public read, authenticated write)
CREATE POLICY "Anyone can view job listings"
  ON public.job_listings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert jobs"
  ON public.job_listings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update jobs"
  ON public.job_listings FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_job_listings_platform ON public.job_listings(platform);
CREATE INDEX idx_job_listings_created_at ON public.job_listings(created_at DESC);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Add unique constraint on job_url for upsert to work
ALTER TABLE public.job_listings ADD CONSTRAINT job_listings_job_url_unique UNIQUE (job_url);
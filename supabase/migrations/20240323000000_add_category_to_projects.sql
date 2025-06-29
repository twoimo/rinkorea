-- Add category column to projects table
ALTER TABLE public.projects
ADD COLUMN category TEXT NOT NULL DEFAULT 'construction';

-- Update existing projects to have 'construction' category
UPDATE public.projects
SET category = 'construction'
WHERE category IS NULL; 
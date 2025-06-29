-- Add category column to inquiries table
ALTER TABLE public.inquiries 
ADD COLUMN category text DEFAULT '일반문의' NOT NULL;

-- Update existing records to have a default category
UPDATE public.inquiries 
SET category = '일반문의' 
WHERE category IS NULL; 
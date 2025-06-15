
-- Add detail_images column to product_introductions table
ALTER TABLE product_introductions 
ADD COLUMN detail_images TEXT[] DEFAULT '{}';

-- Update existing records to have empty array for detail_images
UPDATE product_introductions 
SET detail_images = '{}' 
WHERE detail_images IS NULL;

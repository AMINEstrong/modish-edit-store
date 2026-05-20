-- Add additional_images to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS additional_images TEXT[] NOT NULL DEFAULT '{}';

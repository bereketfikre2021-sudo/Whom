-- Fix category associations for demo listings
-- This script updates existing demo listings to use the correct category IDs

-- First, let's see what we have
SELECT 
  l.id,
  l.title,
  l.category_id,
  c.slug as category_slug,
  c.name as category_name
FROM listings l
LEFT JOIN categories c ON l.category_id = c.id
WHERE l.is_demo = true
ORDER BY l.id;

-- Update listings based on their title to assign correct categories
DO $$
DECLARE
  construction_cat_id UUID;
  houses_cat_id UUID;
  tutors_cat_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO construction_cat_id FROM categories WHERE slug = 'construction-workers';
  SELECT id INTO houses_cat_id FROM categories WHERE slug = 'houses-for-rent';
  SELECT id INTO tutors_cat_id FROM categories WHERE slug = 'tutors';
  
  RAISE NOTICE 'Construction Workers ID: %', construction_cat_id;
  RAISE NOTICE 'Houses for Rent ID: %', houses_cat_id;
  RAISE NOTICE 'Tutors ID: %', tutors_cat_id;
  
  -- Update construction worker listings
  UPDATE listings 
  SET category_id = construction_cat_id
  WHERE title LIKE '%Construction Laborer%' 
     OR title LIKE '%Painter%' 
     OR title LIKE '%Carpenter%'
     AND is_demo = true;
     
  -- Update house listings
  UPDATE listings 
  SET category_id = houses_cat_id
  WHERE title LIKE '%Apartment%' 
     OR title LIKE '%Studio%'
     AND is_demo = true;
     
  -- Update tutor listings
  UPDATE listings 
  SET category_id = tutors_cat_id
  WHERE title LIKE '%Tutor%'
     AND is_demo = true;
     
  RAISE NOTICE 'Updated category associations';
END $$;

-- Verify the fix
SELECT 
  l.id,
  l.title,
  l.category_id,
  c.slug as category_slug,
  c.name as category_name
FROM listings l
LEFT JOIN categories c ON l.category_id = c.id
WHERE l.is_demo = true
ORDER BY c.slug;

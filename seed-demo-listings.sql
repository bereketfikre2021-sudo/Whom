-- Seed script for demo listings
-- This script creates sample demonstration listings for all three categories
-- Run this script in Supabase SQL editor or via CLI
-- IMPORTANT: This should only be run in development environment

-- Get category IDs
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

  -- CONSTRUCTION WORKERS LISTINGS
  
  -- Profile 1: General Construction Laborer
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    construction_cat_id,
    'General Construction Laborer',
    'Experienced general construction worker available for residential construction and related manual work. Skilled in site preparation, material handling, and general construction tasks. Reliable and hardworking with 4 years of hands-on experience in various construction projects.',
    'Negotiable',
    'Bole, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop'],
    'active',
    'category',
    true,
    true,
    '{
      "worker_type": "General Laborer",
      "experience": "4 years",
      "skills": ["General construction", "Site preparation", "Material handling"],
      "availability": "Full-time"
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Profile 2: Residential Painter
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    construction_cat_id,
    'Residential Painter',
    'Residential painting specialist with experience preparing and painting interior and exterior surfaces. Expert in surface preparation, color selection advice, and clean application. 5 years of experience in residential painting projects with attention to detail and quality finishes.',
    'Negotiable',
    'Saris, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop'],
    'active',
    'category',
    false,
    true,
    '{
      "worker_type": "Painter",
      "experience": "5 years",
      "skills": ["Interior painting", "Exterior painting", "Surface preparation"],
      "availability": "Part-time"
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Profile 3: Carpenter and Furniture Maker
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    construction_cat_id,
    'Carpenter and Furniture Maker',
    'Carpenter experienced in basic furniture making, woodwork, door fitting, and household carpentry projects. Skilled in working with various wood types and creating custom pieces. 6 years of experience delivering quality carpentry work for homes and businesses.',
    'Negotiable',
    'Piassa, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop'],
    'active',
    'category',
    false,
    true,
    '{
      "worker_type": "Carpenter",
      "experience": "6 years",
      "skills": ["Carpentry", "Shelves", "Doors", "Furniture assembly"],
      "availability": "Full-time"
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- HOUSES FOR RENT LISTINGS

  -- Property 1: One-Bedroom Apartment
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    houses_cat_id,
    'One-Bedroom Apartment in Ayat',
    'Sample one-bedroom rental listing with a dedicated living area and basic property details. This apartment offers comfortable living space in a convenient location. Ideal for individuals or couples looking for a well-maintained rental property.',
    'ETB 8,000/month',
    'Ayat, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'],
    'active',
    'category',
    true,
    true,
    '{
      "bedrooms": 1,
      "bathrooms": 1,
      "area": "60 sqm",
      "property_type": "Apartment",
      "furnished": false,
      "facilities": ["Parking", "Security"]
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Property 2: Two-Bedroom Family Apartment
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    houses_cat_id,
    'Two-Bedroom Family Apartment',
    'Sample two-bedroom property suitable for people looking for additional living space. This spacious apartment is perfect for small families. Located in a desirable area with good access to amenities and services.',
    'ETB 15,000/month',
    'Summit, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
    'active',
    'category',
    false,
    true,
    '{
      "bedrooms": 2,
      "bathrooms": 2,
      "area": "90 sqm",
      "property_type": "Apartment",
      "furnished": true,
      "facilities": ["Parking", "Security", "Balcony"]
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Property 3: Compact Studio Rental
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    houses_cat_id,
    'Compact Studio Rental',
    'Sample compact rental property for someone looking for a smaller living space. This studio apartment is efficient and well-designed, perfect for students or young professionals. Affordable option in a convenient location.',
    'ETB 6,500/month',
    'Megenagna, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'],
    'active',
    'category',
    false,
    true,
    '{
      "bedrooms": 1,
      "bathrooms": 1,
      "area": "40 sqm",
      "property_type": "Studio",
      "furnished": false,
      "facilities": ["Security"]
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- TUTORS LISTINGS

  -- Profile 1: Mathematics Tutor
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    tutors_cat_id,
    'Mathematics Tutor',
    'Sample tutor profile offering mathematics and basic science learning support. Experienced in helping students understand mathematical concepts and improve problem-solving skills. Patient teaching approach tailored to individual learning needs.',
    'ETB 200/hour',
    'Bole, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop'],
    'active',
    'category',
    true,
    true,
    '{
      "subject": "Mathematics and basic science",
      "experience": "4 years",
      "grade_level": "Primary to Secondary",
      "qualifications": "Mathematics Degree",
      "teaching_arrangement": "In-person",
      "schedule": "Weekdays and Weekends"
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Profile 2: English Language Tutor
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    tutors_cat_id,
    'English Language Tutor',
    'Sample tutor profile focused on English language learning and foundational literacy skills. Specialized in teaching reading, writing, and grammar. Helps students build confidence in English communication for academic and professional success.',
    'ETB 150/hour',
    'Kazanchis, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=600&fit=crop'],
    'active',
    'category',
    false,
    true,
    '{
      "subject": "English reading, writing, and grammar",
      "experience": "3 years",
      "grade_level": "All levels",
      "qualifications": "English Literature Degree",
      "teaching_arrangement": "In-person or Online",
      "schedule": "Flexible"
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Profile 3: Primary School Tutor
  INSERT INTO listings (
    category_id,
    title,
    description,
    price,
    location,
    contact_info,
    images,
    status,
    fee_type,
    featured,
    is_demo,
    metadata
  ) VALUES (
    tutors_cat_id,
    'Primary School Tutor',
    'Sample tutor profile offering academic support and help with primary school learning. Experienced in teaching multiple subjects at primary school level. Provides homework support and helps students build strong foundational knowledge across subjects.',
    'ETB 180/hour',
    'CMC, Addis Ababa',
    'DEMO - No real contact info',
    ARRAY['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'],
    'active',
    'category',
    false,
    true,
    '{
      "subject": "Primary school subjects and homework support",
      "experience": "5 years",
      "grade_level": "Primary School (Grades 1-8)",
      "qualifications": "Education Degree",
      "teaching_arrangement": "In-person",
      "schedule": "After school hours"
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Demo listings seeded successfully';
END $$;

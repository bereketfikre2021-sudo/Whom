-- Demo Listings for Development
-- Run this to populate sample listings for testing
-- These are marked as demo listings and should not accept payments

-- Construction Workers Demo Listings
INSERT INTO listings (id, category_id, title, description, price, location, images, status, featured, fee_type, custom_fee, metadata, is_demo, created_at, updated_at)
VALUES 
  (UUID_GENERATE_V4(), 
   (SELECT id FROM categories WHERE slug = 'construction-workers' LIMIT 1),
   'General Construction Laborer',
   'Experienced general construction worker available for site assistance and basic construction tasks. Skilled in heavy lifting, material handling, and site cleanup.',
   '500 ETB/day',
   'Bole, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1504307901258-1a445bc7bbcd?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"worker_type": "General Laborer", "experience": "4 years", "skills": ["General construction", "Site assistance", "Material handling"], "availability": "Available weekends"}',
   true,
   NOW(),
   NOW()
  ),
  (UUID_GENERATE_V4(),
   (SELECT id FROM categories WHERE slug = 'construction-workers' LIMIT 1),
   'Residential Painter',
   'Professional painter specializing in interior and exterior residential painting. Quality work with attention to detail and clean finish.',
   '800 ETB/day',
   'Saris, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1562259949-e8e7df9cc74f?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"worker_type": "Painter", "experience": "5 years", "skills": ["Interior painting", "Exterior painting", "Wall preparation"], "availability": "Available weekdays"}',
   true,
   NOW(),
   NOW()
  ),
  (UUID_GENERATE_V4(),
   (SELECT id FROM categories WHERE slug = 'construction-workers' LIMIT 1),
   'Carpenter and Furniture Maker',
   'Skilled carpenter for doors, shelves, furniture, and basic woodwork. Custom furniture and repairs available.',
   '700 ETB/day',
   'Piassa, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1604761637158-3c6d6e8b6f09?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"worker_type": "Carpenter", "experience": "6 years", "skills": ["Doors", "Shelves", "Furniture", "Basic woodwork"], "availability": "Available full-time"}',
   true,
   NOW(),
   NOW()
  );

-- Houses for Rent Demo Listings
INSERT INTO listings (id, category_id, title, description, price, location, images, status, featured, fee_type, custom_fee, metadata, is_demo, created_at, updated_at)
VALUES
  (UUID_GENERATE_V4(),
   (SELECT id FROM categories WHERE slug = 'houses-for-rent' LIMIT 1),
   'One-Bedroom Apartment',
   'Modern one-bedroom apartment in a safe neighborhood. Clean, well-maintained with essential amenities.',
   '8,000 ETB/month',
   'Ayat, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"bedrooms": 1, "bathrooms": 1, "area": "60 sqm", "property_type": "Apartment", "furnished": false, "facilities": ["Water", "Electricity", "Security"]}',
   true,
   NOW(),
   NOW()
  ),
  (UUID_GENERATE_V4(),
   (SELECT id FROM categories WHERE slug = 'houses-for-rent' LIMIT 1),
   'Two-Bedroom Family Apartment',
   'Spacious two-bedroom apartment suitable for families. Located in a convenient area with good access to amenities.',
   '15,000 ETB/month',
   'Summit, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"bedrooms": 2, "bathrooms": 1, "area": "90 sqm", "property_type": "Apartment", "furnished": true, "facilities": ["Water", "Electricity", "Security", "Parking"]}',
   true,
   NOW(),
   NOW()
  ),
  (UUID_GENERATE_V4(),
   (SELECT id FROM categories WHERE slug = 'houses-for-rent' LIMIT 1),
   'Compact Studio Rental',
   'Affordable studio apartment perfect for students or young professionals. Compact but functional space.',
   '6,500 ETB/month',
   'Megenagna, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"bedrooms": 0, "bathrooms": 1, "area": "35 sqm", "property_type": "Studio", "furnished": false, "facilities": ["Water", "Electricity"]}',
   true,
   NOW(),
   NOW()
  );

-- Tutors Demo Listings
INSERT INTO listings (id, category_id, title, description, price, location, images, status, featured, fee_type, custom_fee, metadata, is_demo, created_at, updated_at)
VALUES
  (UUID_GENERATE_V4(),
   (SELECT id FROM categories WHERE slug = 'tutors' LIMIT 1),
   'Mathematics Tutor',
   'Experienced mathematics tutor for primary and secondary school students. Patient and effective teaching methods.',
   '400 ETB/hour',
   'Bole, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"subject": "Mathematics", "grade_level": "Primary and Secondary", "experience": "4 years", "qualifications": "Mathematics Degree", "teaching_arrangement": "In-person", "schedule": "Weekends and evenings"}',
   true,
   NOW(),
   NOW()
  ),
  (UUID_GENERATE_V4(),
   (SELECT id FROM categories WHERE slug = 'tutors' LIMIT 1),
   'English Language Tutor',
   'English tutor specializing in reading, writing, and grammar. Help students improve their English language skills.',
   '350 ETB/hour',
   'Kazanchis, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"subject": "English", "grade_level": "All levels", "experience": "3 years", "qualifications": "English Literature Degree", "teaching_arrangement": "In-person or Online", "schedule": "Flexible"}',
   true,
   NOW(),
   NOW()
  ),
  (UUID_GENERATE_V4(),
   (SELECT id FROM categories WHERE slug = 'tutors' LIMIT 1),
   'Primary School Tutor',
   'Comprehensive primary school tutor for homework help and general learning support across all subjects.',
   '300 ETB/hour',
   'CMC, Addis Ababa',
   ARRAY['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop'],
   'active',
   true,
   'category',
   NULL,
   '{"subject": "Multiple subjects", "grade_level": "Primary School", "experience": "5 years", "qualifications": "Education Degree", "teaching_arrangement": "In-person", "schedule": "Weekdays after school"}',
   true,
   NOW(),
   NOW()
  );

-- Add is_demo column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' 
    AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE listings ADD COLUMN is_demo BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

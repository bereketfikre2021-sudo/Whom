-- Add category-specific fields to listings table
ALTER TABLE listings 
ADD COLUMN metadata JSONB DEFAULT '{}';

-- Create sample listings with category-specific metadata

-- Construction Workers
INSERT INTO listings (category_id, title, description, price, location, contact_info, images, fee_type, metadata) VALUES
(
  (SELECT id FROM categories WHERE slug = 'construction-workers'),
  'ባናል ሰራተኛ ለግንብ ስራር',
  'የ10 ዓመስ ባናል ሰራተኛ። ለግንብ እና ስራር እየማይ ይሰራራል።። የምክለክ እና የእሳት ስራር አገልግራል።።። ቀናል ብየመልን ይሰራራል።።።',
  '5000 ብር/ወር',
  'ቦለለ አዲስ አባባቢ',
  '+251911123456',
  ARRAY['https://images.unsplash.com/photo-1504307901258-1a445bc7bbcd?w=800&h=600&fit=crop'],
  'category',
  '{"worker_type": "ሰራተኛ", "experience": "10 ዓመስ", "skills": ["ግንብ ስራር", "እሳት ስራር", "የእሳት ስራር"], "availability": "ቀናል ከሰኞበ 8ሰን 6ሰን", "rating": 4.5}'
),
  (SELECT id FROM categories WHERE slug = 'construction-workers'),
  'ስያራኛ ለማይዣ እና ኤሌትሲሲያ',
  'ሙልን የማይዣ ስያራኛ እና ኤሌትሲሲያ ለቤትዮጵያ እና የቤትዮጵያ ባንስ አገልግራል።።። የእሳት ስራር እና የእሳት ስራር ተካለል።።። ቀናል ብየመልን ይሰራራል።።።',
  '6000 ብር/ወር',
  'ቦለለ አዲስ አባባቢ',
  '+251911234567',
  ARRAY['https://images.unsplash.com/photo-1581094794329-c8112a4a4db63?w=800&h=600&fit=crop'],
  'category',
  '{"worker_type": "ስያራኛ", "experience": "8 ዓመስ", "skills": ["እሳት ስራር", "ማይዣ", "አፕርት"], "availability": "ቀናል ከሰኞበ 9ሰን 5ሰን", "rating": 4.8}'
),
  (SELECT id FROM categories WHERE slug = 'construction-workers'),
  'ኤሌትሲሲያ ለኤልትዮጵያ እና የቤትዮጵያ',
  'ሙልን የኤሌትሲሲያ ለኤልትዮጵያ እና የቤትዮጵያ ባንስ አገልግራል።።። የወታሪ ስራር እና የወታሪ ስራር ተካለል።።። እንደግብ የአካባቢ ስራር ይሰራራል።።።',
  '7000 ብር/ወር',
  'ቦለለ አዲስ አባባቢ',
  '+251911345678',
  ARRAY['https://images.unsplash.com/photo-1504326817391-36981fe45a0b?w=800&h=600&fit=crop'],
  'category',
  '{"worker_type": "ኤሌትሲሲያ", "experience": "15 ዓመስ", "skills": ["ወታሪ ስራር", "ኤሌትሲሲያ", "አካባቢ ስራር"], "availability": "ቀናል ከሰኞበ 8ሰን 6ሰን", "rating": 4.9}'
);

-- Houses for Rent
INSERT INTO listings (category_id, title, description, price, location, contact_info, images, fee_type, metadata) VALUES
(
  (SELECT id FROM categories WHERE slug = 'houses-for-rent'),
  '2 አፈልፊ አፓርትማንት በቦለለ አዲስ',
  'የ2 አፈልፊ አፓርትማንት በቦለለ አዲስ እን ካትያ ሲሊጽ የማንት ወርልፊ ስልፍልፊ ይፈልፍ።።። የማይዣ እና የእሳት ስራር ተካለል።።። ከአፓርትማንት 500 ሜትር ርርሽ ይገኝበታል።።።',
  '15000 ብር/ወር',
  'ቦለለ አዲስ አባባቢ',
  '+251911987654',
  ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'],
  'category',
  '{"property_type": "አፓርትማንት", "bedrooms": 2, "bathrooms": 1, "area": "85 ካድ ሜትር", "facilities": ["ካትያ", "የእሳት ስራር", "የአዳራስ ስራር", "አውርት", "wifi"], "availability": "ቀናል ከአንፈባ", "furnished": true}'
),
  (SELECT id FROM categories WHERE slug = 'houses-for-rent'),
  '3 አፈልፊ ቤትዮጵያ በቦለለ አዲስ',
  'የ3 አፈልፊ ቤትዮጵያ በቦለለ አዲስ እን ካትያ ሲንክ የማንት ወርልፊ ስልፍልፊ ይፈልፍ።።። የማይዣ እና የእሳት ስራር ተካለል።።። ከኤትዮጵያ 800 ሜትር ርርሽ ይገኝበታል።።።',
  '25000 ብር/ወር',
  'ቦለለ አዲስ አባባቢ',
  '+251911234567',
  ARRAY['https://images.unsplash.com/photo-150267226474-9a93af5eb2cd?w=800&h=600&fit=crop'],
  'category',
  '{"property_type": "ቤት", "bedrooms": 3, "bathrooms": 2, "area": "120 ካድ ሜትር", "facilities": ["ካትያ", "የእሳት ስራር", "የአዳራስ ስራር", "አፍ�ት", "wifi", "ጋ�ርታ"], "availability": "ቀናል ከአንፈባ", "furnished": true}'
),
  (SELECT id FROM categories WHERE slug = 'houses-for-rent'),
  '1 አፈልፊ አፓርትማንት በቦለለ አዲስ',
  'የ1 አፈልፊ አፓርትማንት በቦለለ አዲስ እን ካትያ ሲንክ የማንት ወርልፊ ስልፍልፊ ይፈልፍ።።። የማይዣ እና የእሳት ስራር ተካለል።።። ከአፓርትማንት 300 ሜትር ርርሽ ይገኝበታል።።።',
  '8000 ብር/ወር',
  'ቦለለ አዲስ አባባቢ',
  '+251911567890',
  ARRAY['https://images.unsplash.com/photo-151291777408315-952003462d88?w=800&h=600&fit=crop'],
  'category',
  '{"property_type": "አፓርትማንት", "bedrooms": 1, "bathrooms": 1, "area": "45 ካድ ሜትር", "facilities": ["ካትያ", "የእሳት ስራር", "wifi"], "availability": "ቀናል ከአንፈባ", "furnished": false}'
);

-- Tutors
INSERT INTO listings (category_id, title, description, price, location, contact_info, images, fee_type, metadata) VALUES
(
  (SELECT id FROM categories WHERE slug = 'tutors'),
  'ስልትያስ እስት ቱቶር',
  'ለእስት ስልትያስ ቱቶር ለመማር እና ለምክር ስልትያስ የትምህር ተማርፍ።።። የ5 ዓመስ ልምማር አለምር እና የተልባም ስልትያስ ቱቶር እን ለኢንግኝ አለምር ይሰራራል።።። ቀናል በአግባቢ ወይስ ወርድ እን በርድ ይሰራራል።።።',
  '200 ብር/ሰንኛ',
  'ቦለለ አዲስ አባባቢ',
  '+251911765432',
  ARRAY['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop'],
  'category',
  '{"subject": "ስልትያስ", "grade_level": "1-12", "qualifications": "BA በስልትያስ", "experience": "5 ዓመስ", "teaching_arrangement": "በአግባቢ", "schedule": "ቀናል ከሰኞበ 2ሰን 6ሰን", "rating": 4.7}'
),
  (SELECT id FROM categories WHERE slug = 'tutors'),
  'አደስትት ቱቶር',
  'ለአደስት እና ኢንግኝ ቱቶር ለመማር እና ለአደስት ትምህር ተማርፍ።።። የ8 ዓመስ ልምማር አለምር እና የተፍባም አደስት ቱቶር እን ለኢንግኝ አለምር ይሰራራል።።። ቀናል በአግባቢ ወይስ ወርድ እን በርድ ይሰራራል።።።',
  '300 ብር/ሰንኛ',
  'ቦለለ አዲስ አባባቢ',
  '+251911345678',
  ARRAY['https://images.unsplash.com/photo-1544717305-27a2597f3a02?w=800&h=600&fit=crop'],
  'category',
  '{"subject": "አደስት", "grade_level": "9-12", "qualifications": "MSc በአደስት", "experience": "8 ዓመስ", "teaching_arrangement": "በአግባቢ", "schedule": "ቀናል ከሰኞበ 4ሰን 8ሰን", "rating": 4.9}'
),
  (SELECT id FROM categories WHERE slug = 'tutors'),
  'ኢንግኝ ቱቶር',
  'ለኢንግኝ ቱቶር ለመማር እና ለኢንግኝ ትምህር ተማርፍ።።። የ3 ዓመስ ልምማር አለምር እና የተፍባም ኢንግኝ ቱቶር እን ለኢንግኝ አለምር ይሰራራል።።። ቀናል በአግባቢ ወይስ ወርድ እን በርድ ይሰራራል።።።',
  '250 ብር/ሰንኛ',
  'ቦለለ አዲስ አባባቢ',
  '+251911890123',
  ARRAY['https://images.unsplash.com/photo-1531484863138-5c6061293ac2?w=800&h=600&fit=crop'],
  'category',
  '{"subject": "ኢንግኝ", "grade_level": "K-8", "qualifications": "BA በኢንግኝ", "experience": "4 ዓመስ", "teaching_arrangement": "በአግባቢ", "schedule": "ቀናል ከሰኞበ 3ሰን 7ሰን", "rating": 4.6}'
);

-- Set some as featured
UPDATE listings SET featured = true WHERE id IN (
  (SELECT id FROM listings WHERE title = 'ባናል ሰራተኛ ለግንብ ስራር'),
  (SELECT id FROM listings WHERE title = '2 አፈልፊ አፓርትማንት በቦለለ አዲስ'),
  (SELECT id FROM listings WHERE title = 'ስልትያስ እስት ቱቶር')
);

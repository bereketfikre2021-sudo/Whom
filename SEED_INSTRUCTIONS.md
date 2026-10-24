# Demo Listings Seed Instructions

## Overview
This seed script creates 9 demonstration listings (3 per category) for development and testing purposes.

## Files Changed
1. `seed-demo-listings.sql` - New seed script
2. `src/pages/CategoryListings.jsx` - Added is_demo field to query and display demo badge
3. `src/pages/ListingDetail.jsx` - Added demo listing UI that disables payments
4. `src/pages/Home.jsx` - Added featured field to featured listings query

## Running the Seed Script

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `seed-demo-listings.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the script
6. You should see "Demo listings seeded successfully" in the results

### Option 2: Supabase CLI
```bash
supabase db execute seed-demo-listings.sql
```

### Option 3: psql Command Line
```bash
psql -h your-project.supabase.co -U postgres -d postgres -f seed-demo-listings.sql
```

## Important Notes
- This script should ONLY be run in development environment
- The script uses `ON CONFLICT DO NOTHING` to prevent duplicate insertions
- All listings are marked with `is_demo = true`
- Contact info for demo listings is set to "DEMO - No real contact info"
- Demo listings cannot accept payments (enforced by database function)

## Demo Listings Created

### Construction Workers (3)
1. General Construction Laborer - Bole, Addis Ababa
2. Residential Painter - Saris, Addis Ababa
3. Carpenter and Furniture Maker - Piassa, Addis Ababa

### Houses for Rent (3)
1. One-Bedroom Apartment - Ayat, Addis Ababa (ETB 8,000/month)
2. Two-Bedroom Family Apartment - Summit, Addis Ababa (ETB 15,000/month)
3. Compact Studio Rental - Megenagna, Addis Ababa (ETB 6,500/month)

### Tutors (3)
1. Mathematics Tutor - Bole, Addis Ababa (ETB 200/hour)
2. English Language Tutor - Kazanchis, Addis Ababa (ETB 150/hour)
3. Primary School Tutor - CMC, Addis Ababa (ETB 180/hour)

## Database Schema Used
- `listings` table with columns: id, category_id, title, description, price, location, contact_info, images, status, fee_type, featured, is_demo, metadata
- `metadata` JSONB field stores category-specific attributes:
  - Construction Workers: worker_type, experience, skills, availability
  - Houses for Rent: bedrooms, bathrooms, area, property_type, furnished, facilities
  - Tutors: subject, experience, grade_level, qualifications, teaching_arrangement, schedule

## Testing Checklist
After running the seed script:
- [ ] Verify 9 listings appear in the database
- [ ] Check each category page shows 3 listings
- [ ] Open each listing detail page
- [ ] Verify demo badge appears on category cards
- [ ] Verify demo listing shows "Demo Listing" message on detail page
- [ ] Attempt to unlock contact on demo listing (should be disabled)
- [ ] Verify real listing payment flow still works
- [ ] Check responsive layout on mobile

## Security Notes
- Demo listings have `is_demo = true` flag
- Database function `create_payment` rejects payments for demo listings
- Contact info for demo listings is clearly marked as fake
- No real user accounts are created by this script

## Troubleshooting Category Filtering

If all listings appear in all categories, run this query to verify data:

```sql
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
```

Expected output should show:
- 3 listings with category_slug = 'construction-workers'
- 3 listings with category_slug = 'houses-for-rent'
- 3 listings with category_slug = 'tutors'

If category_id is NULL or wrong, the listings weren't associated correctly. Re-run the seed script.

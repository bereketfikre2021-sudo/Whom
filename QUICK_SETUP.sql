-- ============================================================
-- QUICK SETUP GUIDE - ምን እናቅርብሎት? Ethiopian Marketplace
-- ============================================================
--
-- This file contains the exact SQL commands needed to set up
-- the database and storage for the marketplace.
--
-- INSTRUCTIONS:
-- 1. Copy the entire contents of this file
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run"
-- 4. Wait for completion (may take 1-2 minutes)
-- 5. Verify no errors in the results
--
-- NOTE: This combines both supabase-schema.sql and
-- supabase-storage-policies.sql into a single setup script.
-- ============================================================

-- ============================================================
-- PART 1: DATABASE SCHEMA
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT,
  location TEXT,
  contact_info TEXT NOT NULL,
  images TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'verified')),
  fee_type TEXT DEFAULT 'category' CHECK (fee_type IN ('category', 'custom')),
  custom_fee DECIMAL(10,2),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category Fees table
CREATE TABLE category_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) UNIQUE,
  fee_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('telebirr', 'cbe', 'bank')),
  transaction_id TEXT,
  receipt_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id)
);

-- Contact Access table
CREATE TABLE contact_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  user_id UUID REFERENCES auth.users(id),
  listing_id UUID REFERENCES listings(id),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id),
  CONSTRAINT verified_payment_only CHECK (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = payment_id
      AND payments.status = 'verified'
      AND payments.user_id = user_id
      AND payments.listing_id = listing_id
    )
  )
);

-- User Profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, phone, is_admin)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories
CREATE POLICY "Categories are public" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can create categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for Listings
CREATE POLICY "Listings are public" ON listings
  FOR SELECT USING (true);

CREATE POLICY "Admins can create listings" ON listings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update listings" ON listings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete listings" ON listings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for Category Fees
CREATE POLICY "Category fees are public" ON category_fees
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage category fees" ON category_fees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for Payments
CREATE POLICY "Users see own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins see all payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND amount > 0
  );

CREATE POLICY "Admins can verify payments" ON payments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('verified', 'rejected')
    AND verified_at = NOW()
    AND verified_by = auth.uid()
  );

-- RLS Policies for Contact Access
CREATE POLICY "Users see own contact access" ON contact_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins see all contact access" ON contact_access
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Verified payments can create contact access" ON contact_access
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = payment_id
      AND payments.status = 'verified'
      AND payments.user_id = user_id
      AND payments.listing_id = listing_id
    )
  );

-- RLS Policies for User Profiles
CREATE POLICY "Users see own profile" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins see all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can update own profile (non-admin)" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND is_admin = (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update any profile" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Secure view for public listings
CREATE OR REPLACE VIEW public_listings AS
SELECT
  id,
  category_id,
  title,
  description,
  price,
  location,
  images,
  status,
  fee_type,
  custom_fee,
  featured,
  created_at,
  updated_at
FROM listings
WHERE status = 'active';

-- Secure function to get contact info
CREATE OR REPLACE FUNCTION get_contact_info(listing_id UUID, user_id UUID)
RETURNS TABLE(contact_info TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT l.contact_info
  FROM listings l
  WHERE l.id = listing_id
  AND EXISTS (
    SELECT 1 FROM contact_access ca
    WHERE ca.listing_id = listing_id
    AND ca.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Secure function to check contact access
CREATE OR REPLACE FUNCTION has_contact_access(listing_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM contact_access
    WHERE listing_id = listing_id
    AND user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Secure function to create payment with validation
CREATE OR REPLACE FUNCTION create_payment(
  p_listing_id UUID,
  p_user_id UUID,
  p_payment_method TEXT,
  p_transaction_id TEXT,
  p_receipt_image TEXT
)
RETURNS UUID AS $$
DECLARE
  v_listing RECORD;
  v_category_fee RECORD;
  v_fee_amount DECIMAL(10,2);
  v_payment_id UUID;
BEGIN
  -- Verify listing exists and is active
  SELECT * INTO v_listing
  FROM listings
  WHERE id = p_listing_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or not active';
  END IF;

  -- Calculate correct fee
  IF v_listing.fee_type = 'custom' THEN
    v_fee_amount := COALESCE(v_listing.custom_fee, 0);
  ELSE
    SELECT * INTO v_category_fee
    FROM category_fees
    WHERE category_id = v_listing.category_id;

    v_fee_amount := COALESCE(v_category_fee.fee_amount, 0);
  END IF;

  -- Create payment with validated amount
  INSERT INTO payments (
    listing_id,
    user_id,
    amount,
    payment_method,
    transaction_id,
    receipt_image,
    status
  ) VALUES (
    p_listing_id,
    p_user_id,
    v_fee_amount,
    p_payment_method,
    p_transaction_id,
    p_receipt_image,
    'pending'
  ) RETURNING id INTO v_payment_id;

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_contact_info(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_contact_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_payment(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Insert initial categories
INSERT INTO categories (name, slug, icon, description) VALUES
  ('ግንብ ሰራተኞች', 'construction-workers', '👷', 'የግንብ ሰራተኞች እና የግንብ አገልግሎቶች'),
  ('ቤቶች ለኪሳ', 'houses-for-rent', '🏠', 'ቤቶች እና አፓርትማንቶች ለኪሳ'),
  ('ቱቶርስ', 'tutors', '📚', 'የትምህርት ቱቶርስ እና ጠቃሚ ትምህርቶች');

-- Insert default category fees
INSERT INTO category_fees (category_id, fee_amount)
SELECT id, 50.00 FROM categories;

-- ============================================================
-- PART 2: STORAGE BUCKETS SETUP
-- ============================================================
--
-- IMPORTANT: Before running the storage policies below, you must
-- manually create the storage buckets in the Supabase dashboard:
--
-- 1. Go to Storage in Supabase dashboard
-- 2. Create bucket named 'listings' (PUBLIC)
-- 3. Create bucket named 'receipts' (PRIVATE)
-- 4. Then run the storage policies below
-- ============================================================

-- Storage Policies for Receipts Bucket

CREATE POLICY "Users can upload receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'receipts'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can delete own receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can delete any receipt"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'receipts'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Storage Policies for Listings Bucket

CREATE POLICY "Public can view listing images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Admins can upload listing images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'listings'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete listing images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'listings'
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================================
-- SETUP COMPLETE
-- ============================================================
--
-- Next steps:
-- 1. Configure .env file with your Supabase credentials
-- 2. Run npm install in the project directory
-- 3. Run npm run dev to start the development server
-- 4. Register an account and set is_admin=true in the dashboard
-- 5. Test the application
--
-- For detailed instructions, see SETUP.md
-- ============================================================

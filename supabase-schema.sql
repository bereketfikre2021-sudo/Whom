-- DROP existing objects (for clean re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS enforce_contact_access_payment ON contact_access;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_verified_payment() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP VIEW IF EXISTS public_listings;
DROP TABLE IF EXISTS contact_access CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS category_fees CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

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
  is_demo BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
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
  receipt_url TEXT,
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
  UNIQUE(user_id, listing_id)
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

-- Function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT is_admin FROM public.user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to enforce verified payment only for contact access
CREATE OR REPLACE FUNCTION enforce_verified_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM payments
    WHERE payments.id = NEW.payment_id
    AND payments.status = 'verified'
    AND payments.user_id = NEW.user_id
    AND payments.listing_id = NEW.listing_id
  ) THEN
    RAISE EXCEPTION 'Contact access can only be created for verified payments';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to enforce verified payment on contact access insert
CREATE TRIGGER enforce_contact_access_payment
  BEFORE INSERT ON contact_access
  FOR EACH ROW EXECUTE FUNCTION enforce_verified_payment();

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (public read, admin write)
CREATE POLICY "Categories are public" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can create categories" ON categories
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for Listings (public read, admin write)
-- CRITICAL: Contact info is protected via a view or by not selecting it in frontend
CREATE POLICY "Listings are public" ON listings
  FOR SELECT USING (true);

CREATE POLICY "Admins can create listings" ON listings
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update listings" ON listings
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete listings" ON listings
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for Category Fees (public read, admin write)
CREATE POLICY "Category fees are public" ON category_fees
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage category fees" ON category_fees
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for Payments (users see own, admins see all)
CREATE POLICY "Users see own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins see all payments" ON payments
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND amount > 0
  );

-- CRITICAL: Admins can only verify pending payments and cannot re-verify
CREATE POLICY "Admins can verify payments" ON payments
  FOR UPDATE USING (
    public.is_admin(auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('verified', 'rejected')
    AND verified_at = NOW()
    AND verified_by = auth.uid()
  );

-- RLS Policies for Contact Access (users see own, admins see all)
CREATE POLICY "Users see own contact access" ON contact_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins see all contact access" ON contact_access
  FOR SELECT USING (public.is_admin(auth.uid()));

-- CRITICAL: Only verified payments can create contact access
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

-- RLS Policies for User Profiles (users see own, admins see all)
CREATE POLICY "Users see own profile" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins see all profiles" ON public.user_profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- CRITICAL: Users can only update non-admin fields (cannot promote themselves)
CREATE POLICY "Users can update own profile (non-admin)" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND is_admin = public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update any profile" ON public.user_profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Create a secure view for public listings that excludes contact_info
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
  is_demo,
  metadata,
  created_at,
  updated_at
FROM listings
WHERE status = 'active';

-- Create a function to get contact info only if user has access
-- SECURITY DEFINER runs with elevated privileges
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

-- Create a function to check if user has access to contact info
-- SECURITY DEFINER runs with elevated privileges
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

-- Create a function to create payment with server-side validation
-- Validates listing_id exists and calculates correct fee
CREATE OR REPLACE FUNCTION create_payment(
  p_listing_id UUID,
  p_receipt_url TEXT,
  p_payment_method TEXT
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

  -- Reject demo listings
  IF v_listing.is_demo = true THEN
    RAISE EXCEPTION 'Demo listings do not accept payments';
  END IF;

  -- Calculate correct fee based on listing's fee_type
  IF v_listing.fee_type = 'custom' THEN
    v_fee_amount := COALESCE(v_listing.custom_fee, 0);
  ELSE
    -- Get category fee
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
    receipt_url,
    status
  ) VALUES (
    p_listing_id,
    auth.uid(),
    v_fee_amount,
    p_payment_method,
    p_receipt_url,
    'pending'
  ) RETURNING id INTO v_payment_id;

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_contact_info(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_contact_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_payment(UUID, TEXT, TEXT) TO authenticated;

-- Insert initial categories
INSERT INTO categories (name, slug, icon, description) VALUES
  ('ግንብ ሰራተኞች', 'construction-workers', '👷', 'የግንብ ሰራተኞች እና የግንብ አገልግሎቶች'),
  ('ቤቶች ለኪሳ', 'houses-for-rent', '🏠', 'ቤቶች እና አፓርትማንቶች ለኪሳ'),
  ('ቱቶርስ', 'tutors', '📚', 'የትምህርት ቱቶርስ እና ጠቃሚ ትምህርቶች');

-- Insert default category fees
INSERT INTO category_fees (category_id, fee_amount)
SELECT id, 50.00 FROM categories;

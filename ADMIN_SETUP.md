# Admin Panel Setup — Required Manual Steps

## 1. Run these SQL statements in Supabase SQL Editor

Open: https://supabase.com/dashboard/project/ebuqyhpvtqakhzeowrll/sql/new

### A. Create the verify_payment function (if not already present)

```sql
CREATE OR REPLACE FUNCTION verify_payment(
  p_payment_id UUID,
  p_approved BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  v_payment RECORD;
BEGIN
  -- Get and lock the payment row
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id
  AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or already reviewed';
  END IF;

  -- Block demo listing payments
  IF EXISTS (
    SELECT 1 FROM listings WHERE id = v_payment.listing_id AND is_demo = true
  ) THEN
    RAISE EXCEPTION 'Demo listing payments cannot be approved';
  END IF;

  IF p_approved THEN
    -- Mark verified
    UPDATE payments SET
      status = 'verified',
      verified_at = NOW(),
      verified_by = auth.uid()
    WHERE id = p_payment_id;

    -- Create contact_access record
    INSERT INTO contact_access (payment_id, user_id, listing_id)
    VALUES (p_payment_id, v_payment.user_id, v_payment.listing_id)
    ON CONFLICT (user_id, listing_id) DO NOTHING;
  ELSE
    -- Mark rejected
    UPDATE payments SET
      status = 'rejected',
      verified_at = NOW(),
      verified_by = auth.uid()
    WHERE id = p_payment_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant to authenticated users (admin check is inside the function via RLS)
GRANT EXECUTE ON FUNCTION public.verify_payment(UUID, BOOLEAN) TO authenticated;
```

### B. Create the listing-images storage bucket

```sql
-- Run in SQL editor OR do via Storage dashboard
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload
CREATE POLICY "Admins can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images'
  AND public.is_admin(auth.uid())
);

-- Public read
CREATE POLICY "Listing images are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Admins can delete
CREATE POLICY "Admins can delete listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images'
  AND public.is_admin(auth.uid())
);
```

### C. Receipts bucket policies (if not already set)

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts'
  AND public.is_admin(auth.uid())
);
```

---

## 2. Make yourself an admin

After signing in with Google, run this in Supabase SQL Editor.
Replace the email with your actual Google account email:

```sql
UPDATE public.user_profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@gmail.com'
);
```

Verify it worked:
```sql
SELECT id, full_name, is_admin FROM public.user_profiles WHERE is_admin = true;
```

---

## 3. After running the SQL

1. Sign out of the app
2. Sign back in with Google
3. Navigate to http://localhost:5173/admin
4. You should see the admin dashboard

---

## Security notes

- Admin status is checked server-side via `public.is_admin(auth.uid())` inside RLS policies
- The `is_admin` field cannot be set by users themselves (enforced by RLS policy)
- Only admins can create/update/delete listings
- The `verify_payment` function validates listing ownership and blocks demo listings at the database level
- Receipt files are in a private bucket — only admins can read them

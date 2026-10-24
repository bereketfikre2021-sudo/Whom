-- Storage Policies for Receipts Bucket
-- Run this in Supabase SQL Editor after creating the 'receipts' bucket

-- Enable RLS on storage (if not already enabled)
-- Note: Storage RLS is enabled by default in Supabase

-- Policy: Users can upload receipts to their own folder
-- Files must be named as: user_id/filename
CREATE POLICY "Users can upload receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own receipts
CREATE POLICY "Users can view own receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can view all receipts
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

-- Policy: Users can delete their own receipts
CREATE POLICY "Users can delete own receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can delete any receipt
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

-- Storage Policies for Listings Bucket (public read, admin write)

-- Policy: Public can view listing images
CREATE POLICY "Public can view listing images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'listings');

-- Policy: Admins can upload listing images
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

-- Policy: Admins can delete listing images
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

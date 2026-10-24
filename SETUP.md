# Manual Supabase Configuration Guide

This guide provides step-by-step instructions for manually configuring Supabase for the ምን እናቅርብሎት? marketplace.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Project code available locally

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `men-en-akrblot` (or your preferred name)
   - Database Password: Generate a strong password and save it
   - Region: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Run Database Schema

1. In your Supabase dashboard, navigate to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste it into the SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. Verify no errors appear in the results

**What this does:**
- Creates all required tables (categories, listings, payments, etc.)
- Sets up Row-Level Security (RLS) policies
- Creates security functions for contact info access
- Inserts initial categories and default fees

## Step 3: Create Storage Buckets

### Create 'listings' bucket (public)

1. Navigate to **Storage** (left sidebar)
2. Click "Create a new bucket"
3. Name: `listings`
4. Make bucket **public** (toggle switch)
5. Click "Create bucket"

### Create 'receipts' bucket (private)

1. Click "Create a new bucket" again
2. Name: `receipts`
3. Keep bucket **private** (toggle switch OFF)
4. Click "Create bucket"

## Step 4: Configure Storage Security Policies

1. Navigate to the **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-storage-policies.sql` from your project
4. Paste it into the SQL Editor
5. Click "Run"
6. Verify no errors appear

**What this does:**
- Allows users to upload receipts to their own folder
- Allows admins to view all receipts
- Allows public to view listing images
- Restricts listing image uploads to admins only
- Enforces user-specific folder access for receipts

## Step 5: Get Supabase Credentials

1. In Supabase dashboard, navigate to **Project Settings** (gear icon, left sidebar)
2. Click **API** in the sidebar
3. Copy the following values:
   - **Project URL** (under "Project API keys")
   - **anon public** key (under "Project API keys")

## Step 6: Configure Local Environment

1. In your project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Save the file

## Step 7: Create Admin User

### Option A: Through the App (Recommended)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173 in your browser
3. Click "Register"
4. Fill in your details and create an account
5. After registration, go to Supabase dashboard

### Option B: Through Supabase Dashboard

1. Navigate to **Authentication** → **Users** in Supabase dashboard
2. Click "Add user" → "Create new user"
3. Fill in email and password
4. Click "Create user"

### Set Admin Privileges

1. Navigate to **Table Editor** in Supabase dashboard
2. Click on the `user_profiles` table
3. Find your user row (by email or ID)
4. Click on the `is_admin` column
5. Change the value from `false` to `true`
6. Click "Save"

## Step 8: Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   2. Open http://localhost:5173
   3. Log in with your admin account
   4. Navigate to /admin
   5. You should see the admin dashboard
   6. Create a test listing to verify everything works

## Step 9: Test Payment Flow (Optional but Recommended)

1. Create a test user account (not admin)
2. Log in as the test user
3. Navigate to a listing
4. Click "Unlock Contact"
5. Submit a test payment with a dummy receipt
6. Log out and log in as admin
7. Navigate to /admin/payments
8. Verify the payment appears
9. Approve or reject the payment
10. Log back in as test user
11. Verify contact info is now accessible

## Troubleshooting

### "Bucket not found" error
- Ensure you created both `listings` and `receipts` buckets
- Check bucket names match exactly (case-sensitive)

### "Permission denied" on storage upload
- Verify storage policies were applied from `supabase-storage-policies.sql`
- Check that the receipts bucket is private, not public

### "Contact info not showing" after payment approval
- Verify the payment status changed to 'verified'
- Check the `contact_access` table for a record
- Ensure the secure functions are working in the database

### Admin panel not accessible
- Verify `is_admin` is set to `true` in `user_profiles` table
- Check that you're logged in with the correct user
- Clear browser cache and try again

### RLS policy errors
- Ensure you ran the complete `supabase-schema.sql` file
- Check that RLS is enabled on all tables
- Verify no policy conflicts exist

## Security Checklist

Before going to production, verify:

- [ ] `receipts` bucket is private (not public)
- [ ] Storage policies are applied
- [ ] RLS is enabled on all tables
- [ ] Admin flag can only be set via dashboard (not through app)
- [ ] Contact info is not selected in frontend queries
- [ ] Payment verification checks for 'pending' status
- [ ] Contact access has UNIQUE constraint on (user_id, listing_id)
- [ ] User profile UPDATE policy prevents self-promotion to admin

## Next Steps

After completing this setup:

1. Test all user flows thoroughly
2. Review the security audit report
3. Configure production environment variables
4. Deploy to Vercel or Netlify
5. Add custom domain (optional)
6. Monitor Supabase usage dashboard

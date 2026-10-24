# Admin Setup Guide — ምን እናቅርብ

## 1. Database SQL Migrations

These SQL files must be run in the **Supabase SQL Editor** (Dashboard → SQL Editor → New Query).

### 1a. verify_payment function (required for payment verification)

Open `supabase-verify-payment.sql` and paste its full contents into the SQL editor, then click Run.

This creates the `verify_payment(p_payment_id, p_approved)` stored function that the admin payments page calls when approving or rejecting payments.

### 1b. Receipt column rename (only if DB was created before this fix)

If the `payments` table was created from the old schema (which had `receipt_image` instead of `receipt_url`), run:

```sql
ALTER TABLE payments RENAME COLUMN receipt_image TO receipt_url;
```

Or paste the contents of `supabase-fix-receipt-column.sql` into the SQL editor.

If you are setting up the project for the first time using `supabase-schema.sql`, this step is not needed — the schema already uses `receipt_url`.

### 1c. Fix existing demo listings to appear on homepage (if demos were seeded before the fix)

If demo listings were already inserted but are not appearing on the homepage, run:

```sql
UPDATE listings SET featured = true WHERE is_demo = true;
```

---

## 2. Google OAuth Setup

1. Go to your **Supabase Dashboard** → Authentication → Providers → Google.
2. Toggle Google **Enabled**.
3. Enter your **Google Client ID** and **Google Client Secret** from the [Google Cloud Console](https://console.cloud.google.com/).
4. Set the **Authorized redirect URIs** in Google Cloud Console to:
   - Development: `http://localhost:5173/auth/callback` (or use Supabase's generated callback URL)
   - Production: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
5. In Supabase Dashboard → Authentication → URL Configuration:
   - **Site URL**: `http://localhost:5173` (for dev), or your production URL
   - **Redirect URLs**: add `http://localhost:5173/**` for development

---

## 3. Making a User an Admin

After a user signs in, run this in the Supabase SQL editor (replace `<user_uuid>` with the actual UUID from `auth.users`):

```sql
UPDATE user_profiles SET is_admin = true WHERE id = '<user_uuid>';
```

---

## 4. Environment Variables

Ensure the following are set in `.env.local`:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Never commit these values to version control.

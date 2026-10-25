# Fix Google Sign-In (Required Manual Step)

Google OAuth is **enabled** in your Supabase project but the redirect URL is blank,
which is why clicking "Continue with Google" either fails or loops back without logging you in.

## Step 1 — Set the Site URL in Supabase

1. Open: https://supabase.com/dashboard/project/ebuqyhpvtqakhzeowrll/auth/url-configuration
2. Under **Site URL**, enter:
   ```
   http://localhost:5173
   ```
3. Under **Redirect URLs**, add:
   ```
   http://localhost:5173/
   http://localhost:5173
   ```
4. Click **Save**

> When you deploy to production, add your production URL here too (e.g. `https://yourdomain.com`).

## Step 2 — Add redirect URL in Google Cloud Console

Your Google OAuth app also needs to allow the Supabase callback URL.

1. Open: https://console.cloud.google.com/apis/credentials
2. Find the OAuth 2.0 Client ID used for this project
3. Under **Authorized redirect URIs**, make sure this is present:
   ```
   https://ebuqyhpvtqakhzeowrll.supabase.co/auth/v1/callback
   ```
4. Save

## After these two steps

Restart the dev server and try "Continue with Google" again — it should work.

## What was already confirmed working

- ✅ Supabase project is live and reachable
- ✅ `sb_publishable_` key is valid (Supabase v2 new format)  
- ✅ Google provider is enabled in Supabase Auth settings
- ✅ All 9 demo listings are in the database and active
- ✅ Categories are correctly set up
- ❌ Site URL is blank → OAuth redirect fails (fix above)

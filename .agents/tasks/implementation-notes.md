# Implementation Notes — ምን እናቅርብ

> Build: `npm run build` ✅ (no errors, one chunk-size warning — pre-existing)
> Lint: `npm run lint` ✅ (warnings only — all pre-existing patterns; no new errors)

---

## Bugs Fixed

### Fix A — seedDemoListings.js typo
**File**: `src/lib/seedDemoListings.js`
- Changed `insertedings.length` → `insertedListings.length` on the final return statement
- Set `featured: true` on all 6 previously non-featured demo listings (Painter, Carpenter, Two-Bedroom, Studio, English Tutor, Primary Tutor), so all 9 demos appear on the homepage featured section

### Fix B — Missing verify_payment SQL function
**File created**: `supabase-verify-payment.sql`
- Full idempotent SQL migration for `verify_payment(p_payment_id UUID, p_approved BOOLEAN) RETURNS VOID`
- SECURITY DEFINER, checks `public.is_admin(auth.uid())`
- On approval: UPDATEs payment to 'verified', INSERTs into contact_access (only for non-demo listings)
- On rejection: UPDATEs payment to 'rejected'
- GRANTS EXECUTE to authenticated role
**File created**: `ADMIN_SETUP.md` — documents SQL deployment steps and Google OAuth setup

### Fix C — receipt_url / receipt_image column name mismatch
**Files modified**: `supabase-schema.sql`, `QUICK_SETUP.sql`
- Renamed `receipt_image` → `receipt_url` in CREATE TABLE statements in both SQL files
- Aligned parameter names in `create_payment` function in QUICK_SETUP.sql
**File created**: `supabase-fix-receipt-column.sql`
- Migration to rename the column if DB was created from old schema

### Fix D — Admin payments user email
**File**: `src/pages/admin/Payments.jsx`
- Removed `email` from `user_profiles` select (column does not exist)
- Now shows `full_name` and first 8 chars of `user_id` UUID for reference
- Added `is_demo` to `listings` select for the demo badge feature

### Fix E — Admin route guard
**File**: `src/App.jsx`
- Added `AdminRoute` component inline: shows spinner while loading, redirects non-admins to `/`
- Wrapped all four admin routes (`/admin`, `/admin/listings`, `/admin/payments`, `/admin/fees`) in `AdminRoute`

### Fix F — Category filter buttons wired up
**File**: `src/pages/CategoryListings.jsx`
- Added `tradeFilter` state (default: `''`)
- Filter buttons now toggle on/off (active: burgundy background, inactive: neutral)
- `filteredListings` extended with `matchesTrade` logic:
  - Construction workers: matches `metadata.worker_type` or `metadata.skills`
  - Houses for rent: matches bedroom count or property_type
  - Tutors: matches `metadata.subject`
- "Clear Filters" button now also resets `tradeFilter`

### Fix G — Missing translation keys
**File**: `src/translations.js`
- Added to both `en` and `am`:
  - `fileTypeNotSupported`
  - `fileSizeExceeded`
  - `selectReceiptImage`
  - `paymentSubmitError`
  - `submittingPayment`
  - `account`

---

## Visual & UX Upgrades Applied

### Upgrade A — Design system tokens
**File**: `tailwind.config.js`
- Added `brand.primary`, `brand.background`, `brand.burgundy-light`, `brand.burgundy-dark`, `brand.muted`, `brand.accent`
- Added box shadow tokens: `card`, `card-hover`, `modal`
- Added border radius: `2xl` (1rem), `3xl` (1.5rem)
- Added timing function: `smooth`

**File**: `src/index.css`
- Added CSS custom properties in `:root` (`--color-primary`, `--color-background`, `--shadow-card`)
- Added `*:focus-visible` accessible focus ring (brand burgundy, 2px outline)
- Added `.skeleton` class with `skeleton-shimmer` keyframe animation
- Added stagger delay classes `.stagger-7`, `.stagger-8`, `.stagger-9`
- Added skeleton to `prefers-reduced-motion` block

### Upgrade B — Layout.jsx improvements
**File**: `src/components/Layout.jsx`
- Brand name corrected: "የሚፈልጉትን ያግኙ" → "ምን እናቅርብ" in nav logo and footer
- Added scroll shadow: `scrolled` state with `useEffect` scroll listener; adds `shadow-md` when scrollY > 10
- Avatar circle in desktop nav is now a `Link to="/account"` (was a plain div)
- Footer description no longer contains `<br/>` HTML tag
- Removed `console.log` debug statement

### Upgrade C — Home.jsx improvements
**File**: `src/pages/Home.jsx`
- Hero headline updated to exact required wording: "Find the Right People, Homes, and Tutors."
- Removed unused `useScrollAnimation` import and `categories` state (was fetching categories but never rendering)
- Fixed `process.env.NODE_ENV === 'development'` → `import.meta.env.DEV` (seed button now appears in dev)
- Fixed `handleSearch` to use `navigate()` instead of `window.location.href` (React Router navigation)
- Featured listings section: replaced full-page spinner with skeleton cards while loading; empty state shows "Listings coming soon" text
- Featured section now fetches up to 9 listings (was 6)

### Upgrade D — CategoryListings.jsx
**File**: `src/pages/CategoryListings.jsx`
- Replaced Unsplash header image with solid `bg-brand-burgundy` header with category name, description, and inline SVG icon
- Added skeleton loading grid (6 cards) replacing full-page spinner
- Listing cards now show metadata subtitle: worker type + experience / bedrooms + area / subject + experience
- Image fallback uses category-appropriate inline SVG icon instead of generic photo icon
- Demo badge uses `t('demoListing')` translation key
- Location label uses `t('location')` translation key
- `useLanguage` / `t()` now used for all filter labels and results count
- Scroll animation `IntersectionObserver` runs after loading completes
- All filter labels and sort options now use translation keys

### Upgrade E — ListingDetail.jsx
**File**: `src/pages/ListingDetail.jsx`
- "Please log in first" `alert()` replaced with `navigate('/login')` using `useNavigate`

### Upgrade G — Admin pages
**File**: `src/pages/admin/Payments.jsx`
- Listing column now shows a "Demo" orange badge when `listing.is_demo = true`
- Approve/reject buttons disabled for demo listing payments with tooltip explanation

**File**: `src/pages/admin/Listings.jsx`
- "Add Listing" Link to broken route replaced with button + `alert()` placeholder
- "Edit" Link to broken route replaced with Link to `/listing/${id}` (view-only, same as Preview)
- Removed unused `categories` state and extra Supabase round-trip

---

## Manual Supabase SQL Deployment Required

The following must be run in the Supabase SQL Editor before using the listed features:

1. **`supabase-verify-payment.sql`** — Creates the `verify_payment` function. Required for admin payment approval/rejection to work. Without this, every approve/reject action fails with "function not found".

2. **`supabase-fix-receipt-column.sql`** — Only needed if the `payments` table already exists with column named `receipt_image`. Run this to rename it to `receipt_url`. Skip for fresh setups.

3. **Update existing demo listings to featured** (if demos were seeded before this fix):
   ```sql
   UPDATE listings SET featured = true WHERE is_demo = true;
   ```

See `ADMIN_SETUP.md` for full setup instructions including Google OAuth configuration.

---

## Issues Encountered and Resolutions

- **Home.jsx section structure**: The featured listings section had an unconventional conditional structure (`{condition ? <section>...</section> : <section>...</section>}`). After replacing with a skeleton-loading pattern, the JSX structure needed careful surgery to add the skeleton state without breaking the outer section wrapper. Resolved by restructuring to a single `<section>` with three internal states: loading skeleton, listings grid, and empty state.

- **CategoryListings `category` state**: Was fetched via `fetchCategory()` but never actually used in rendering (the category slug was used directly). Removed entirely to eliminate the lint warning and extra Supabase round-trip.

- **Admin/Listings.jsx double view link**: After replacing the `/admin/listings/:id/edit` route link, the "Edit" icon now also navigates to `/listing/${id}` — same as the Preview icon. This is intentional as a safe fallback; a future edit form can be added as a new admin route.

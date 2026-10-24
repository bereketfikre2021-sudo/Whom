-- ============================================================
-- verify_payment function migration
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- before using the payment verification feature in the admin panel.
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_payment(
  p_payment_id UUID,
  p_approved  BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
BEGIN
  -- Admin-only check
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can verify payments';
  END IF;

  -- Fetch the pending payment
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or already processed';
  END IF;

  IF p_approved THEN
    -- Mark payment as verified
    UPDATE payments
    SET status      = 'verified',
        verified_at = NOW(),
        verified_by = auth.uid()
    WHERE id = p_payment_id AND status = 'pending';

    -- Grant contact access only for non-demo listings
    INSERT INTO contact_access (payment_id, user_id, listing_id)
    SELECT p.id, p.user_id, p.listing_id
    FROM payments p
    JOIN listings l ON l.id = p.listing_id
    WHERE p.id = p_payment_id
      AND l.is_demo = false
    ON CONFLICT (user_id, listing_id) DO NOTHING;
  ELSE
    -- Reject the payment
    UPDATE payments
    SET status      = 'rejected',
        verified_at = NOW(),
        verified_by = auth.uid()
    WHERE id = p_payment_id AND status = 'pending';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_payment(UUID, BOOLEAN) TO authenticated;

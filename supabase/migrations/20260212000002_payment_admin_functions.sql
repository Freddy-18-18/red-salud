-- Function to get all payments (Admin specific)
CREATE OR REPLACE FUNCTION get_admin_payments(status_filter text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  amount numeric,
  currency text,
  reference_number text,
  bank_origin text,
  payment_date timestamptz,
  status payment_status,
  proof_url text,
  created_at timestamptz,
  user_email text,
  user_full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- TODO: Add specific Admin Role check here
  -- IF (auth.jwt() ->> 'role') != 'admin' THEN RAISE EXCEPTION 'Not authorized'; END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.amount,
    p.currency,
    p.reference_number,
    p.bank_origin,
    p.payment_date,
    p.status,
    p.proof_url,
    p.created_at,
    u.email::text as user_email,
    (u.raw_user_meta_data->>'full_name')::text as user_full_name
  FROM payments p
  LEFT JOIN auth.users u ON p.user_id = u.id
  WHERE (status_filter IS NULL OR p.status::text = status_filter)
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to update payment status (Admin specific)
CREATE OR REPLACE FUNCTION admin_update_payment_status(payment_id uuid, new_status payment_status)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE payments
  SET status = new_status,
      updated_at = now()
  WHERE id = payment_id;

  RETURN FOUND;
END;
$$;

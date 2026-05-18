-- ============================================================================
-- Payments — extend for appointment pre-payment flow
-- ============================================================================
-- The original `payments` table was modeled around a Venezuelan bank-transfer
-- proof-upload flow (bank_origin, reference_number, proof_url, payment_date).
-- The patient appointment flow needs a few additions:
--   - `appointment_id` so we can show "pago de tu cita con Dr. X" in the
--     historial without joining heuristically.
--   - `payment_method` to support efectivo / zelle / tarjeta beyond bank
--     transfers.
--   - `payment_type` so the historial can group por consulta / lab / farmacia.
--   - `description` for human-readable notes (e.g. "Cita con Dr. Pérez").
--   - Make `bank_origin` nullable: efectivo and zelle don't have one.
-- ============================================================================

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS appointment_id UUID
    REFERENCES public.appointments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'consulta',
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.payments
  ALTER COLUMN bank_origin DROP NOT NULL;

-- Method constraint — match the dialog choices on the frontend.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_payment_method_chk'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_payment_method_chk
        CHECK (
          payment_method IS NULL
          OR payment_method IN (
            'pago_movil',
            'transferencia',
            'efectivo',
            'zelle',
            'tarjeta_credito',
            'tarjeta_debito'
          )
        );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS payments_user_status_date_idx
  ON public.payments (user_id, status, payment_date DESC);

CREATE INDEX IF NOT EXISTS payments_appointment_idx
  ON public.payments (appointment_id)
  WHERE appointment_id IS NOT NULL;

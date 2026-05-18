-- ============================================================================
-- Patient saved payment methods
-- ============================================================================
-- The PaymentDialog asks the patient for method + reference every time. Most
-- patients pay the same way (one Pago Móvil number, one Zelle email) — saving
-- methods lets the dialog auto-fill the reference channel and show recent
-- options as one-click chips.
--
-- We deliberately do NOT store full card numbers or full account numbers.
-- card_last_four + bank_name is enough to identify a card visually; the
-- actual processor handles the rest.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'pago_movil',
    'transferencia',
    'efectivo',
    'zelle',
    'tarjeta_credito',
    'tarjeta_debito'
  )),
  label TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,

  -- Card (we only ever keep the last 4)
  card_last_four TEXT CHECK (card_last_four IS NULL OR card_last_four ~ '^\d{4}$'),
  card_brand TEXT,

  -- Pago Móvil
  pago_movil_bank_code TEXT,
  pago_movil_phone TEXT,
  pago_movil_cedula TEXT,

  -- Bank transfer
  bank_name TEXT,
  account_last_four TEXT CHECK (account_last_four IS NULL OR account_last_four ~ '^\d{1,6}$'),

  -- Zelle
  zelle_email TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A patient can flag at most ONE method as default. The partial unique index
-- enforces this without affecting non-default rows.
CREATE UNIQUE INDEX IF NOT EXISTS patient_payment_methods_default_unique
  ON public.patient_payment_methods (patient_id)
  WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS patient_payment_methods_patient_idx
  ON public.patient_payment_methods (patient_id);

ALTER TABLE public.patient_payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS paciente_methods_select ON public.patient_payment_methods;
CREATE POLICY paciente_methods_select
  ON public.patient_payment_methods
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS paciente_methods_insert ON public.patient_payment_methods;
CREATE POLICY paciente_methods_insert
  ON public.patient_payment_methods
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS paciente_methods_update ON public.patient_payment_methods;
CREATE POLICY paciente_methods_update
  ON public.patient_payment_methods
  FOR UPDATE TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS paciente_methods_delete ON public.patient_payment_methods;
CREATE POLICY paciente_methods_delete
  ON public.patient_payment_methods
  FOR DELETE TO authenticated
  USING (patient_id = auth.uid());

-- updated_at maintenance — reuse the small helper from waitlist if present,
-- otherwise inline it.
CREATE OR REPLACE FUNCTION public.set_patient_payment_methods_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_patient_payment_methods_updated_at
  ON public.patient_payment_methods;
CREATE TRIGGER trg_patient_payment_methods_updated_at
  BEFORE UPDATE ON public.patient_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.set_patient_payment_methods_updated_at();

-- When a row is marked as the new default, demote any other row of the same
-- patient. Avoids a race where two rows briefly hold is_default=true between
-- two concurrent updates (the partial index would catch it but with a 23505
-- error the user shouldn't have to see).
CREATE OR REPLACE FUNCTION public.demote_other_payment_methods()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.is_default IS TRUE THEN
    UPDATE public.patient_payment_methods
    SET is_default = FALSE
    WHERE patient_id = NEW.patient_id
      AND id <> NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_demote_other_payment_methods
  ON public.patient_payment_methods;
CREATE TRIGGER trg_demote_other_payment_methods
  AFTER INSERT OR UPDATE OF is_default ON public.patient_payment_methods
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION public.demote_other_payment_methods();

COMMENT ON TABLE public.patient_payment_methods IS
  'Saved payment methods per patient. RLS scopes to auth.uid(). Only the default flag is unique per-patient.';

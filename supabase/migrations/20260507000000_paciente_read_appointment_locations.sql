-- ============================================================================
-- Paciente RLS — read locations and organizations of own appointments
-- ============================================================================
-- The clinica multitenant foundation (20260501100000) scoped both
-- `organization_locations` and `organizations` SELECT to org members. That
-- excludes pacientes, who are NOT org members but absolutely need to see
-- WHERE their appointment is happening (sede name, address, phone) and the
-- parent clinic name.
--
-- Without these policies the paciente UI is forced to either render
-- "Sede a confirmar" forever (broken UX) or use a service-role bypass
-- (dangerous and out of bounds for a BFF). The right answer is a narrow,
-- self-anchored RLS rule: a paciente can read the rows of locations and
-- organizations that THEIR appointments reference, and nothing else.
-- ============================================================================

-- Locations: paciente can read every location where they have an appointment.
-- Includes cancelled/completed visits so historial keeps working.

DROP POLICY IF EXISTS paciente_read_appointment_locations
  ON public.organization_locations;

CREATE POLICY paciente_read_appointment_locations
  ON public.organization_locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.appointments a
      WHERE a.location_id = organization_locations.id
        AND a.patient_id = auth.uid()
        AND a.deleted_at IS NULL
    )
  );

-- Organizations: paciente can read every clinic that owns at least one
-- location they have an appointment at. Same anchor pattern.

DROP POLICY IF EXISTS paciente_read_appointment_orgs
  ON public.organizations;

CREATE POLICY paciente_read_appointment_orgs
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.appointments a
      JOIN public.organization_locations ol ON ol.id = a.location_id
      WHERE ol.organization_id = organizations.id
        AND a.patient_id = auth.uid()
        AND a.deleted_at IS NULL
    )
  );

-- Supporting indexes — appointments(patient_id) and appointments(location_id)
-- exist already from the multitenant foundation. The two `EXISTS` queries
-- above will drive plans through those indexes without further work.

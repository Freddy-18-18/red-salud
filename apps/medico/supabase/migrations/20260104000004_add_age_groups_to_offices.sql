
# 20260104000004_add_age_groups_to_offices.sql

ALTER TABLE public.doctor_offices
ADD COLUMN patient_age_groups TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.doctor_offices.patient_age_groups IS 'List of age groups treated at this office (e.g., Infants, Children, Adults, Seniors)';

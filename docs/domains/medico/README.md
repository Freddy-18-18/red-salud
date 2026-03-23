# Medico Domain

The doctor/medical professional domain handles all clinical workflows for healthcare providers.

## Key Features

- **Appointments & Agenda**: Calendar with duration-based slots, drag-and-drop, overlap detection
- **Specialty-Aware Dashboards**: Dynamic modules based on specialty (e.g., odontology gets periodontograma, morning huddle)
- **Professional Verification**: Multi-level verification system (SACS for doctors, manual for other health professionals)
- **Clinical Records**: SOAP notes, prescriptions, diagnoses (ICD-11 with Gemini AI suggestions)
- **Odontology Modules**: Periodontograma, dental imaging, treatment estimates, lab tracking
- **Morning Huddle**: Real-time operations dashboard for dental offices
- **Google Calendar Integration**: Bidirectional sync with external calendars
- **Telemedicine**: Video consultations via tele-dentology

## Routes

- `/dashboard/medico` - Main doctor dashboard
- `/dashboard/medico/citas` - Appointments hub (Agenda, Operations, Waitlist tabs)
- `/dashboard/medico/odontologia/periodontograma` - Periodontal charting
- `/dashboard/medico/odontologia/morning-huddle` - Operations dashboard
- `/dashboard/medico/perfil/setup` - Profile setup and verification

## Domain Docs

- [Periodontograma](./periodontograma.md) - Periodontal charting implementation
- [Verification](./verification.md) - Professional verification system
- [SACS Integration](./sacs-integration.md) - SACS credential verification
- [Specialties](./specialties.md) - Specialty experience system

## Key Files

- Layout: `apps/web/app/dashboard/medico/layout.tsx`
- Specialty engine: `apps/web/lib/specialty-experience/engine.ts`
- Services: `apps/web/lib/supabase/services/`
- Calendar: `apps/web/components/dashboard/medico/calendar/`

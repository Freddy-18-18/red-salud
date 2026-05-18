'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CLINIC_PROFILE_TEMPLATES,
  type ClinicProfileTemplate,
  type CreateOrganizationLocationInput,
  type InviteMemberInput,
  type Organization,
  type OrganizationBranding,
} from '@red-salud/types';
import { ProfileStep } from './steps/01-profile-step';
import { BasicsStep } from './steps/02-basics-step';
import { LocationStep } from './steps/03-location-step';
import { BrandingStep } from './steps/04-branding-step';
import { ModulesStep } from './steps/05-modules-step';
import { TeamStep } from './steps/06-team-step';
import { ReviewStep } from './steps/07-review-step';
import { CompleteStep } from './steps/08-complete-step';
import { useCreateOrganization } from '@/lib/hooks/use-organization';
import { createLocation } from '@/lib/db/locations';
import { bulkEnableModules } from '@/lib/db/modules';
import { inviteMember } from '@/lib/db/members';
import { updateOrganization, completeOnboarding } from '@/lib/db/organizations';

const STEP_TITLES = [
  'Tipo de clinica',
  'Datos basicos',
  'Primera sede',
  'Branding',
  'Modulos',
  'Equipo',
  'Revision',
  'Listo',
];

export interface OnboardingWizardProps {
  existingOrganization: Organization | null;
}

export interface WizardData {
  template: ClinicProfileTemplate | null;
  name: string;
  slug: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  primary_specialty: string;
  location: Partial<CreateOrganizationLocationInput>;
  branding: OrganizationBranding;
  selected_modules: string[];
  invites: Array<Pick<InviteMemberInput, 'email' | 'role'>>;
}

const DEFAULT_BRANDING: OrganizationBranding = {
  logo_url: null,
  icon_url: null,
  primary_color: '#0066FF',
  secondary_color: '#6B7280',
  accent_color: '#10B981',
  font_family: 'Inter',
  ui_density: 'comfortable',
  terminology: { patient: 'paciente', appointment: 'cita', consultation: 'consulta' },
};

export function OnboardingWizard({ existingOrganization }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(existingOrganization ? 1 : 0);
  const [organizationId, setOrganizationId] = useState<string | null>(
    existingOrganization?.id ?? null,
  );
  const [createdSlug, setCreatedSlug] = useState<string | null>(
    existingOrganization?.slug ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<WizardData>({
    template: null,
    name: existingOrganization?.name ?? '',
    slug: existingOrganization?.slug ?? '',
    legal_name: existingOrganization?.legal_name ?? '',
    tax_id: existingOrganization?.tax_id ?? '',
    email: existingOrganization?.email ?? '',
    phone: existingOrganization?.phone ?? '',
    primary_specialty: existingOrganization?.primary_specialty ?? '',
    location: { country_code: 'VE' },
    branding: existingOrganization?.branding ?? DEFAULT_BRANDING,
    selected_modules: [],
    invites: [],
  });

  const createOrg = useCreateOrganization();

  const updateData = (patch: Partial<WizardData>) => setData((prev) => ({ ...prev, ...patch }));

  const onSelectTemplate = (template: ClinicProfileTemplate) => {
    updateData({
      template,
      branding: {
        ...DEFAULT_BRANDING,
        terminology: template.default_terminology,
        ui_density: template.default_density,
      },
      selected_modules: template.default_modules,
    });
    setStep(1);
  };

  const handleCreateOrg = async () => {
    if (!data.template) return;
    setSubmitting(true);
    setError(null);
    try {
      const orgId = await createOrg.mutateAsync({
        name: data.name,
        slug: data.slug,
        type: data.template.organization_type,
        primary_specialty: data.primary_specialty || undefined,
      });
      setOrganizationId(orgId);
      setCreatedSlug(data.slug);
      setStep(2);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? 'No se pudo crear la organizacion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!organizationId || !data.location.name) return;
    setSubmitting(true);
    setError(null);
    try {
      await createLocation({
        organization_id: organizationId,
        name: data.location.name,
        is_main: true,
        address_line: data.location.address_line,
        city: data.location.city,
        state: data.location.state,
        country_code: data.location.country_code ?? 'VE',
        phone: data.location.phone,
        email: data.location.email,
        total_consultation_rooms: data.location.total_consultation_rooms ?? 0,
        total_beds: data.location.total_beds ?? 0,
        has_emergency: data.location.has_emergency ?? false,
        has_hospitalization: data.location.has_hospitalization ?? false,
        has_surgery_rooms: data.location.has_surgery_rooms ?? false,
        has_lab: data.location.has_lab ?? false,
        has_imaging: data.location.has_imaging ?? false,
      });
      setStep(3);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? 'No se pudo crear la sede');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!organizationId) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateOrganization(organizationId, {
        branding: data.branding,
        legal_name: data.legal_name || null,
        tax_id: data.tax_id || null,
        email: data.email || null,
        phone: data.phone || null,
      });
      setStep(4);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? 'No se pudo guardar el branding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveModules = async () => {
    if (!organizationId) return;
    setSubmitting(true);
    setError(null);
    try {
      await bulkEnableModules(organizationId, data.selected_modules);
      setStep(5);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? 'No se pudieron guardar los modulos');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTeam = async () => {
    if (!organizationId) return;
    setSubmitting(true);
    setError(null);
    try {
      for (const inv of data.invites) {
        if (!inv.email) continue;
        await inviteMember({ organization_id: organizationId, email: inv.email, role: inv.role });
      }
      setStep(6);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? 'No se pudieron enviar las invitaciones');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!organizationId) return;
    setSubmitting(true);
    setError(null);
    try {
      await completeOnboarding(organizationId);
      setStep(7);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? 'No se pudo completar el onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    if (createdSlug) {
      router.push(`/dashboard/${createdSlug}`);
    }
  };

  const progress = useMemo(() => Math.round(((step + 1) / 8) * 100), [step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Configuracion inicial</h1>
              <p className="text-xs text-slate-500">
                Paso {step + 1} de 8 — {STEP_TITLES[step]}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[rgb(var(--brand-primary))] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {step === 0 && (
          <ProfileStep templates={CLINIC_PROFILE_TEMPLATES} onSelect={onSelectTemplate} />
        )}
        {step === 1 && data.template && (
          <BasicsStep
            data={data}
            template={data.template}
            onChange={updateData}
            onBack={() => setStep(0)}
            onNext={handleCreateOrg}
            submitting={submitting}
          />
        )}
        {step === 2 && (
          <LocationStep
            data={data}
            onChange={updateData}
            onBack={() => setStep(1)}
            onNext={handleSaveLocation}
            submitting={submitting}
          />
        )}
        {step === 3 && (
          <BrandingStep
            data={data}
            onChange={updateData}
            onBack={() => setStep(2)}
            onNext={handleSaveBranding}
            submitting={submitting}
          />
        )}
        {step === 4 && (
          <ModulesStep
            data={data}
            onChange={updateData}
            onBack={() => setStep(3)}
            onNext={handleSaveModules}
            submitting={submitting}
          />
        )}
        {step === 5 && (
          <TeamStep
            data={data}
            onChange={updateData}
            onBack={() => setStep(4)}
            onNext={handleSaveTeam}
            submitting={submitting}
          />
        )}
        {step === 6 && (
          <ReviewStep
            data={data}
            onBack={() => setStep(5)}
            onNext={handleFinish}
            submitting={submitting}
          />
        )}
        {step === 7 && <CompleteStep data={data} onContinue={handleGoToDashboard} />}
      </main>
    </div>
  );
}

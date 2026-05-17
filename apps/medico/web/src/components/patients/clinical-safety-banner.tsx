'use client';

/**
 * @file clinical-safety-banner.tsx
 * @description Always-visible safety banner that surfaces allergies, active
 * chronic conditions and quick vitals (blood type + BMI + weight/height) at
 * the top of the patient detail view.
 *
 * Spec SC-2.1 / SC-2.2 of sdd/medico-pacientes-profesional Phase 2:
 *  - When `has_clinical_record === false` → "Sin información clínica
 *    registrada" empty state with a CTA to capture the data.
 *  - When `has_clinical_record === true`  → three-column layout with the
 *    critical context the doctor needs at a glance.
 *
 * Why a self-contained component (not driven by parent props): the banner is
 * meant to be drop-in. The integration phase only passes `patientId` and an
 * `onEditClick` callback; the banner owns its own data lifecycle (loading,
 * error, retry) so the parent can stay focused on tab orchestration.
 */

import {
  AlertTriangle,
  Heart,
  Pencil,
  ShieldAlert,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@red-salud/design-system';

import { usePatientClinicalOverview } from '@/hooks/use-patient-clinical-overview';
import { softMatchTag, type ChronicTag } from '@/lib/chronic/canonical-tags';

interface ClinicalSafetyBannerProps {
  patientId: string;
  /** Triggers the EditClinicalFieldsDialog at the parent level. */
  onEditClick?: () => void;
}

/** Spanish labels for the canonical chronic tags (CHRONIC_TAGS). */
const CHRONIC_LABELS: Record<ChronicTag, string> = {
  HTA: 'Hipertensión arterial',
  DM2: 'Diabetes tipo 2',
  DM1: 'Diabetes tipo 1',
  DISLIPIDEMIA: 'Dislipidemia',
  OBESIDAD: 'Obesidad',
  ERC: 'Enfermedad renal crónica',
  EPOC: 'EPOC',
  HIPOTIROIDISMO: 'Hipotiroidismo',
  HIPERTIROIDISMO: 'Hipertiroidismo',
};

interface BmiClassification {
  label: string;
  badgeClass: string;
}

/**
 * WHO BMI cutoffs — render-side classification only. We do NOT persist this
 * value; the raw `bmi` lives on the overview hook.
 */
function classifyBmi(bmi: number): BmiClassification {
  if (bmi < 18.5) {
    return { label: 'Bajo peso', badgeClass: 'bg-info/10 text-info' };
  }
  if (bmi < 25) {
    return { label: 'Normal', badgeClass: 'bg-success/10 text-success' };
  }
  if (bmi < 30) {
    return { label: 'Sobrepeso', badgeClass: 'bg-warning/10 text-warning' };
  }
  return { label: 'Obesidad', badgeClass: 'bg-destructive/10 text-destructive' };
}

function chronicTagLabel(slug: string): string {
  const canonical = softMatchTag(slug);
  if (canonical) return CHRONIC_LABELS[canonical];
  return slug;
}

export function ClinicalSafetyBanner({
  patientId,
  onEditClick,
}: ClinicalSafetyBannerProps) {
  const { overview, isLoading, error, refetch } = usePatientClinicalOverview({
    patientId,
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-medium text-destructive">
            No pudimos cargar la información clínica del paciente.
          </p>
          <p className="text-destructive/80 mt-1">{error.message}</p>
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="mt-2 inline-flex items-center text-xs font-medium text-destructive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Reintentá
          </button>
        </div>
      </div>
    );
  }

  if (!overview || !overview.has_clinical_record) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Sin información clínica registrada para este paciente.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Agregá alergias, condiciones crónicas y grupo sanguíneo para
              mantener el contexto clínico actualizado.
            </p>
          </div>
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <Pencil className="h-4 w-4" />
              Agregar información clínica
            </button>
          )}
        </div>
      </div>
    );
  }

  const bmi = overview.bmi;
  const bmiClass = bmi != null ? classifyBmi(bmi) : null;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Información clínica de seguridad
          </h3>
        </div>
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <BannerColumn
          title="Alergias"
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
        >
          {overview.alergias.length === 0 ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              Sin alergias registradas
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {overview.alergias.map((allergy) => (
                <span
                  key={allergy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {allergy}
                </span>
              ))}
            </div>
          )}
        </BannerColumn>

        <BannerColumn
          title="Condiciones activas"
          icon={<Activity className="h-4 w-4 text-warning" />}
        >
          {overview.enfermedades_cronicas.length === 0 ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              Sin condiciones crónicas
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {overview.enfermedades_cronicas.map((slug) => (
                <span
                  key={slug}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30"
                >
                  {chronicTagLabel(slug)}
                </span>
              ))}
            </div>
          )}
        </BannerColumn>

        <BannerColumn
          title="Datos vitales"
          icon={<Heart className="h-4 w-4 text-info" />}
        >
          <div className="grid grid-cols-3 gap-2">
            <QuickStat
              label="Tipo de sangre"
              value={overview.grupo_sanguineo ?? '--'}
            />
            <QuickStat
              label="Peso"
              value={overview.peso_kg != null ? `${overview.peso_kg} kg` : '--'}
            />
            <QuickStat
              label="Altura"
              value={
                overview.altura_cm != null ? `${overview.altura_cm} cm` : '--'
              }
            />
          </div>
          {bmi != null && bmiClass && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">IMC</span>
              <span className="text-sm font-semibold text-foreground">
                {bmi}
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${bmiClass.badgeClass}`}
              >
                {bmiClass.label}
              </span>
            </div>
          )}
        </BannerColumn>
      </div>
    </div>
  );
}

function BannerColumn({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h4>
      </div>
      <div>{children}</div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

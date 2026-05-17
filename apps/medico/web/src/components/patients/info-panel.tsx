'use client';

/**
 * @file info-panel.tsx
 * @description Combined Info tab for patient-detail: demographics + emergency
 * contacts + insurance + uploaded documents. Demographics come straight from
 * the `PatientFull` prop (already loaded by the parent); the other three
 * sections each issue their own `useQuery` so they degrade independently if
 * RLS gates a specific table.
 *
 * Why four sections in one component (vs four siblings):
 * - The Info tab is the natural home for "everything that isn't strictly
 *   clinical history". Keeping them grouped means the parent renders a
 *   single `<InfoPanel />` and we don't fragment the seam.
 */

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ExternalLink,
  FileText,
  IdCard,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { EmptyState, Skeleton } from '@red-salud/design-system';

import { supabase } from '@/lib/supabase/client';
import {
  listDocuments,
  listEmergencyContacts,
  listInsurance,
  type ServiceError,
} from '@/lib/supabase/services/patient-clinical-service';
import type {
  PatientDocumentRow,
  PatientEmergencyContactRow,
  PatientFull,
  PatientInsuranceRow,
} from '@red-salud/types';

interface InfoPanelProps {
  patient: PatientFull;
}

function calculateAge(dob: string | null): string {
  if (!dob) return '--';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '--';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} años`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Caracas',
  });
}

export function InfoPanel({ patient }: InfoPanelProps) {
  return (
    <div className="space-y-4">
      <DemographicsCard patient={patient} />
      <EmergencyContactsCard patientId={patient.id} />
      <InsuranceCard patientId={patient.id} />
      <DocumentsCard patientId={patient.id} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demographics — no query, lives entirely from the parent's PatientFull.
// ---------------------------------------------------------------------------

function DemographicsCard({ patient }: { patient: PatientFull }) {
  return (
    <SectionCard
      title="Demografía"
      icon={<User className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <InfoField label="Nombre completo" value={patient.full_name} />
        <InfoField label="Cédula" value={patient.national_id} />
        <InfoField
          label="Fecha de nacimiento"
          value={formatDate(patient.date_of_birth)}
        />
        <InfoField label="Edad" value={calculateAge(patient.date_of_birth)} />
        <InfoField
          label="Género"
          value={patient.gender ? capitalize(patient.gender) : null}
        />
        <InfoField label="Nacionalidad" value={patient.nationality} />
        <InfoField label="Teléfono" value={patient.phone} />
        <InfoField label="Email" value={patient.email} />
        <InfoField label="Ciudad" value={patient.city} />
        <InfoField label="Estado" value={patient.state} />
      </div>
    </SectionCard>
  );
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ---------------------------------------------------------------------------
// Emergency contacts
// ---------------------------------------------------------------------------

function EmergencyContactsCard({ patientId }: { patientId: string }) {
  const query = useQuery({
    queryKey: ['patients', 'emergency-contacts', patientId],
    queryFn: async () => {
      const result = await listEmergencyContacts(supabase, patientId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(patientId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  return (
    <SectionCard
      title="Contactos de emergencia"
      icon={<Users className="h-4 w-4 text-muted-foreground" />}
    >
      <AsyncBody
        loading={query.isLoading}
        error={query.isError ? (query.error as unknown as ServiceError) : null}
        onRetry={() => void query.refetch()}
        isEmpty={(query.data?.length ?? 0) === 0}
        emptyLabel="Sin contactos de emergencia registrados."
      >
        <ul className="space-y-2">
          {(query.data ?? []).map((contact) => (
            <EmergencyContactRow key={contact.id} contact={contact} />
          ))}
        </ul>
      </AsyncBody>
    </SectionCard>
  );
}

function EmergencyContactRow({
  contact,
}: {
  contact: PatientEmergencyContactRow;
}) {
  return (
    <li className="flex items-center gap-3 p-2.5 rounded-md border border-border/50 bg-card">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Phone className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {contact.name}
          </p>
          {contact.is_primary && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Principal
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {contact.phone}
          {contact.relationship && <> · {capitalize(contact.relationship)}</>}
        </p>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Insurance
// ---------------------------------------------------------------------------

function InsuranceCard({ patientId }: { patientId: string }) {
  const query = useQuery({
    queryKey: ['patients', 'insurance', patientId],
    queryFn: async () => {
      const result = await listInsurance(supabase, patientId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(patientId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  // We only surface ACTIVE policies in the Info tab — historical inactive
  // coverage adds noise without clinical value.
  const activePolicies = (query.data ?? []).filter((p) => p.is_active);

  return (
    <SectionCard
      title="Seguros"
      icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
    >
      <AsyncBody
        loading={query.isLoading}
        error={query.isError ? (query.error as unknown as ServiceError) : null}
        onRetry={() => void query.refetch()}
        isEmpty={activePolicies.length === 0}
        emptyLabel="Sin seguros activos registrados."
      >
        <ul className="space-y-2">
          {activePolicies.map((policy) => (
            <InsuranceRow key={policy.id} policy={policy} />
          ))}
        </ul>
      </AsyncBody>
    </SectionCard>
  );
}

function InsuranceRow({ policy }: { policy: PatientInsuranceRow }) {
  return (
    <li className="p-2.5 rounded-md border border-border/50 bg-card">
      <div className="flex items-center gap-2 mb-0.5">
        <IdCard className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <p className="text-sm font-medium text-foreground truncate">
          {policy.insurance_company} · {policy.plan_name}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Póliza {policy.policy_number}
        {policy.valid_until && <> · vence {formatDate(policy.valid_until)}</>}
      </p>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

function DocumentsCard({ patientId }: { patientId: string }) {
  const query = useQuery({
    queryKey: ['patients', 'documents', patientId],
    queryFn: async () => {
      const result = await listDocuments(supabase, patientId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(patientId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  return (
    <SectionCard
      title="Documentos"
      icon={<FileText className="h-4 w-4 text-muted-foreground" />}
    >
      <AsyncBody
        loading={query.isLoading}
        error={query.isError ? (query.error as unknown as ServiceError) : null}
        onRetry={() => void query.refetch()}
        isEmpty={(query.data?.length ?? 0) === 0}
        emptyLabel="Sin documentos cargados."
      >
        <ul className="space-y-2">
          {(query.data ?? []).map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </ul>
      </AsyncBody>
    </SectionCard>
  );
}

function DocumentRow({ doc }: { doc: PatientDocumentRow }) {
  return (
    <li className="flex items-center gap-3 p-2.5 rounded-md border border-border/50 bg-card">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {doc.document_name}
        </p>
        <p className="text-xs text-muted-foreground">
          {capitalize(doc.document_type)} · {formatDate(doc.uploaded_at)}
        </p>
      </div>
      <a
        href={doc.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
      >
        Ver
        <ExternalLink className="h-3 w-3" />
      </a>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card rounded-xl border border-border p-5 space-y-3">
      <header className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground/80 mb-0.5">
        {label}
      </p>
      <p className="text-sm text-foreground break-words">{value ?? '--'}</p>
    </div>
  );
}

function AsyncBody({
  loading,
  error,
  onRetry,
  isEmpty,
  emptyLabel,
  children,
}: {
  loading: boolean;
  error: ServiceError | null;
  onRetry: () => void;
  isEmpty: boolean;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }
  if (error) {
    return (
      <InlineError
        message={error.message ?? 'No pudimos cargar la información.'}
        onRetry={onRetry}
      />
    );
  }
  if (isEmpty) {
    return (
      <EmptyState
        icon={MapPin}
        title={emptyLabel}
        size="compact"
        className="border-0 bg-transparent"
      />
    );
  }
  return <>{children}</>;
}

function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-destructive">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center text-xs font-medium text-destructive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Reintentá
          </button>
        )}
      </div>
    </div>
  );
}


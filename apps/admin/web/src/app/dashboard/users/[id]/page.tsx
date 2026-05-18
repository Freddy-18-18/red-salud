import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, ShieldAlert, Lock, AlertOctagon } from 'lucide-react';
import { getCrossDomainProfile } from '@/lib/users/profile';
import { ProfilePanel } from './profile-panel';

export const dynamic = 'force-dynamic';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data;
  try {
    data = await getCrossDomainProfile(id);
  } catch (err) {
    if (err instanceof Error && err.message.includes('no encontrado')) notFound();
    throw err;
  }

  const { profile, appointments, payments, prescriptions, medicalNotes, documents, reviews, labOrders } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver al buscador
        </Link>
      </div>

      <header className="flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="h-16 w-16 shrink-0 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center text-zinc-400 text-xl font-semibold">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            (profile.full_name ?? profile.email).slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-zinc-100">
              {profile.full_name ?? (`${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email)}
            </h1>
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-300">
              {profile.role}
            </span>
            {profile.deleted_at && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">
                <AlertOctagon className="h-3 w-3" aria-hidden /> Eliminado
              </span>
            )}
            {profile.profile_locked && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <Lock className="h-3 w-3" aria-hidden /> Bloqueado
              </span>
            )}
            {profile.national_id_verified && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <ShieldCheck className="h-3 w-3" aria-hidden /> Cédula OK
              </span>
            )}
            {profile.role === 'medico' && (
              profile.sacs_verified ? (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <ShieldCheck className="h-3 w-3" aria-hidden /> SACS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200">
                  <ShieldAlert className="h-3 w-3" aria-hidden /> SACS pend.
                </span>
              )
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-400">{profile.email}</p>
          <p className="mt-1 text-xs font-mono text-zinc-500">{profile.id}</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfilePanel title="Identidad">
          <Field label="Cédula"           value={profile.national_id} />
          <Field label="RIF"              value={profile.rif} />
          <Field label="Teléfono"         value={profile.phone} />
          <Field label="Fecha nacimiento" value={profile.date_of_birth} />
          <Field label="Nacionalidad"     value={profile.nationality} />
          <Field label="Dirección"        value={
            [profile.address, profile.city, profile.state].filter(Boolean).join(', ') || null
          } />
          <Field label="2FA"              value={profile.two_factor_enabled ? 'Activado' : 'Desactivado'} />
          <Field label="Plan"             value={profile.subscription_type} />
          <Field label="Trial expira"     value={profile.trial_expires_at} />
          <Field label="Creado"           value={profile.created_at} />
        </ProfilePanel>

        <ProfilePanel title="Citas">
          <Field label="Total"            value={appointments.total.toString()} />
          <Field label="Próximas"         value={appointments.upcoming.toString()} />
          <Field label="Canceladas"       value={appointments.cancelled.toString()} />
          <Field label="Últimos 30 días"  value={appointments.last_30d.toString()} />
        </ProfilePanel>

        <ProfilePanel title="Pagos">
          <Field label="Cantidad"         value={payments.total_count.toString()} />
          <Field label="Total USD"        value={`$${payments.total_amount_usd.toFixed(2)}`} />
          <Field label="Total VES"        value={`Bs. ${payments.total_amount_ves.toFixed(2)}`} />
          <Field label="Último pago"      value={payments.last_payment_at} />
        </ProfilePanel>

        <ProfilePanel title="Actividad clínica">
          <Field label="Recetas"          value={prescriptions.count > 0 ? `Sí · ${prescriptions.latest_at ?? ''}` : 'No'} />
          <Field label="Notas médicas"    value={medicalNotes.count > 0 ? `Sí · ${medicalNotes.latest_at ?? ''}` : 'No'} />
          <Field label="Órdenes lab"      value={labOrders.count > 0 ? `Sí · ${labOrders.latest_at ?? ''}` : 'No'} />
          <Field label="Documentos"       value={documents.count.toString()} />
        </ProfilePanel>

        <ProfilePanel title="Reseñas">
          <Field label="Reseñas dadas"    value={reviews.given.toString()} />
          <Field label="Reseñas recibidas" value={reviews.received.toString()} />
          <Field
            label="Rating promedio"
            value={reviews.avg_rating ? `${reviews.avg_rating.toFixed(2)} / 5` : '—'}
          />
        </ProfilePanel>

        <ProfilePanel title="SACS (si médico)">
          <Field label="Estado"      value={profile.sacs_verified ? 'Verificado' : 'No verificado'} />
          <Field label="Licencia"    value={profile.sacs_license} />
          <Field label="Especialidad" value={profile.sacs_specialty} />
        </ProfilePanel>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-sm border-b border-zinc-800/60 last:border-0">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-100 text-right">{value || <span className="text-zinc-600">—</span>}</span>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useDoctorProfile } from '@/hooks/use-doctor-profile';
import {
  User,
  Stethoscope,
  Clock,
  Bell,
  Palette,
  FileSignature,
  Save,
  Loader2,
  Check,
  Camera,
  Globe,
  DollarSign,
  Shield,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { ScheduleManager } from '@/components/settings/schedule-manager';

// ============================================================================
// TYPES
// ============================================================================

type SettingsTab = 'profile' | 'schedule' | 'notifications' | 'signature' | 'theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function ConfiguracionPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    bio: '',
    professional_phone: '',
    professional_email: '',
    clinic_address: '',
    consultation_price: '',
    consultation_duration: '30',
    years_experience: '',
    accepts_insurance: false,
    languages: 'es',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { profile, loading, error, updateProfile, refreshProfile } = useDoctorProfile(userId ?? undefined);

  // Populate form from profile
  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing external data into local form state
    setFormData({
      bio: profile.bio ?? '',
      professional_phone: profile.professional_phone ?? '',
      professional_email: profile.professional_email ?? '',
      clinic_address: profile.clinic_address ?? '',
      consultation_price: profile.consultation_price?.toString() ?? '',
      consultation_duration: profile.consultation_duration?.toString() ?? '30',
      years_experience: profile.years_experience?.toString() ?? '',
      accepts_insurance: profile.accepts_insurance ?? false,
      languages: (Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages) ?? 'es',
    });
  }, [profile]);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setSaveSuccess(false);

    await updateProfile({
      bio: formData.bio || null,
      professional_phone: formData.professional_phone || null,
      professional_email: formData.professional_email || null,
      clinic_address: formData.clinic_address || null,
      consultation_price: formData.consultation_price ? Number(formData.consultation_price) : null,
      consultation_duration: Number(formData.consultation_duration) || 30,
      years_experience: Number(formData.years_experience) || 0,
      accepts_insurance: formData.accepts_insurance,
      languages: formData.languages.split(',').map((l) => l.trim()).filter(Boolean),
    } as Record<string, unknown>);

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }, [userId, formData, updateProfile]);

  const tabs: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'schedule', label: 'Horarios', icon: Clock },
    { id: 'signature', label: 'Firma Digital', icon: FileSignature },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'theme', label: 'Apariencia', icon: Palette },
  ];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Perfil profesional y preferencias del consultorio
          </p>
        </div>
        {activeTab === 'profile' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : saveSuccess ? 'Guardado' : 'Guardar'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Profile header */}
          <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                {profile?.full_name
                  ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'DR'
                }
              </div>
              <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
                <Camera className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{profile?.full_name ?? 'Doctor'}</h2>
              <p className="text-sm text-gray-500">{profile?.specialty?.name ?? 'Medicina General'}</p>
              <div className="flex items-center gap-2 mt-1">
                {profile?.sacs_verificado && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="h-3 w-3" /> SACS Verificado
                  </span>
                )}
                {profile?.is_verified && (
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Biografía profesional"
              icon={User}
              fullWidth
            >
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Breve descripción de tu experiencia y especialización..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300 resize-y"
              />
            </FormField>

            <FormField label="Teléfono profesional" icon={Phone}>
              <input
                type="tel"
                value={formData.professional_phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, professional_phone: e.target.value }))}
                placeholder="+58 424 1234567"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
              />
            </FormField>

            <FormField label="Email profesional" icon={Mail}>
              <input
                type="email"
                value={formData.professional_email}
                onChange={(e) => setFormData((prev) => ({ ...prev, professional_email: e.target.value }))}
                placeholder="dr.nombre@clinica.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
              />
            </FormField>

            <FormField label="Dirección del consultorio" icon={MapPin}>
              <input
                type="text"
                value={formData.clinic_address}
                onChange={(e) => setFormData((prev) => ({ ...prev, clinic_address: e.target.value }))}
                placeholder="Av. Principal, Torre Médica, Piso 3"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
              />
            </FormField>

            <FormField label="Tarifa de consulta" icon={DollarSign}>
              <input
                type="number"
                value={formData.consultation_price}
                onChange={(e) => setFormData((prev) => ({ ...prev, consultation_price: e.target.value }))}
                placeholder="50"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
              />
            </FormField>

            <FormField label="Duración consulta (min)" icon={Clock}>
              <select
                value={formData.consultation_duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, consultation_duration: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="15">15 minutos</option>
                <option value="20">20 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </FormField>

            <FormField label="Años de experiencia" icon={Stethoscope}>
              <input
                type="number"
                value={formData.years_experience}
                onChange={(e) => setFormData((prev) => ({ ...prev, years_experience: e.target.value }))}
                placeholder="10"
                min={0}
                max={60}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
              />
            </FormField>

            <FormField label="Idiomas" icon={Globe}>
              <input
                type="text"
                value={formData.languages}
                onChange={(e) => setFormData((prev) => ({ ...prev, languages: e.target.value }))}
                placeholder="es, en, pt"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
              />
            </FormField>

            <div className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                id="accepts_insurance"
                checked={formData.accepts_insurance}
                onChange={(e) => setFormData((prev) => ({ ...prev, accepts_insurance: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="accepts_insurance" className="text-sm text-gray-700">
                Acepta seguros médicos
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && userId && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ScheduleManager
            doctorId={userId}
            consultationDuration={Number(formData.consultation_duration) || 30}
            onDurationChange={(duration) => {
              setFormData((prev) => ({ ...prev, consultation_duration: String(duration) }));
              if (userId) {
                updateProfile({ consultation_duration: duration } as Record<string, unknown>);
              }
            }}
          />
        </div>
      )}

      {activeTab === 'signature' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Firma Digital</h2>
          <div className="text-center py-12">
            <FileSignature className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Configuración de firma digital</p>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Sube tu firma manuscrita escaneada o firma digitalmente.
              Esta firma se incluirá en todas las recetas y documentos médicos.
            </p>
            <button className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              Subir firma
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferencias de Notificaciones</h2>
          <div className="space-y-4">
            <NotificationToggle
              label="Nuevas citas"
              description="Notificar cuando un paciente agenda una cita"
              defaultChecked
            />
            <NotificationToggle
              label="Cancelaciones"
              description="Notificar cuando se cancela una cita"
              defaultChecked
            />
            <NotificationToggle
              label="Recordatorio previo"
              description="Recordatorio 15 minutos antes de cada cita"
              defaultChecked
            />
            <NotificationToggle
              label="Resultados de laboratorio"
              description="Notificar cuando llegan resultados de exámenes"
            />
            <NotificationToggle
              label="Mensajes de pacientes"
              description="Notificar cuando un paciente envía un mensaje"
              defaultChecked
            />
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personalización Visual</h2>
          <p className="text-sm text-gray-500 mb-6">
            Los colores del dashboard se adaptan automáticamente según tu especialidad.
            Especialidad actual: <span className="font-medium text-gray-700">{profile?.specialty?.name ?? 'Medicina General'}</span>
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1'].map((color) => (
              <button
                key={color}
                className="h-12 w-12 rounded-xl border-2 border-transparent hover:border-gray-300 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function FormField({
  label,
  icon: Icon,
  fullWidth,
  children,
}: {
  label: string;
  icon: typeof User;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        {label}
      </label>
      {children}
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}


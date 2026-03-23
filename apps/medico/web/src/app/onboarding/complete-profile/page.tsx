'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Stethoscope,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { SpecialtySelector, type SpecialtyOption } from '@/components/onboarding/specialty-selector';
import { ModuleConfigurator } from '@/components/onboarding/module-configurator';
import { getSpecialtyTheme } from '@/lib/specialty-theme';

type OnboardingStep = 'loading' | 'specialty' | 'modules' | 'saving' | 'done' | 'error';

export default function CompleteProfilePage() {
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyOption | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check auth state and existing profile
  useEffect(() => {
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      setUserId(user.id);

      // Check if doctor_details already has a specialty
      const { data: profile } = await supabase
        .from('doctor_details')
        .select('especialidad_id, dashboard_config')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (profile?.especialidad_id) {
        // Check if modules are configured
        const config = profile.dashboard_config as Record<string, unknown> | null;
        const hasModules = config?.modules && Array.isArray(config.modules) && (config.modules as string[]).length > 0;

        if (hasModules) {
          // Everything is set, redirect to dashboard
          window.location.href = '/dashboard';
          return;
        }

        // Has specialty but no modules — go to module step
        // First fetch the specialty details
        const { data: specData } = await supabase
          .from('specialties')
          .select('id, name, slug, category, description, icon')
          .eq('id', profile.especialidad_id)
          .single();

        if (specData) {
          setSelectedSpecialty(specData);
          setStep('modules');
          return;
        }
      }

      // No specialty selected — start from beginning
      setStep('specialty');
    }

    checkProfile();
  }, []);

  // Save specialty selection
  const handleSpecialtySave = useCallback(async () => {
    if (!userId || !selectedSpecialty) return;

    setStep('saving');
    setError(null);

    const { error: updateError } = await supabase
      .from('doctor_details')
      .upsert(
        {
          profile_id: userId,
          especialidad_id: selectedSpecialty.id,
        },
        { onConflict: 'profile_id' }
      );

    if (updateError) {
      setError('Error al guardar la especialidad. Intenta de nuevo.');
      setStep('specialty');
      return;
    }

    setStep('modules');
  }, [userId, selectedSpecialty]);

  // Save modules and finish
  const handleModulesSave = useCallback(async () => {
    if (!userId) return;

    setStep('saving');
    setError(null);

    try {
      // Update dashboard_config with module selection
      const { error: configError } = await supabase
        .from('doctor_details')
        .update({
          dashboard_config: {
            modules: selectedModules,
            theme: selectedSpecialty?.slug ?? 'default',
            onboarding_completed: true,
          },
        })
        .eq('profile_id', userId);

      if (configError) {
        console.error('Error saving dashboard config:', configError);
      }

      // Try to save module preferences table too
      const { error: modulesError } = await supabase
        .from('doctor_module_preferences')
        .upsert(
          {
            doctor_id: userId,
            specialty_id: selectedSpecialty?.id ?? null,
            enabled_modules: selectedModules,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'doctor_id' }
        );

      if (modulesError) {
        console.error('Error saving module preferences:', modulesError);
        // Non-blocking
      }

      setStep('done');

      // Redirect to dashboard after a moment
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch {
      setError('Error al guardar la configuracion.');
      setStep('modules');
    }
  }, [userId, selectedModules, selectedSpecialty]);

  // ── Loading state ──
  if (step === 'loading' || step === 'saving') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm text-gray-500">
            {step === 'loading' ? 'Cargando tu perfil...' : 'Guardando configuracion...'}
          </p>
        </div>
      </main>
    );
  }

  // ── Done state ──
  if (step === 'done') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <div className="max-w-md text-center space-y-6 p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tu consultorio esta listo</h2>
          <p className="text-gray-600">
            Hemos configurado tu espacio de trabajo de{' '}
            <strong
              style={{
                color: getSpecialtyTheme(selectedSpecialty?.slug).primary,
              }}
            >
              {selectedSpecialty?.name ?? 'Medicina'}
            </strong>{' '}
            con {selectedModules.length} modulos activos.
          </p>
          <p className="text-sm text-gray-400">Redireccionando al dashboard...</p>
        </div>
      </main>
    );
  }

  // ── Error state ──
  if (step === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <div className="max-w-md text-center space-y-6 p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Algo salio mal</h2>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </main>
    );
  }

  // ── Main content ──
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'specialty'
              ? 'Selecciona tu especialidad'
              : 'Configura tu consultorio'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 'specialty'
              ? 'Tu dashboard se personalizara segun tu especialidad'
              : 'Elige los modulos que necesitas para tu practica'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          {step === 'specialty' && (
            <div className="space-y-6">
              <SpecialtySelector
                value={selectedSpecialty?.id ?? null}
                onChange={setSelectedSpecialty}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSpecialtySave}
                  disabled={!selectedSpecialty}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
                    text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm
                    disabled:bg-gray-300 disabled:text-gray-500"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'modules' && (
            <div className="space-y-6">
              <ModuleConfigurator
                specialty={selectedSpecialty}
                selectedModules={selectedModules}
                onModulesChange={setSelectedModules}
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('specialty')}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium
                    text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cambiar especialidad
                </button>
                <button
                  type="button"
                  onClick={handleModulesSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
                    text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Activar mi Consultorio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip link */}
        <div className="text-center">
          <a
            href="/dashboard"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Saltar configuracion (puedo hacerlo despues)
          </a>
        </div>
      </div>
    </main>
  );
}

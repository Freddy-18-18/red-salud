'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type CallbackState = 'verifying' | 'checking-profile' | 'success' | 'error';

export default function AuthCallbackPage() {
  const [state, setState] = useState<CallbackState>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // 1. Exchange code for session (Supabase handles this from URL params)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setState('error');
          setErrorMessage('Error al verificar tu sesion: ' + sessionError.message);
          return;
        }

        if (!session?.user) {
          // Try to get user from URL hash (email confirmation flow)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setError) {
              setState('error');
              setErrorMessage('Error al establecer la sesion: ' + setError.message);
              return;
            }
          } else {
            // No session, no tokens — redirect to login
            setState('error');
            setErrorMessage('No se encontro una sesion activa. Intenta iniciar sesion.');
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 3000);
            return;
          }
        }

        // 2. Check if profile is complete
        setState('checking-profile');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setState('error');
          setErrorMessage('No se pudo obtener el usuario. Intenta iniciar sesion.');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 3000);
          return;
        }

        // Check if doctor_details exists
        const { data: doctorProfile } = await supabase
          .from('doctor_details')
          .select('profile_id, especialidad_id')
          .eq('profile_id', user.id)
          .maybeSingle();

        setState('success');

        // 3. Redirect based on profile completeness
        if (!doctorProfile || !doctorProfile.especialidad_id) {
          // Profile incomplete — send to onboarding
          setTimeout(() => {
            window.location.href = '/onboarding/complete-profile';
          }, 1500);
        } else {
          // Profile complete — send to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        }
      } catch (err) {
        console.error('Callback error:', err);
        setState('error');
        setErrorMessage('Error inesperado durante la verificacion.');
      }
    }

    handleCallback();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="max-w-sm w-full text-center space-y-6 p-8">
        {state === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">Verificando tu cuenta...</h2>
            <p className="text-sm text-gray-500">
              Estamos confirmando tu correo electronico
            </p>
          </>
        )}

        {state === 'checking-profile' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">Preparando tu consultorio...</h2>
            <p className="text-sm text-gray-500">
              Revisando tu perfil profesional
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Cuenta verificada</h2>
            <p className="text-sm text-gray-500">
              Redireccionando a tu consultorio...
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Error de verificacion</h2>
            <p className="text-sm text-red-600">{errorMessage}</p>
            <a
              href="/auth/login"
              className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
                hover:bg-blue-700 transition-colors"
            >
              Ir a Iniciar Sesion
            </a>
          </>
        )}
      </div>
    </main>
  );
}

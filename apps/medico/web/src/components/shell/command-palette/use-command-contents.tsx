'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@red-salud/design-system';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase/client';
import { useActiveSede } from '@/hooks/use-active-sede';

import {
  useAppointmentSearch,
  usePatientSearch,
  usePrescriptionSearch,
  type AppointmentHit,
  type PatientHit,
  type PrescriptionHit,
} from './commands/use-dynamic-search';
import type { ShellSedeOption } from '../types';

/**
 * @file use-command-contents.tsx
 * @description Shared business logic for both palette surfaces (modal +
 * inline hero). Centralises:
 *   1. Dynamic search hooks (patients / appointments / prescriptions)
 *   2. Action handlers (router pushes, theme switches, sede selection, logout)
 *   3. Close callback so both surfaces can dismiss themselves after an item
 *      fires.
 *
 * Lifting this out of the modal component means we don't duplicate handlers
 * between the modal and the hero — the only thing each surface owns is its
 * visual shell.
 */

interface UseCommandContentsArgs {
  doctorId: string;
  activeSedeId: string | null;
  sedes: ShellSedeOption[];
  query: string;
  /** Called after every successful command so the surface closes/collapses. */
  onAfterSelect: () => void;
}

export interface CommandContents {
  // Dynamic search results
  patients: { hits: PatientHit[]; loading: boolean };
  appointments: { hits: AppointmentHit[]; loading: boolean };
  prescriptions: { hits: PrescriptionHit[]; loading: boolean };
  isLoading: boolean;
  isQueryActive: boolean;

  // Handlers that already include the "close after run" wiring
  handleAction: (id: string) => () => void;
  handleNavigate: (href: string) => () => void;
  handleThemeChange: (next: 'light' | 'dark' | 'system') => () => void;
  handleSedeSelect: (sedeId: string) => () => void;
  handleLogout: () => void;

  // Per-hit handlers
  goToPatient: (id: string) => () => void;
  goToAppointment: (id: string) => () => void;
  goToPrescription: (id: string) => () => void;

  sedes: ShellSedeOption[];
  activeSedeId: string | null;
}

const MIN_QUERY_LENGTH = 2;

export function useCommandContents({
  doctorId,
  activeSedeId,
  sedes,
  query,
  onAfterSelect,
}: UseCommandContentsArgs): CommandContents {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { setSede } = useActiveSede();

  const patients = usePatientSearch(query);
  const appointments = useAppointmentSearch(query, doctorId, activeSedeId);
  const prescriptions = usePrescriptionSearch(query, doctorId);

  const isQueryActive = query.trim().length >= MIN_QUERY_LENGTH;
  const isLoading =
    isQueryActive &&
    (patients.loading || appointments.loading || prescriptions.loading);

  // Wrap every command in a try/catch + auto-close. This keeps the
  // callsites inside the palette free of boilerplate.
  const runAndClose = useCallback(
    (fn: () => void | Promise<void>) => async () => {
      onAfterSelect();
      try {
        await fn();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Algo salió mal con esa acción.';
        toast.error(message);
      }
    },
    [onAfterSelect],
  );

  const handleAction = useCallback(
    (id: string) =>
      runAndClose(() => {
        switch (id) {
          case 'act-new-appointment':
            router.push('/dashboard/agenda?action=new');
            break;
          case 'act-new-consultation':
            router.push('/dashboard/consulta?action=new');
            break;
          case 'act-new-prescription':
            router.push('/dashboard/recetas?action=new');
            break;
          case 'act-telemedicine':
            router.push('/dashboard/consulta?mode=telemedicine');
            break;
          default:
            break;
        }
      }),
    [router, runAndClose],
  );

  const handleNavigate = useCallback(
    (href: string) => runAndClose(() => router.push(href)),
    [router, runAndClose],
  );

  const handleThemeChange = useCallback(
    (next: 'light' | 'dark' | 'system') =>
      runAndClose(() => setTheme(next)),
    [setTheme, runAndClose],
  );

  const handleSedeSelect = useCallback(
    (sedeId: string) =>
      runAndClose(() => {
        if (sedeId !== activeSedeId) setSede(sedeId);
      }),
    [activeSedeId, setSede, runAndClose],
  );

  const handleLogout = useCallback(() => {
    void runAndClose(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/login');
      router.refresh();
    })();
  }, [router, runAndClose]);

  const goToPatient = useCallback(
    (id: string) => runAndClose(() => router.push(`/dashboard/pacientes?id=${id}`)),
    [router, runAndClose],
  );

  const goToAppointment = useCallback(
    (id: string) => runAndClose(() => router.push(`/dashboard/agenda?appointment=${id}`)),
    [router, runAndClose],
  );

  const goToPrescription = useCallback(
    (id: string) => runAndClose(() => router.push(`/dashboard/recetas?id=${id}`)),
    [router, runAndClose],
  );

  return {
    patients,
    appointments,
    prescriptions,
    isLoading,
    isQueryActive,
    handleAction,
    handleNavigate,
    handleThemeChange,
    handleSedeSelect,
    handleLogout,
    goToPatient,
    goToAppointment,
    goToPrescription,
    sedes,
    activeSedeId,
  };
}

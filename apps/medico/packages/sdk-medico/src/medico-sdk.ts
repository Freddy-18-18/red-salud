import type { SupabaseClient } from '@supabase/supabase-js';
import { appointmentFormSchema, type AppointmentFormValues } from '@red-salud/contracts';
import { z } from 'zod';

import { invokeEdgeFunctionTyped } from './edge-functions';
import { createAppointmentsSdk } from './appointments';
import { createRecordsSdk } from './records';
import { createPrescriptionsSdk } from './prescriptions';
import { createLaboratorySdk } from './laboratory';
import { createAiSdk } from './ai';
import { createUtilitiesSdk } from './utilities';
import { createEventsSdk } from './events';
import { createAuthSdk } from './auth';
import { GeminiService, ICDService, BCVService } from './services';
import { createClinicalServices } from './specialties/clinical-services';
import { createOdontologyPerioSdk } from './specialties/odontology-perio';

export type MedicoEnvironment = 'standalone' | 'integrated' | 'development';

interface MedicoSdkConfig {
  supabase: SupabaseClient;
  environment?: MedicoEnvironment;
  geminiApiKey?: string;
  icd?: { clientId: string; clientSecret: string };
  bcvServiceUrl?: string;
  zaiApiKey?: string;
}

export function createMedicoSdk(config: MedicoSdkConfig | SupabaseClient) {
  // Backward compatibility: check if config is actually the Supabase client
  const isSupabaseClient = (obj: any): obj is SupabaseClient =>
    obj && typeof obj.from === 'function' && typeof obj.auth === 'object';

  const normalizedConfig: MedicoSdkConfig = isSupabaseClient(config)
    ? { supabase: config }
    : config;

  const { supabase, zaiApiKey, environment = 'integrated' } = normalizedConfig;

  if (!supabase) {
    throw new Error('Medico SDK requires a Supabase client in configuration');
  }

  const gemini = normalizedConfig?.geminiApiKey ? new GeminiService(normalizedConfig.geminiApiKey) : null;
  const icd = normalizedConfig?.icd ? new ICDService(normalizedConfig.icd.clientId, normalizedConfig.icd.clientSecret) : null;
  const bcv = new BCVService(supabase, normalizedConfig?.bcvServiceUrl || 'http://localhost:3002');
  const events = createEventsSdk(supabase);
  const clinical = createClinicalServices(supabase);
  const periodontology = createOdontologyPerioSdk(supabase);

  return {
    config: {
      environment,
    },
    appointment: {
      validateForm(values: AppointmentFormValues): AppointmentFormValues {
        return appointmentFormSchema.parse(values);
      },
    },

    appointments: createAppointmentsSdk(supabase),
    records: createRecordsSdk(supabase),
    prescriptions: createPrescriptionsSdk(supabase),
    laboratory: createLaboratorySdk(supabase),
    ai: createAiSdk(supabase, zaiApiKey),
    utilities: createUtilitiesSdk(supabase),
    auth: createAuthSdk(supabase),
    events,
    gemini,
    icd,
    bcv,
    clinical,
    periodontology,

    edgeFunctions: {
      invokeTyped: <TInput, TOutput>(
        functionName: string,
        input: TInput,
        schemas: {
          input: z.ZodType<TInput>;
          output: z.ZodType<TOutput>;
        },
        options?: {
          headers?: Record<string, string>;
        },
      ) => invokeEdgeFunctionTyped(supabase, functionName, input, schemas, options),
    },
  };
}

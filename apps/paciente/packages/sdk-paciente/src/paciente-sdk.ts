import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { invokeEdgeFunctionTyped } from './edge-functions';
import { createAppointmentsSdk } from './appointments';

export function createPacienteSdk(supabase: SupabaseClient) {
  return {
    appointments: createAppointmentsSdk(supabase),
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

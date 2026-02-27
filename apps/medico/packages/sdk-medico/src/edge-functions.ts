import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

export class EdgeFunctionInvokeError extends Error {
  public readonly functionName: string;
  public readonly causeValue: unknown;

  constructor(functionName: string, message: string, causeValue?: unknown) {
    super(message);
    this.name = 'EdgeFunctionInvokeError';
    this.functionName = functionName;
    this.causeValue = causeValue;
  }
}

type ZodSchema<T> = z.ZodType<T>;

type SupabaseFunctionBody =
  | string
  | File
  | Blob
  | ArrayBuffer
  | FormData
  | ReadableStream<Uint8Array>
  | Record<string, any>
  | undefined;

export async function invokeEdgeFunctionTyped<TInput, TOutput>(
  supabase: SupabaseClient,
  functionName: string,
  input: TInput,
  schemas: {
    input: ZodSchema<TInput>;
    output: ZodSchema<TOutput>;
  },
  options?: {
    headers?: Record<string, string>;
  },
): Promise<TOutput> {
  const parsedInput = schemas.input.parse(input) as unknown as SupabaseFunctionBody;

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: parsedInput,
    headers: options?.headers,
  });

  if (error) {
    throw new EdgeFunctionInvokeError(
      functionName,
      `Failed to invoke edge function: ${functionName}`,
      error,
    );
  }

  try {
    return schemas.output.parse(data);
  } catch (parseError) {
    throw new EdgeFunctionInvokeError(
      functionName,
      `Edge function returned an invalid payload for: ${functionName}`,
      parseError,
    );
  }
}

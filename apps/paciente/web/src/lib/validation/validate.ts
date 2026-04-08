import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

export function validateBody<T>(schema: ZodSchema<T>, body: unknown):
  { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return {
        success: false,
        response: NextResponse.json(
          { error: "Datos inválidos", details: messages },
          { status: 400 },
        ),
      };
    }
    return {
      success: false,
      response: NextResponse.json({ error: "Error de validación" }, { status: 400 }),
    };
  }
}

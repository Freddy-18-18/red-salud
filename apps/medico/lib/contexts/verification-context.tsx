"use client";

import { createContext, useContext } from "react";

export interface VerificationContextValue {
  /** Si el usuario tiene su identidad médica verificada */
  isVerified: boolean;
  /** ID del usuario autenticado */
  userId: string | null;
  /** Cargando datos de verificación */
  isLoading: boolean;
}

export const VerificationContext = createContext<VerificationContextValue>({
  isVerified: false,
  userId: null,
  isLoading: true,
});

export function useVerification() {
  return useContext(VerificationContext);
}

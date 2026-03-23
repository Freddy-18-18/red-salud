'use client';

import { Stethoscope } from 'lucide-react';
import { RegistrationSteps } from '@/components/onboarding/registration-steps';

export function RegisterForm() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Crea tu Consultorio Digital</h1>
        <p className="text-sm text-gray-500 mt-1">
          Red Salud — Registro de Profesional de Salud
        </p>
      </div>

      {/* Multi-step form */}
      <RegistrationSteps />
    </div>
  );
}

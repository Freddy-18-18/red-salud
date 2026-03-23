// TODO: Create or import RegisterFormV2 component for doctor registration
// Original monolith used: import { RegisterFormV2 } from "@/components/auth/register-form-v2"

export default function RegisterMedicoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Registro de Médico</h1>
        <p className="text-gray-600">
          Formulario de registro para profesionales de salud
        </p>
        {/* TODO: Integrate RegisterFormV2 with role="medico" */}
      </div>
    </main>
  );
}

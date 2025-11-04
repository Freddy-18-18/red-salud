import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPacientePage() {
  return (
    <RegisterForm
      role="paciente"
      roleLabel="Paciente"
      roleGradient="from-blue-500 to-blue-600"
    />
  );
}

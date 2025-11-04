import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterMedicoPage() {
  return (
    <RegisterForm
      role="medico"
      roleLabel="Médico"
      roleGradient="from-teal-500 to-teal-600"
    />
  );
}

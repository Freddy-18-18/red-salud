import { RegisterForm } from "@/components/auth/register-form";
import { User } from "lucide-react";

export default function RegisterPacientePage() {
  return (
    <RegisterForm
      role="paciente"
      roleLabel="Paciente"
      roleIcon={User}
      roleGradient="from-blue-500 to-blue-600"
    />
  );
}

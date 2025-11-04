import { RegisterForm } from "@/components/auth/register-form";
import { Building2 } from "lucide-react";

export default function RegisterClinicaPage() {
  return (
    <RegisterForm
      role="clinica"
      roleLabel="Clínica"
      roleIcon={Building2}
      roleGradient="from-purple-500 to-purple-600"
    />
  );
}

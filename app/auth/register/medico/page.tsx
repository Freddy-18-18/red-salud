import { RegisterForm } from "@/components/auth/register-form";
import { Stethoscope } from "lucide-react";

export default function RegisterMedicoPage() {
  return (
    <RegisterForm
      role="medico"
      roleLabel="Médico"
      roleIcon={Stethoscope}
      roleGradient="from-teal-500 to-teal-600"
    />
  );
}

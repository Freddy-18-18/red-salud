import { RegisterForm } from "@/components/auth/register-form";
import { Microscope } from "lucide-react";

export default function RegisterLaboratorioPage() {
  return (
    <RegisterForm
      role="laboratorio"
      roleLabel="Laboratorio"
      roleIcon={Microscope}
      roleGradient="from-orange-500 to-orange-600"
    />
  );
}

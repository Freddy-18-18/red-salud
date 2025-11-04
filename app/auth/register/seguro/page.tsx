import { RegisterForm } from "@/components/auth/register-form";
import { Shield } from "lucide-react";

export default function RegisterSeguroPage() {
  return (
    <RegisterForm
      role="seguro"
      roleLabel="Seguro"
      roleIcon={Shield}
      roleGradient="from-indigo-500 to-indigo-600"
    />
  );
}

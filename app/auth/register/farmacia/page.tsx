import { RegisterForm } from "@/components/auth/register-form";
import { Pill } from "lucide-react";

export default function RegisterFarmaciaPage() {
  return (
    <RegisterForm
      role="farmacia"
      roleLabel="Farmacia"
      roleIcon={Pill}
      roleGradient="from-green-500 to-green-600"
    />
  );
}

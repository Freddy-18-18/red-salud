import { RegisterForm } from "@/components/auth/register-form";
import { Ambulance } from "lucide-react";

export default function RegisterAmbulanciaPage() {
  return (
    <RegisterForm
      role="ambulancia"
      roleLabel="Ambulancia"
      roleIcon={Ambulance}
      roleGradient="from-red-500 to-red-600"
    />
  );
}

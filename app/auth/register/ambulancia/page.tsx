import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterAmbulanciaPage() {
  return (
    <RegisterForm
      role="ambulancia"
      roleLabel="Ambulancia"
      roleGradient="from-red-500 to-red-600"
    />
  );
}

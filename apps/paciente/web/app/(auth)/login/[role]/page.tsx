import { LoginForm } from "@/components/auth/login-form";
import { ROLE_CONFIG, USER_ROLES, type UserRole } from "@/lib/constants";
import { notFound } from "next/navigation";

interface LoginRolePageProps {
  params: Promise<{
    role: string;
  }>;
}

export async function generateStaticParams() {
  return Object.values(USER_ROLES).map((role) => ({
    role,
  }));
}

export default async function LoginRolePage({ params }: LoginRolePageProps) {
  const { role } = await params;

  // Verificar que el rol sea válido
  if (!Object.values(USER_ROLES).includes(role as UserRole)) {
    notFound();
  }

  const config = ROLE_CONFIG[role as UserRole];

  return <LoginForm role={role as UserRole} roleLabel={config.label} />;
}

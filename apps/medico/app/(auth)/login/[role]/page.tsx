import { redirect } from "next/navigation";

/**
 * Backward-compat route: /login/[role] → /login
 * En la App Médico solo existe el rol "medico", así que
 * cualquier ruta /login/xxx redirige al login principal.
 */
interface LoginRolePageProps {
  params: Promise<{ role: string }>;
}

export default async function LoginRolePage({ params }: LoginRolePageProps) {
  // Ignorar el rol — siempre redirigir al login único
  redirect("/login");
}

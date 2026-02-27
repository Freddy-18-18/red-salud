import { redirect } from "next/navigation";

/**
 * La App Médica es una aplicación especializada.
 * No tiene "Landing Page" propia (estas viven en la app principal).
 * Redirigimos directamente al login o dashboard.
 */
export default function RootPage() {
  redirect("/login");
}

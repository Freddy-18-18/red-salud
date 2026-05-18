import { redirect } from 'next/navigation';

/**
 * /dashboard/configuracion → redirect to the default tab (/perfil).
 *
 * Each tab lives in its own route under /configuracion/*, sharing the layout
 * defined in /configuracion/layout.tsx. This is the URL-driven settings
 * pattern used by Linear, Stripe, Vercel.
 */
export default function ConfiguracionIndexPage() {
  redirect('/dashboard/configuracion/perfil');
}

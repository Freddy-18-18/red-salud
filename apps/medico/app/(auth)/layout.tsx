/**
 * Auth Layout
 * 
 * Layout minimalista para páginas de autenticación.
 * Sin header ni footer para mantener el foco en el formulario.
 * Cada página de auth maneja su propio diseño y estilos.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

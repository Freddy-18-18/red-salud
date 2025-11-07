/**
 * Auth Layout
 * 
 * Layout minimalista para páginas de autenticación.
 * Sin header ni footer para mantener el foco en el formulario.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  );
}

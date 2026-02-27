/**
 * Layout para el Route Group (dashboard)
 * Este layout envuelve todas las rutas dentro del grupo
 * pero NO afecta la URL (los paréntesis lo hacen invisible)
 */

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

import { PublicFooter } from '@/components/public/public-footer'
import { PublicNavbar } from '@/components/public/public-navbar'
import { getActiveFeatures } from '@/lib/services/feature-flags-service'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeFeatures = await getActiveFeatures()

  return (
    <>
      <PublicNavbar activeFeatures={activeFeatures} />
      <main className="min-h-screen">{children}</main>
      <PublicFooter />
    </>
  )
}

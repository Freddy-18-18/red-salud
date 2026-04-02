import { PublicNavbar } from '@/components/public/public-navbar';
import { PublicFooter } from '@/components/public/public-footer';
import { ScrollToTop } from '@/components/public/scroll-to-top';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <ScrollToTop />
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}

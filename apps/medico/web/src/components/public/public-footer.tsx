import { Cross as MedicalCross } from 'lucide-react';
import Link from 'next/link';

const footerColumns = [
  {
    title: 'Producto',
    links: [
      { label: 'Funcionalidades', href: '/#funcionalidades' },
      { label: 'Especialidades', href: '/#especialidades' },
      { label: 'Precios', href: '/precios' },
      { label: 'Actualizaciones', href: '#' },
    ],
  },
  {
    title: 'Especialidades',
    links: [
      { label: 'Medicina General', href: '/especialidades' },
      { label: 'Cardiología', href: '/especialidades' },
      { label: 'Pediatría', href: '/especialidades' },
      { label: 'Odontología', href: '/especialidades' },
      { label: 'Ginecología', href: '/especialidades' },
      { label: 'Ver todas', href: '/especialidades' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Centro de Ayuda', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Estado del Sistema', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '#' },
      { label: 'Términos', href: '#' },
      { label: 'Seguridad', href: '#' },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                <MedicalCross className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Red Salud</span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs">
              La plataforma clínica que se adapta a tu especialidad médica.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">&copy; 2024 Red Salud. Todos los derechos reservados.</p>
          <p className="text-sm text-zinc-600">Hecho con amor en Venezuela</p>
        </div>
      </div>
    </footer>
  );
}

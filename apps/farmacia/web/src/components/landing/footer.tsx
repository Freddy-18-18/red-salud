import { Pill, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  producto: {
    title: 'Producto',
    links: [
      { label: 'Funcionalidades', href: '#funcionalidades' },
      { label: 'Precios', href: '#precios' },
      { label: 'Como Funciona', href: '#como-funciona' },
      { label: 'Actualizaciones', href: '#' },
    ],
  },
  empresa: {
    title: 'Empresa',
    links: [
      { label: 'Sobre Nosotros', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carreras', href: '#' },
      { label: 'Contacto', href: '#contacto' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Terminos de Servicio', href: '#' },
      { label: 'Politica de Privacidad', href: '#' },
      { label: 'Politica de Cookies', href: '#' },
    ],
  },
  soporte: {
    title: 'Soporte',
    links: [
      { label: 'Centro de Ayuda', href: '#' },
      { label: 'Documentacion', href: '#' },
      { label: 'Estado del Sistema', href: '#' },
      { label: 'API', href: '#' },
    ],
  },
};

export function Footer() {
  return (
    <footer id="contacto" className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid gap-12 py-16 lg:grid-cols-6 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Pill className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Red Salud
                <span className="ml-1 text-sm font-medium text-blue-600">
                  Farmacia
                </span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              La plataforma de gestion integral para farmacias venezolanas.
              Inventario, ventas, recetas y mas en un solo lugar.
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:farmacia@redsalud.ve"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                farmacia@redsalud.ve
              </a>
              <a
                href="tel:+582121234567"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
                +58 212 123 4567
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                Caracas, Venezuela
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-gray-900">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-blue-600"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 py-6 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Red Salud. Todos los derechos reservados.
          </p>

          {/* Social links (placeholder) */}
          <div className="flex items-center gap-4">
            {['X', 'Instagram', 'LinkedIn'].map((social) => (
              <a
                key={social}
                href="#"
                className="rounded-lg p-2 text-sm text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

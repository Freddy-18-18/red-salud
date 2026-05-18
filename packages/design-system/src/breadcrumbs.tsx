"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  /**
   * Optional explicit items. When omitted, the component auto-derives the
   * breadcrumb trail from `usePathname()` using the segment label map.
   */
  items?: BreadcrumbItem[];
  /**
   * Routes where breadcrumbs should NOT render at all (e.g. dashboard home).
   * Defaults to `["/dashboard"]`.
   */
  hideOnPaths?: string[];
  /**
   * Optional override for the segment-to-label dictionary. Merged on top of
   * the built-in dictionary (consumer values win on collision).
   */
  labelOverrides?: Record<string, string>;
  /**
   * Root link rendered as the first crumb. Defaults to `{ label: "Inicio", href: "/dashboard" }`.
   */
  rootItem?: BreadcrumbItem;
  className?: string;
}

/**
 * Built-in segment dictionary for the paciente app. Apps can extend this via
 * the `labelOverrides` prop. Keys MUST be lowercased URL segments.
 */
const DEFAULT_SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Inicio",
  agendar: "Agendar Cita",
  citas: "Mis Citas",
  "buscar-medico": "Buscar Medico",
  comparador: "Comparador",
  "referencias-medicas": "Referencias",
  valoraciones: "Valoraciones",
  mensajes: "Mensajes",
  notificaciones: "Notificaciones",
  "asistente-ia": "Asistente IA",
  recetas: "Recetas",
  "qr-medico": "QR Medico",
  "emergencia-perfil": "Perfil de Emergencia",
  gastos: "Gastos Medicos",
  recompensas: "Recompensas",
  perfil: "Mi Perfil",
  cronicos: "Mis Cronicos",
  historial: "Historial",
  documentos: "Documentos",
  "health-score": "Health Score",
};

function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveItemsFromPathname(
  pathname: string,
  labels: Record<string, string>,
  rootItem: BreadcrumbItem,
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  // Skip the first segment if it matches the root href (we render root separately).
  const rootSegments = (rootItem.href ?? "").split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [];
  let acc = "";
  segments.forEach((segment, idx) => {
    acc += `/${segment}`;
    const isPartOfRoot = idx < rootSegments.length && segment === rootSegments[idx];
    if (isPartOfRoot) return;

    const label = labels[segment] ?? humanizeSegment(segment);
    const isLast = idx === segments.length - 1;
    items.push({
      label,
      href: isLast ? undefined : acc,
    });
  });
  return items;
}

export function Breadcrumbs({
  items,
  hideOnPaths = ["/dashboard"],
  labelOverrides,
  rootItem = { label: "Inicio", href: "/dashboard" },
  className = "",
}: BreadcrumbsProps) {
  const pathname = usePathname() ?? "";

  if (hideOnPaths.includes(pathname)) return null;

  const labels = labelOverrides
    ? { ...DEFAULT_SEGMENT_LABELS, ...labelOverrides }
    : DEFAULT_SEGMENT_LABELS;

  const trail =
    items && items.length > 0
      ? items
      : deriveItemsFromPathname(pathname, labels, rootItem);

  if (trail.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-6 text-sm text-[hsl(var(--muted-foreground))] ${className}`.trim()}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {rootItem.href ? (
          <li className="flex items-center">
            <Link
              href={rootItem.href}
              className="flex items-center gap-1.5 rounded-md px-1 py-0.5 hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] transition-colors"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-medium">{rootItem.label}</span>
            </Link>
          </li>
        ) : (
          <li className="flex items-center gap-1.5 px-1 py-0.5 font-medium">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{rootItem.label}</span>
          </li>
        )}

        {trail.map((item, idx) => {
          const isLast = idx === trail.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
              <ChevronRight
                className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]/60"
                aria-hidden="true"
              />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-md px-1 py-0.5 hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="px-1 py-0.5 font-medium text-[hsl(var(--foreground))]"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

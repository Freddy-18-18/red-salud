import type { OrganizationBranding } from '@red-salud/types';

const VALID_DENSITIES = new Set(['compact', 'comfortable', 'spacious']);

/**
 * Convert hex color to RGB triplet for CSS variable usage.
 * Example: "#0066FF" -> "0 102 255"
 */
function hexToRgbTriplet(hex: string): string | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const v = m[1];
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function applyBranding(branding: OrganizationBranding): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const primary = hexToRgbTriplet(branding.primary_color);
  const secondary = hexToRgbTriplet(branding.secondary_color);
  const accent = hexToRgbTriplet(branding.accent_color);

  if (primary) root.style.setProperty('--brand-primary', primary);
  if (secondary) root.style.setProperty('--brand-secondary', secondary);
  if (accent) root.style.setProperty('--brand-accent', accent);

  if (branding.font_family) {
    root.style.setProperty('--brand-font', `"${branding.font_family}", system-ui, sans-serif`);
  }

  const density = VALID_DENSITIES.has(branding.ui_density) ? branding.ui_density : 'comfortable';
  root.dataset.density = density;
}

/**
 * Build the inline style string for SSR injection so the first paint
 * already uses the tenant's branding (no FOUC).
 */
export function buildBrandingStyle(branding: OrganizationBranding): string {
  const primary = hexToRgbTriplet(branding.primary_color) ?? '0 102 255';
  const secondary = hexToRgbTriplet(branding.secondary_color) ?? '107 114 128';
  const accent = hexToRgbTriplet(branding.accent_color) ?? '16 185 129';
  const font = branding.font_family || 'Inter';

  return `:root{--brand-primary:${primary};--brand-secondary:${secondary};--brand-accent:${accent};--brand-font:"${font}",system-ui,sans-serif;}`;
}

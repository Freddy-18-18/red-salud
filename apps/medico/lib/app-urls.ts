/**
 * @file app-urls.ts
 * @description Centralized cross-app URL configuration.
 * 
 * In development, each app runs on a different port.
 * In production, each app has its own subdomain.
 * 
 * Dev:  localhost:3000 (portal), localhost:3001 (medico), localhost:3002 (paciente)
 * Prod: red-salud.com, medico.red-salud.com, paciente.red-salud.com
 */

export const APP_URLS = {
    /** This app (App Médico) */
    medico: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    /** Portal público (landing, selección de rol, blog, etc.) */
    portal: process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000',
    /** App Paciente */
    paciente: process.env.NEXT_PUBLIC_PACIENTE_URL || 'http://localhost:3002',
} as const;

/**
 * Build a full URL for another app.
 * @example getAppUrl('paciente', '/login') → 'http://localhost:3002/login'
 */
export function getAppUrl(app: keyof typeof APP_URLS, path: string = '/'): string {
    const base = APP_URLS[app].replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
}

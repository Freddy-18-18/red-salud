/**
 * Integrations Section
 * Manages external service integrations (Google Calendar, etc.)
 */

'use client';

import { GoogleCalendarCard } from '../google-calendar-card';

export function IntegrationsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Integraciones
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Conecta servicios externos para mejorar tu flujo de trabajo
        </p>
      </div>

      <div className="grid gap-6">
        <GoogleCalendarCard />

        {/* Placeholder for future integrations */}
        <div className="p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          Más integraciones próximamente (Outlook Calendar, Zoom, etc.)
        </div>
      </div>
    </div>
  );
}

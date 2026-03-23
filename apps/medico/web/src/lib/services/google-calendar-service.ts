// TODO: Implement Google Calendar integration
// This is a stub to allow the app to compile. Replace with real OAuth2 + Google Calendar API logic.

/**
 * Generate the Google OAuth2 authorization URL for a given user.
 */
export function getAuthorizationUrl(userId: string): string {
  throw new Error(
    `Google Calendar not configured yet. Cannot generate auth URL for user ${userId}.`
  );
}

/**
 * Exchange an OAuth2 authorization code for access/refresh tokens and persist them.
 */
export async function exchangeCodeForTokens(
  code: string,
  userId: string
): Promise<void> {
  throw new Error(
    `Google Calendar not configured yet. Cannot exchange code for user ${userId}.`
  );
}

/**
 * Disconnect (revoke tokens and remove stored credentials) for a user.
 */
export async function disconnectGoogleCalendar(
  userId: string
): Promise<{ success: boolean }> {
  throw new Error(
    `Google Calendar not configured yet. Cannot disconnect for user ${userId}.`
  );
}

/**
 * Sync a single appointment to Google Calendar.
 */
export async function syncAppointmentToGoogle(
  userId: string,
  appointment: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  return {
    success: false,
    error: 'Google Calendar not configured yet.',
  };
}

/**
 * Import events from Google Calendar into the local system.
 */
export async function importEventsFromGoogle(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; imported: number; error?: string }> {
  return {
    success: false,
    imported: 0,
    error: 'Google Calendar not configured yet.',
  };
}

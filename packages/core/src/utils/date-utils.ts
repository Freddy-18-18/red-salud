/**
 * Date formatting and manipulation utilities
 */

/**
 * Format a date string to a localized format
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'es-ES')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date string to a short format (DD/MM/YYYY)
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a date and time string
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'es-ES')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time only from a date
 * @param date - Date string or Date object
 * @returns Formatted time string (HH:MM)
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "hace 2 horas")
 * @param date - Date string or Date object
 * @returns Relative time string in Spanish
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `hace ${months} mes${months !== 1 ? 'es' : ''}`;
  }
  const years = Math.floor(diffDays / 365);
  return `hace ${years} año${years !== 1 ? 's' : ''}`;
}

/**
 * Calculate age from birth date
 * @param birthDate - Birth date string or Date object
 * @returns Age in years
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Check if a date is in the past
 * @param date - Date string or Date object
 * @returns True if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Check if a date is in the future
 * @param date - Date string or Date object
 * @returns True if date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Add days to a date
 * @param date - Date string or Date object
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: string | Date, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param date - Date string or Date object
 * @returns Formatted date string for input
 */
export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date from input format (YYYY-MM-DD)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDateFromInput(dateString: string): Date {
  return new Date(dateString);
}

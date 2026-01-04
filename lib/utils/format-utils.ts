/**
 * String formatting and manipulation utilities
 */

/**
 * Capitalize the first letter of a string
 * @param str - Input string
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize the first letter of each word
 * @param str - Input string
 * @returns Title-cased string
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format a phone number to Venezuelan format
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., +58 414-123-4567)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Venezuelan phone format
  if (cleaned.length === 11 && cleaned.startsWith('58')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  
  if (cleaned.length === 10) {
    return `+58 ${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Format a cedula (ID number) with separators
 * @param cedula - Cedula string
 * @returns Formatted cedula (e.g., V-12.345.678)
 */
export function formatCedula(cedula: string): string {
  if (!cedula) return '';
  
  // Remove all non-alphanumeric characters
  const cleaned = cedula.replace(/[^a-zA-Z0-9]/g, '');
  
  // Extract nationality letter and number
  const nationality = cleaned.match(/^[a-zA-Z]/)?.[0]?.toUpperCase() || 'V';
  const number = cleaned.replace(/^[a-zA-Z]/, '');
  
  // Format with thousand separators
  const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${nationality}-${formatted}`;
}

/**
 * Format a currency amount in Venezuelan Bolivares
 * @param amount - Amount to format
 * @param includeSymbol - Whether to include currency symbol
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return includeSymbol ? `Bs. ${formatted}` : formatted;
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str - Input string
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from a full name
 * @param name - Full name
 * @returns Initials (e.g., "Juan Pérez" -> "JP")
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Sanitize a string for use in URLs (slug)
 * @param str - Input string
 * @returns URL-safe slug
 */
export function slugify(str: string): string {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Format a file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Mask sensitive information (e.g., email, phone)
 * @param str - Input string
 * @param visibleChars - Number of visible characters at start and end
 * @returns Masked string
 */
export function maskString(str: string, visibleChars: number = 3): string {
  if (!str || str.length <= visibleChars * 2) return str;
  
  const start = str.slice(0, visibleChars);
  const end = str.slice(-visibleChars);
  const masked = '*'.repeat(str.length - visibleChars * 2);
  
  return `${start}${masked}${end}`;
}

/**
 * Format a percentage value
 * @param value - Decimal value (e.g., 0.75 for 75%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Remove extra whitespace from a string
 * @param str - Input string
 * @returns Cleaned string
 */
export function cleanWhitespace(str: string): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Check if a string is a valid email
 * @param email - Email string
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract domain from email
 * @param email - Email string
 * @returns Domain part of email
 */
export function getEmailDomain(email: string): string {
  if (!email || !isValidEmail(email)) return '';
  return email.split('@')[1];
}

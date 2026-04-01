export function detectCountry(headers?: Headers): string {
  // Try Vercel's IP country header
  const vercelCountry = headers?.get('x-vercel-ip-country')
  if (vercelCountry && ['VE', 'CO', 'MX'].includes(vercelCountry)) {
    return vercelCountry
  }
  // Default to Venezuela
  return 'VE'
}

export const GEO_COOKIE_NAME = 'rs-country'
export const GEO_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

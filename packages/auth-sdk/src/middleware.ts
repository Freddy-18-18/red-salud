import type { UserRole } from './types';

/**
 * Middleware helper to check authentication in Next.js middleware.
 * Returns the user if authenticated, null otherwise.
 */
export function withAuth(getUser: () => Promise<{ id: string; role?: string } | null>) {
  return async () => {
    const user = await getUser();
    return user ?? null;
  };
}

/**
 * Middleware helper to check if user has the required role.
 */
export function withRole(allowedRoles: UserRole[]) {
  return (userRole: string | null | undefined): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole as UserRole);
  };
}

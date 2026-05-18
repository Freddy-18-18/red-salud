"use client";

import type { ReactNode } from "react";
import { useCan } from "./use-permissions";
import type { PharmacyPermissions, Resource } from "./types";

type ActionOf<R extends Resource> = keyof PharmacyPermissions["resources"][R];

interface RoleGuardProps<R extends Resource> {
  resource: R;
  action: ActionOf<R>;
  /** Rendered when permission denied. Defaults to nothing (hidden). */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on the current user's permission.
 *
 * @example
 * <RoleGuard resource="invoices" action="void" fallback={null}>
 *   <Button>Anular factura</Button>
 * </RoleGuard>
 */
export function RoleGuard<R extends Resource>({
  resource,
  action,
  fallback = null,
  children,
}: RoleGuardProps<R>) {
  const allowed = useCan(resource, action);
  return <>{allowed ? children : fallback}</>;
}

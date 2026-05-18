'use client';

import { Lock, type LucideIcon } from 'lucide-react';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  /** Optional icon shown next to the label. */
  icon?: LucideIcon;
  /** Reason for immutability — surfaced as the lock tooltip. */
  reason: string;
}

/**
 * Renders a read-only field for immutable user data (cédula, SACS info, email).
 *
 * Visual contract:
 *   - Label sits above the value (Stripe/Linear style)
 *   - Value is rendered as plain text, NOT an input (clarifies it's not editable)
 *   - Lock icon to the right of the label communicates "this is locked"
 *   - Tooltip on the lock explains WHY (compliance / audit trail)
 *
 * Used by /dashboard/configuracion/perfil for cédula, full_name (when SACS-verified),
 * email, SACS license, and SACS specialty.
 */
export function ReadOnlyField({
  label,
  value,
  icon: Icon,
  reason,
}: ReadOnlyFieldProps): React.ReactElement {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span title={reason} aria-label={reason} className="inline-flex">
          <Lock
            className="h-3 w-3 text-muted-foreground/60"
            aria-hidden="true"
          />
        </span>
      </div>
      <p className="text-sm text-foreground bg-muted/40 border border-border rounded-md px-3 py-2 break-words">
        {value || <span className="text-muted-foreground/70">—</span>}
      </p>
    </div>
  );
}

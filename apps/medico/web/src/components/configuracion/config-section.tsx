import type { LucideIcon } from 'lucide-react';

interface ConfigSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional action slot (typically a Save button) shown on the right of the header. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Visual container used inside each /configuracion/* tab. Renders a card with
 * an icon + title + description header, an optional actions slot, and the
 * children below.
 *
 * Standardizes the visual rhythm across all settings tabs.
 */
export function ConfigSection({
  icon: Icon,
  title,
  description,
  actions,
  children,
}: ConfigSectionProps): React.ReactElement {
  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <header className="flex items-start justify-between gap-4 border-b border-border bg-card p-5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

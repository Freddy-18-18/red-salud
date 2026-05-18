import * as React from "react"
import { type LucideIcon } from "lucide-react"

import { cn } from "./lib/utils"
import { Button } from "./button"

// =============================================================================
// EmptyState — Caribbean Trust friendly empty state
//
// Use this when a user has NO data yet (new account, fresh dashboard, empty
// filter). DO NOT use for real errors — empty is a calm "you have nothing
// here yet" state, not an alert.
//
// Distinguish from errors:
//   - data === null && error === null  → <EmptyState />
//   - data === null && error !== null  → small inline notice w/ retry
//   - data.length === 0                → <EmptyState />
//
// Tone: warm, Rioplatense Spanish. Examples:
//   "No tenés citas todavía. Cuando agendes, aparecerán acá."
//   "Tu agenda está libre por hoy. ¡Disfrutá!"
// =============================================================================

interface EmptyStateActionAsLink {
    /** Visible label for the CTA button */
    label: string
    /** Anchor href — renders an `<a>` for navigation */
    href: string
    /** Render as an internal-link slot (e.g. Next.js `<Link>`). Pass the link element via `children` of a wrapping `asChild`-style host. */
    onClick?: never
}

interface EmptyStateActionAsButton {
    /** Visible label for the CTA button */
    label: string
    /** Click handler — renders a `<button>` */
    onClick: () => void
    href?: never
}

export type EmptyStateAction = EmptyStateActionAsLink | EmptyStateActionAsButton

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Optional Lucide icon — rendered in a soft circle above the title */
    icon?: LucideIcon
    /** Short, friendly headline. Required. */
    title: string
    /** Supporting copy. Optional. */
    description?: string
    /** Optional CTA — renders a `<Button>` (link or button) */
    action?: EmptyStateAction
    /** Visual density — `compact` for inline panels, `default` for full-page */
    size?: "compact" | "default"
}

function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    size = "default",
    className,
    ...props
}: EmptyStateProps) {
    const padding = size === "compact" ? "py-8 px-4" : "py-16 px-4"
    const iconBox = size === "compact" ? "h-12 w-12" : "h-16 w-16"
    const iconSize = size === "compact" ? "h-6 w-6" : "h-8 w-8"
    const titleSize = size === "compact" ? "text-base" : "text-lg"

    return (
        <div
            data-slot="empty-state"
            role="status"
            aria-live="polite"
            className={cn(
                "flex flex-col items-center justify-center text-center",
                "bg-card text-card-foreground rounded-xl border border-border",
                padding,
                className,
            )}
            {...props}
        >
            {Icon && (
                <div
                    className={cn(
                        "rounded-2xl bg-muted flex items-center justify-center mb-4",
                        iconBox,
                    )}
                >
                    <Icon
                        className={cn("text-muted-foreground", iconSize)}
                        aria-hidden="true"
                    />
                </div>
            )}

            <h3
                className={cn(
                    "font-semibold text-foreground",
                    titleSize,
                    description ? "mb-1" : "mb-0",
                )}
            >
                {title}
            </h3>

            {description && (
                <p className="text-sm text-muted-foreground max-w-sm">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-4">
                    {"href" in action && action.href ? (
                        <Button asChild size={size === "compact" ? "sm" : "default"}>
                            <a href={action.href}>{action.label}</a>
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={action.onClick}
                            size={size === "compact" ? "sm" : "default"}
                        >
                            {action.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

export { EmptyState }

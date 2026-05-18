"use client";

import * as React from "react";
import { Moon, Monitor, Sun } from "lucide-react";

import { useTheme, type Theme } from "./lib/contexts/theme-context";
import { cn } from "./lib/utils";

interface ThemeToggleProps {
    /** Optional class merged onto the root element. */
    className?: string;
    /**
     * Visual variant.
     *  - "segmented" (default): three-button segmented control showing all options at once.
     *  - "single": single button that cycles light -> dark -> system on click.
     */
    variant?: "segmented" | "single";
}

const OPTIONS: ReadonlyArray<{
    value: Theme;
    icon: typeof Sun;
    label: string;
}> = [
    { value: "light", icon: Sun, label: "Modo claro" },
    { value: "dark", icon: Moon, label: "Modo oscuro" },
    { value: "system", icon: Monitor, label: "Automático" },
];

function SkeletonSegmented({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                "flex h-9 w-[108px] gap-1 rounded-lg border border-border bg-card p-1",
                className,
            )}
        />
    );
}

function SkeletonSingle({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card",
                className,
            )}
        />
    );
}

export function ThemeToggle({ className, variant = "segmented" }: ThemeToggleProps) {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return variant === "single" ? (
            <SkeletonSingle className={className} />
        ) : (
            <SkeletonSegmented className={className} />
        );
    }

    if (variant === "single") {
        // Single-button cycle. Icon reflects the CURRENT user choice (not the resolved value),
        // so the user can tell whether they're on "system" vs forced light/dark.
        const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
        const next: Theme =
            theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

        return (
            <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Cambiar tema (actual: ${theme}, siguiente: ${next})`}
                title={`Tema: ${theme}`}
                data-theme={theme}
                data-resolved-theme={resolvedTheme}
                className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/5",
                    className,
                )}
            >
                <Icon className="h-4 w-4" />
            </button>
        );
    }

    return (
        <div
            role="radiogroup"
            aria-label="Selector de tema"
            data-theme={theme}
            data-resolved-theme={resolvedTheme}
            className={cn(
                "inline-flex gap-1 rounded-lg border border-border bg-card p-1",
                className,
            )}
        >
            {OPTIONS.map(({ value, icon: Icon, label }) => {
                const active = theme === value;
                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={label}
                        title={label}
                        onClick={() => setTheme(value)}
                        className={cn(
                            "rounded-md p-1.5 transition-colors",
                            active
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                );
            })}
        </div>
    );
}

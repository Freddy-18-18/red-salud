"use client";

import { useTheme } from "@/lib/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
                "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-foreground hover:bg-primary/5 hover:border-primary/50 transition-all duration-300",
                className
            )}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}

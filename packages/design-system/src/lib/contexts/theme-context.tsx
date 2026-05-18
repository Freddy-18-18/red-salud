"use client"

import * as React from "react"

export type Theme = "dark" | "light" | "system"
export type ResolvedTheme = "dark" | "light"

interface ThemeProviderProps {
    children: React.ReactNode
    /** Theme used when no preference is stored. Defaults to "system". */
    defaultTheme?: Theme
    /** localStorage key. Defaults to "redsalud-theme" (migrated from legacy "vite-ui-theme"). */
    storageKey?: string
}

interface ThemeProviderState {
    /** The user-selected mode: "light" | "dark" | "system". */
    theme: Theme
    /** The actually-applied theme. Always "light" or "dark", never "system". */
    resolvedTheme: ResolvedTheme
    /** Set the theme explicitly. */
    setTheme: (theme: Theme) => void
    /** Cycle: light -> dark -> system -> light. */
    toggleTheme: () => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => null,
    toggleTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

const STORAGE_KEY_DEFAULT = "redsalud-theme"
const LEGACY_STORAGE_KEYS = ["vite-ui-theme"] as const

function readStoredTheme(storageKey: string, fallback: Theme): Theme {
    if (typeof window === "undefined") return fallback
    try {
        const stored = window.localStorage.getItem(storageKey)
        if (stored === "light" || stored === "dark" || stored === "system") {
            return stored
        }
        // Migrate legacy keys (e.g. vite-ui-theme leftover from pre-Next.js).
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
            const legacy = window.localStorage.getItem(legacyKey)
            if (legacy === "light" || legacy === "dark" || legacy === "system") {
                window.localStorage.setItem(storageKey, legacy)
                window.localStorage.removeItem(legacyKey)
                return legacy
            }
        }
    } catch {
        // localStorage unavailable (private mode, SSR) — fall back silently.
    }
    return fallback
}

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyThemeClass(resolved: ResolvedTheme): void {
    if (typeof document === "undefined") return
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolved)
    root.style.colorScheme = resolved
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = STORAGE_KEY_DEFAULT,
}: ThemeProviderProps) {
    // Lazy initial state — runs once on the client. SSR returns the default.
    const [theme, setThemeState] = React.useState<Theme>(() =>
        readStoredTheme(storageKey, defaultTheme)
    )

    // Resolve the actual class applied to <html>.
    const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(() =>
        theme === "system" ? getSystemTheme() : theme
    )

    // Apply the theme class whenever theme changes OR the OS preference changes (in system mode).
    React.useEffect(() => {
        const next: ResolvedTheme = theme === "system" ? getSystemTheme() : theme
        setResolvedTheme(next)
        applyThemeClass(next)

        if (theme !== "system") return

        // In "system" mode, react to OS-level changes live.
        const media = window.matchMedia("(prefers-color-scheme: dark)")
        const handleChange = (event: MediaQueryListEvent) => {
            const sys: ResolvedTheme = event.matches ? "dark" : "light"
            setResolvedTheme(sys)
            applyThemeClass(sys)
        }
        media.addEventListener("change", handleChange)
        return () => media.removeEventListener("change", handleChange)
    }, [theme])

    const setTheme = React.useCallback(
        (next: Theme) => {
            try {
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(storageKey, next)
                }
            } catch {
                /* ignore storage failures */
            }
            setThemeState(next)
        },
        [storageKey]
    )

    // Three-way cycle: light -> dark -> system -> light.
    const toggleTheme = React.useCallback(() => {
        setThemeState((current) => {
            const next: Theme =
                current === "light" ? "dark" : current === "dark" ? "system" : "light"
            try {
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(storageKey, next)
                }
            } catch {
                /* ignore storage failures */
            }
            return next
        })
    }, [storageKey])

    const value = React.useMemo<ThemeProviderState>(
        () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
        [theme, resolvedTheme, setTheme, toggleTheme]
    )

    return (
        <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
    )
}

export const useTheme = (): ThemeProviderState => {
    const context = React.useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}

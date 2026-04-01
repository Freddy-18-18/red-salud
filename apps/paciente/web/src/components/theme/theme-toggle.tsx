'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Skeleton placeholder to avoid hydration mismatch
    return <div className="flex gap-1 rounded-lg bg-[hsl(var(--muted))] p-1 h-9 w-[108px]" />
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Modo claro' },
    { value: 'dark', icon: Moon, label: 'Modo oscuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' },
  ] as const

  return (
    <div className="flex gap-1 rounded-lg bg-[hsl(var(--muted))] p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`rounded-md p-1.5 transition-colors ${
            theme === value
              ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
          title={label}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

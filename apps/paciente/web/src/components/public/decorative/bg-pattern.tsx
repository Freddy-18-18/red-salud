interface BgPatternProps {
  variant?: 'dots' | 'grid' | 'waves'
  className?: string
}

export function BgPattern({ variant = 'dots', className = '' }: BgPatternProps) {
  const patterns: Record<string, React.ReactNode> = {
    dots: (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" className="fill-[hsl(var(--foreground))]" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-pattern)" />
      </svg>
    ),
    grid: (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              className="stroke-[hsl(var(--foreground))]"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
    ),
    waves: (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <pattern id="waves-pattern" x="0" y="0" width="120" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M0 10 Q30 0 60 10 Q90 20 120 10"
              fill="none"
              className="stroke-[hsl(var(--foreground))]"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves-pattern)" />
      </svg>
    ),
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.03] ${className}`}
      aria-hidden="true"
    >
      {patterns[variant]}
    </div>
  )
}

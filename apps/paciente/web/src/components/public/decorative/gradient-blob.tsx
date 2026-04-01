interface GradientBlobProps {
  className?: string
  color?: 'emerald' | 'blue' | 'teal'
}

const colorMap = {
  emerald: 'from-emerald-400/30 to-emerald-600/10 dark:from-emerald-400/15 dark:to-emerald-600/5',
  blue: 'from-blue-400/30 to-blue-600/10 dark:from-blue-400/15 dark:to-blue-600/5',
  teal: 'from-teal-400/30 to-teal-600/10 dark:from-teal-400/15 dark:to-teal-600/5',
}

export function GradientBlob({ className = '', color = 'emerald' }: GradientBlobProps) {
  return (
    <div
      className={`pointer-events-none absolute h-72 w-72 rounded-full bg-gradient-to-br blur-3xl animate-float animate-pulse-soft ${colorMap[color]} ${className}`}
      aria-hidden="true"
    />
  )
}

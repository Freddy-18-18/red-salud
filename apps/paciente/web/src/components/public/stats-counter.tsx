'use client'

import { useEffect, useRef, useState } from 'react'

interface StatsCounterProps {
  value: number
  label: string
  suffix?: string
  prefix?: string
  /** Optional class overrides for the value text */
  valueClassName?: string
  /** Optional class overrides for the label text */
  labelClassName?: string
}

const formatter = new Intl.NumberFormat('es-VE')

export function StatsCounter({
  value,
  label,
  suffix = '',
  prefix = '',
  valueClassName = 'text-[hsl(var(--foreground))]',
  labelClassName = 'text-[hsl(var(--muted-foreground))]',
}: StatsCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animate()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(element)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnimated, value])

  function animate() {
    const duration = 1500
    const steps = 40
    const stepDuration = duration / steps
    let current = 0

    const interval = setInterval(() => {
      current++
      const progress = current / steps
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(eased * value))

      if (current >= steps) {
        clearInterval(interval)
        setDisplayValue(value)
      }
    }, stepDuration)
  }

  return (
    <div ref={ref} className="text-center">
      <div className={`text-3xl font-bold sm:text-4xl ${valueClassName}`}>
        {prefix}
        {formatter.format(displayValue)}
        {suffix}
      </div>
      <div className={`mt-2 text-sm ${labelClassName}`}>{label}</div>
    </div>
  )
}

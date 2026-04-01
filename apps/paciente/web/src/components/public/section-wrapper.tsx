'use client'

import { useEffect, useRef, useState } from 'react'

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Wrapper that reveals children with a fade-in-up animation on scroll.
 *
 * Sections render VISIBLE by default (SSR-safe). The hide+animate cycle only
 * activates on the client for sections that are below the viewport. Sections
 * already visible on mount skip the animation entirely — no flash.
 */
export function SectionWrapper({ children, className = '', delay = 0 }: SectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  // 'visible'  = show content (SSR default + already-in-viewport + revealed)
  // 'hidden'   = below viewport, waiting to scroll into view
  // 'animating' = intersected, playing reveal animation
  const [state, setState] = useState<'visible' | 'hidden' | 'animating'>('visible')

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if element is already in the viewport — if so, skip animation
    const rect = element.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0
    if (inViewport) {
      setState('visible')
      return
    }

    // Element is below the fold — hide it and set up the observer
    setState('hidden')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('animating')
          observer.unobserve(element)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const isHidden = state === 'hidden'
  const isAnimating = state === 'animating'

  return (
    <div
      ref={ref}
      className={`${isAnimating ? 'animate-fade-in-up' : ''} ${className}`}
      style={
        isHidden
          ? { opacity: 0, transform: 'translateY(20px)' }
          : isAnimating && delay > 0
            ? { animationDelay: `${delay}ms` }
            : undefined
      }
    >
      {children}
    </div>
  )
}

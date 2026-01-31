/**
 * Spotlight Component
 * Overlay oscuro con recorte para destacar elementos específicos
 */

'use client';

import { useEffect, useState } from 'react';

interface SpotlightProps {
  target: string | HTMLElement;
  padding?: number;
  radius?: number;
  animate?: boolean;
}

export function Spotlight({ 
  target, 
  padding = 8, 
  radius = 8,
  animate = true 
}: SpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [maskId] = useState(() => `spotlight-mask-${Date.now()}-${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    const updateRect = () => {
      const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;

      if (element instanceof HTMLElement) {
        const elementRect = element.getBoundingClientRect();
        setRect(elementRect);
        
        // Scroll suave al elemento si no está visible
        const isInViewport = (
          elementRect.top >= 0 &&
          elementRect.left >= 0 &&
          elementRect.bottom <= window.innerHeight &&
          elementRect.right <= window.innerWidth
        );

        if (!isInViewport) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }

        // Fade in después de posicionar
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    updateRect();

    // Actualizar rect si cambia el tamaño de ventana
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [target]);

  if (!rect) return null;

  return (
    <div 
      className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 9998 }}
    >
      {/* Overlay oscuro con SVG mask */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id={maskId}>
            <rect fill="white" width="100%" height="100%" />
            <rect
              fill="black"
              x={rect.x - padding}
              y={rect.y - padding}
              width={rect.width + padding * 2}
              height={rect.height + padding * 2}
              rx={radius}
            />
          </mask>
        </defs>
        <rect
          fill="rgba(0, 0, 0, 0.75)"
          width="100%"
          height="100%"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Borde animado alrededor del elemento destacado */}
      <div
        className={animate ? 'animate-pulse' : ''}
        style={{
          position: 'absolute',
          left: rect.x - padding - 2,
          top: rect.y - padding - 2,
          width: rect.width + padding * 2 + 4,
          height: rect.height + padding * 2 + 4,
          border: '3px solid #667eea',
          borderRadius: `${radius}px`,
          boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.2), 0 0 20px rgba(102, 126, 234, 0.6)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

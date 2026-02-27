/**
 * Configuraciones de animaciones reutilizables con Framer Motion
 */

import { Variants } from "framer-motion";

// Animación de fade in desde abajo
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

// Animación de fade in desde la izquierda
export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

// Animación de fade in desde la derecha
export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

// Animación de escala
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

// Animación de stagger para contenedores
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

// Animación de hover para cards
export const cardHover = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.3,
      type: "tween",
      ease: "easeIn",
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      type: "tween",
      ease: "easeOut",
    },
  },
};

// Animación de reveal progresivo
export const revealInOut: Variants = {
  initial: {
    opacity: 0,
    clipPath: "inset(0 100% 0 0)",
  },
  animate: {
    opacity: 1,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.8,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};

// Configuración para scroll parallax
export const parallaxConfig = {
  initial: { y: 0 },
  animate: {
    y: [0, -30, 0],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

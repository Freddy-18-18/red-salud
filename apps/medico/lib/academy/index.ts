/**
 * @file academy/index.ts
 * @description Barrel export para todos los módulos de Red Salud Academy
 * @module Academy
 */

// Tipos
export * from './types/lesson.types';
export * from './types/progress.types';
export * from './types/gamification.types';

// Servicios
export * from './services/lesson.service';
export * from './services/progress.service';
export * from './services/gamification.service';

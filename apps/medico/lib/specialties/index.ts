/**
 * @file specialties/index.ts
 * @description Redirección al SDK para el sistema de experiencias por especialidad.
 */

export * from '@red-salud/sdk-medico';

// Mantenemos los aliases legacy para evitar romper imports existentes en la app
import { getGeneratedConfig } from '@red-salud/sdk-medico';

/** @deprecated Use getGeneratedConfig('odontologia') or getSpecialtyConfig('odontologia') */
export const dentalConfig = getGeneratedConfig('odontologia');

/** @deprecated Use getGeneratedConfig('cardiologia') or getSpecialtyConfig('cardiologia') */
export const cardiologyConfig = getGeneratedConfig('cardiologia');

/** @deprecated Use getGeneratedConfig('pediatria') or getSpecialtyConfig('pediatria') */
export const pediatricsConfig = getGeneratedConfig('pediatria');

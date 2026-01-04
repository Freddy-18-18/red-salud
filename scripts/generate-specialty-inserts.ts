/**
 * @file generate-specialty-inserts.ts
 * @description Script para generar SQL INSERT statements para las 132 especialidades.
 * Ejecutar con: npx tsx scripts/generate-specialty-inserts.ts > inserts.sql
 */

import { MASTER_SPECIALTIES } from '../components/sections/specialties/master-list';

console.log('-- Insert all 132 specialties from master-list.ts');
console.log('-- Generated on:', new Date().toISOString());
console.log('');

// Generar INSERT statements en un solo batch (INSERT con múltiples VALUES)
const values = MASTER_SPECIALTIES.map(s => {
    const name = s.name.replace(/'/g, "''"); // Escapar comillas simples
    return `  ('${s.id}', '${name}', '${s.category}', true)`;
}).join(',\n');

console.log(`INSERT INTO public.specialties (id, name, category, active)`);
console.log(`VALUES`);
console.log(values);
console.log(`ON CONFLICT (id) DO UPDATE SET`);
console.log(`  name = EXCLUDED.name,`);
console.log(`  category = EXCLUDED.category,`);
console.log(`  updated_at = NOW();`);
console.log('');
console.log(`-- Total records: ${MASTER_SPECIALTIES.length}`);

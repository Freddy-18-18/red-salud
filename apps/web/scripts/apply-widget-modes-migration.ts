#!/usr/bin/env tsx

/**
 * Script para aplicar las migraciones de modos de widgets y tablas de analytics
 * Ejecutar con: npx tsx scripts/apply-widget-modes-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration(filePath: string) {
  try {
    console.log(`📄 Ejecutando migración: ${path.basename(filePath)}`);

    const sql = fs.readFileSync(filePath, 'utf-8');

    // Ejecutar el SQL
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error(`❌ Error en migración ${path.basename(filePath)}:`, error);
      return false;
    }

    console.log(`✅ Migración ${path.basename(filePath)} completada`);
    return true;
  } catch (err) {
    console.error(`❌ Error ejecutando migración ${path.basename(filePath)}:`, err);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando aplicación de migraciones de widget modes y analytics...\n');

  const migrations = [
    'supabase/migrations/20250119000001_create_doctor_widget_modes.sql',
    'supabase/migrations/20250119000002_create_analytics_tables.sql',
  ];

  let successCount = 0;

  for (const migration of migrations) {
    if (fs.existsSync(migration)) {
      const success = await executeMigration(migration);
      if (success) successCount++;
    } else {
      console.warn(`⚠️  Migración no encontrada: ${migration}`);
    }
  }

  console.log(`\n📊 Resultado: ${successCount}/${migrations.length} migraciones aplicadas exitosamente`);

  if (successCount === migrations.length) {
    console.log('🎉 Todas las migraciones se aplicaron correctamente!');
  } else {
    console.log('⚠️  Algunas migraciones fallaron. Revisa los logs anteriores.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});

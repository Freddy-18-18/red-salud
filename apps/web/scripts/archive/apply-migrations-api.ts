#!/usr/bin/env tsx

/**
 * Script para aplicar migraciones usando la configuración de Next.js
 * Ejecutar con: npx tsx scripts/apply-migrations-api.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Cargar configuración desde el proyecto Next.js
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('   Archivo .env.local debe existir en la raíz del proyecto');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeSQL(sql: string, description: string) {
  try {
    console.log(`📄 Ejecutando: ${description}`);

    // Ejecutar SQL directamente usando rpc si existe, o informar que necesitamos usar el CLI
    console.log('⚠️  Nota: Para aplicar migraciones SQL completas, usa el CLI de Supabase:');
    console.log('   npx supabase db push');
    console.log('');
    console.log('SQL a ejecutar:');
    console.log(sql.substring(0, 200) + (sql.length > 200 ? '...' : ''));
    console.log('');

    // Intentar ejecutar una consulta simple para verificar conexión
    const { error } = await supabase.from('profiles').select('count').limit(1);

    if (error) {
      console.error('❌ Error de conexión a Supabase:', error.message);
      return false;
    }

    console.log('✅ Conexión a Supabase exitosa');
    console.log('ℹ️  Para aplicar las migraciones, ejecuta: npx supabase db push');
    return true;

  } catch (_err) {
    console.error(`❌ Error ejecutando ${description}:`, _err);
    return false;
  }
}

async function main() {
  console.log('🚀 Verificando migraciones de widget modes...\n');

  const migrations = [
    {
      file: 'supabase/migrations/20250119000001_create_doctor_widget_modes.sql',
      description: 'Crear tabla doctor_widget_modes'
    },
    {
      file: 'supabase/migrations/20250119000002_create_analytics_tables.sql',
      description: 'Crear tablas de analytics'
    }
  ];

  let successCount = 0;

  for (const migration of migrations) {
    if (fs.existsSync(migration.file)) {
      const sql = fs.readFileSync(migration.file, 'utf-8');
      const success = await executeSQL(sql, migration.description);
      if (success) successCount++;
    } else {
      console.warn(`⚠️  Migración no encontrada: ${migration.file}`);
    }
  }

  console.log(`\n📊 Resultado: ${successCount}/${migrations.length} migraciones verificadas`);

  if (successCount > 0) {
    console.log('🎉 ¡Conexión exitosa! Ejecuta el siguiente comando para aplicar las migraciones:');
    console.log('   npx supabase db push');
  } else {
    console.log('⚠️  Revisa la configuración de Supabase antes de continuar.');
  }
}

main().catch((_err) => {
  console.error('💥 Error fatal:', _err);
  process.exit(1);
});

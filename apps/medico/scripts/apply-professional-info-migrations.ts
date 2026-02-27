#!/usr/bin/env tsx

/**
 * Script para aplicar migraciones de información profesional
 * Ejecutar con: npx tsx scripts/apply-professional-info-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables de entorno faltantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📝 Asegúrate de tener estas variables en .env.local');
  process.exit(1);
}

// Cliente admin con service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function readMigrationFile(filename: string): Promise<string> {
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', filename);
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Archivo de migración no encontrado: ${migrationPath}`);
  }
  return fs.readFileSync(migrationPath, 'utf-8');
}

async function executeMigration(sql: string, description: string) {
  console.log(`\n📄 Ejecutando: ${description}`);
  console.log('━'.repeat(60));

  try {
    // Dividir SQL en statements individuales
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '/*' && s !== '*/');

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      // Saltar comentarios y bloques vacíos
      if (!statement || statement.startsWith('/*') || statement.startsWith('--')) {
        continue;
      }

      // Mostrar preview del statement
      const preview = statement.substring(0, 100).replace(/\n/g, ' ');
      console.log(`\n  ▶ ${preview}${statement.length > 100 ? '...' : ''}`);

      try {
        // Usar la API RPC de Supabase para ejecutar SQL
        const { error } = await supabase.rpc('exec_sql', { query: statement });

        if (error) {
          // Si el error es porque la columna ya existe, no es crítico
          if (
            error.message.includes('already exists') ||
            error.message.includes('duplicate key')
          ) {
            console.log(`    ⚠️  Ya existe, saltando...`);
            skipCount++;
          } else {
            console.error(`    ❌ Error:`, error.message);
          }
        } else {
          console.log(`    ✅ Éxito`);
          successCount++;
        }
      } catch (err) {
        console.error(`    ❌ Excepción:`, err);
      }

      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n━'.repeat(60));
    console.log(`✅ ${successCount} statements ejecutados`);
    if (skipCount > 0) {
      console.log(`⚠️  ${skipCount} statements saltados (ya existían)`);
    }

    return true;
  } catch (err) {
    console.error(`\n❌ Error ejecutando migración:`, err);
    return false;
  }
}

async function main() {
  console.log('🚀 Aplicando migraciones de información profesional');
  console.log('━'.repeat(60));

  try {
    // Verificar conexión
    console.log('\n🔌 Verificando conexión a Supabase...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      throw new Error(`Error de conexión: ${error.message}`);
    }
    
    console.log('✅ Conexión exitosa');

    // Migración 1: Campos adicionales
    console.log('\n📦 Migración 1/2: Campos adicionales en doctor_profiles');
    const migration1 = await readMigrationFile('20260213000000_add_professional_info_fields.sql');
    await executeMigration(migration1, 'Agregando campos de información profesional');

    // Migración 2: Storage bucket
    console.log('\n📦 Migración 2/2: Configuración de Storage');
    const migration2 = await readMigrationFile('20260213000001_setup_doctor_storage.sql');
    await executeMigration(migration2, 'Configurando Storage para documentos de médicos');

    console.log('\n━'.repeat(60));
    console.log('🎉 ¡Migraciones completadas!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Verificar bucket: Supabase Dashboard > Storage > doctor-documents');
    console.log('   2. Probar subida de archivos desde la aplicación');
    console.log('   3. Verificar nuevas columnas: SELECT * FROM doctor_profiles LIMIT 1;');

  } catch (err) {
    console.error('\n❌ Error fatal:', err);
    console.log('\n💡 Alternativa: Aplicar migraciones manualmente');
    console.log('   Opción 1: Supabase CLI');
    console.log('   $ npx supabase db push');
    console.log('');
    console.log('   Opción 2: Supabase Dashboard');
    console.log('   1. Ir a SQL Editor en el Dashboard');
    console.log('   2. Copiar contenido de supabase/migrations/20260213000000_add_professional_info_fields.sql');
    console.log('   3. Ejecutar');
    console.log('   4. Repetir con 20260213000001_setup_doctor_storage.sql');
    
    process.exit(1);
  }
}

// Ejecutar
main().catch(console.error);

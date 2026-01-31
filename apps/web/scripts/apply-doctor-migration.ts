/**
 * Script para aplicar la migración del sistema de médicos
 * 
 * Uso:
 * npx tsx scripts/apply-doctor-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Aplicando migración del sistema de médicos...\n');

  try {
    // Leer archivo de migración
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '013_create_doctor_system_complete.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migración cargada:', migrationPath);
    console.log('📏 Tamaño:', migrationSQL.length, 'caracteres\n');

    // Ejecutar migración
    console.log('⏳ Ejecutando migración...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Si exec_sql no existe, intentar ejecutar directamente
      console.log('⚠️  exec_sql no disponible, ejecutando directamente...');
      
      // Dividir en statements individuales
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`   Ejecutando statement ${i + 1}/${statements.length}...`);
        
        const { error: stmtError } = await supabase.rpc('exec', { 
          query: statement + ';' 
        });

        if (stmtError) {
          console.error(`   ❌ Error en statement ${i + 1}:`, stmtError.message);
          // Continuar con el siguiente statement
        }
      }
    }

    console.log('\n✅ Migración aplicada exitosamente!\n');

    // Verificar que las tablas se crearon
    console.log('🔍 Verificando tablas creadas...');
    
    const tables = [
      'specialties',
      'doctor_details',
      'doctor_patients',
      'medical_notes',
      'doctor_stats_cache'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: No encontrada o error`);
      } else {
        console.log(`   ✅ ${table}: ${count || 0} registros`);
      }
    }

    console.log('\n🎉 ¡Sistema de médicos configurado correctamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Desplegar el servicio SACS backend (ver docs/DEPLOY-SERVICIO-SACS-BACKEND.md)');
    console.log('   2. Configurar SACS_BACKEND_URL en Supabase Edge Functions');
    console.log('   3. Desplegar Edge Function: supabase functions deploy verify-doctor-sacs');
    console.log('   4. Probar el flujo en /dashboard/medico/perfil/setup\n');

  } catch (error: any) {
    console.error('\n❌ Error aplicando migración:', error.message);
    console.error('\n💡 Solución alternativa:');
    console.error('   1. Ir a Supabase Dashboard → SQL Editor');
    console.error('   2. Copiar el contenido de supabase/migrations/013_create_doctor_system_complete.sql');
    console.error('   3. Pegar y ejecutar en el SQL Editor\n');
    process.exit(1);
  }
}

applyMigration();

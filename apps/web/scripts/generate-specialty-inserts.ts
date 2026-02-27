/**
 * @file generate-specialty-inserts.ts
 * @description Script para generar inserts SQL y/o sincronizar especialidades a Supabase.
 * Uso: 
 *   pnpm tsx scripts/generate-specialty-inserts.ts --sql > specialties.sql
 *   pnpm tsx scripts/generate-specialty-inserts.ts --sync
 */

import { MASTER_SPECIALTIES } from '../components/sections/specialties/master-list';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const args = process.argv.slice(2);
const generateSql = args.includes('--sql');
const syncToDb = args.includes('--sync');

if (!generateSql && !syncToDb) {
    console.log('Uso:');
    console.log('  pnpm tsx scripts/generate-specialty-inserts.ts --sql  (Genera SQL)');
    console.log('  pnpm tsx scripts/generate-specialty-inserts.ts --sync (Sincroniza con Supabase)');
    process.exit(1);
}

function getSqlInserts() {
    const timestamp = new Date().toISOString();
    let sql = '-- Specialty Inserts generated on ' + timestamp + '\n';
    sql += 'INSERT INTO specialties (id, name, category, active, created_at, updated_at)\nVALUES\n';

    const values = MASTER_SPECIALTIES.map(s => {
        return `  ('${s.id}', '${s.name.replace(/'/g, "''")}', '${s.category}', true, '${timestamp}', '${timestamp}')`;
    });

    sql += values.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET \n  name = EXCLUDED.name, \n  category = EXCLUDED.category, \n  updated_at = EXCLUDED.updated_at;';
    return sql;
}

async function syncSpecialties() {
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`🔄 Syncing ${MASTER_SPECIALTIES.length} specialties to Supabase...`);

    const records = MASTER_SPECIALTIES.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        active: true,
        updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('specialties').upsert(records, { onConflict: 'id' });

    if (error) {
        console.error('❌ Error syncing:', error.message);
    } else {
        console.log('✅ Sync successful!');
    }
}

async function main() {
    if (generateSql) {
        process.stdout.write(getSqlInserts());
    }

    if (syncToDb) {
        await syncSpecialties();
    }
}

main().catch(console.error);

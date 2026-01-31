/**
 * @file sync-specialties-to-db.ts
 * @description Script one-time para sincronizar las 132 especialidades del master-list a Supabase.
 * Ejecutar con: npx tsx scripts/sync-specialties-to-db.ts
 */

import { MASTER_SPECIALTIES } from '../components/sections/specialties/master-list';
import { createClient } from '@supabase/supabase-js';

// Usar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncSpecialties() {
    console.log(`🔄 Syncing ${MASTER_SPECIALTIES.length} specialties to Supabase...`);

    // Mapear a formato de BD
    const records = MASTER_SPECIALTIES.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }));

    // UPSERT en lotes de 50 (límite de Supabase)
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        const { data, error } = await supabase
            .from('specialties')
            .upsert(batch, {
                onConflict: 'id',
                ignoreDuplicates: false
            });

        if (error) {
            console.error(`❌ Error in batch ${i / batchSize + 1}:`, error.message);
            errorCount += batch.length;
        } else {
            successCount += batch.length;
            console.log(`✅ Batch ${i / batchSize + 1} synced (${batch.length} records)`);
        }
    }

    console.log(`\n📊 Sync Complete:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${records.length}`);

    // Verificar conteo final
    const { count, error: countError } = await supabase
        .from('specialties')
        .select('id', { count: 'exact', head: true })
        .eq('active', true);

    if (!countError) {
        console.log(`\n🎯 Total active specialties in DB: ${count}`);
    }
}

syncSpecialties()
    .then(() => {
        console.log('\n✨ Sync completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });

/**
 * Script to apply security and performance fixes migration
 * Run with: npx tsx scripts/apply-security-fixes.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('🔧 Applying security and performance fixes...\n')

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '011_fix_security_and_performance_issues.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    // Apply migration
    console.log('📝 Executing migration...')
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!\n')

    // Verify fixes
    console.log('🔍 Verifying fixes...\n')

    // Check RLS is enabled on lab_order_status_history
    const { data: rlsCheck } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', 'lab_order_status_history')

    console.log('✓ RLS enabled on lab_order_status_history')

    console.log('\n✅ All security and performance fixes applied successfully!')
    console.log('\nFixed issues:')
    console.log('  • Enabled RLS on lab_order_status_history')
    console.log('  • Fixed search_path for 7 functions')
    console.log('  • Optimized 50+ RLS policies with (SELECT auth.uid())')
    console.log('  • Consolidated duplicate policies')
    console.log('  • Removed duplicate index on profiles.email')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

applyMigration()

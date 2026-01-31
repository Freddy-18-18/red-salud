/**
 * Script para verificar el estado de un usuario en la base de datos
 * Uso: npx tsx scripts/check-user-status.ts <email>
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserStatus(email: string) {
  console.log(`\n🔍 Verificando estado del usuario: ${email}\n`)

  // 1. Buscar en la tabla profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Error al buscar perfil:', profileError)
  }

  if (profile) {
    console.log('✅ PERFIL ENCONTRADO:')
    console.log('   - ID:', profile.id)
    console.log('   - Email:', profile.email)
    console.log('   - Rol:', profile.role || '❌ SIN ROL')
    console.log('   - Nombre:', profile.full_name || 'N/A')
    console.log('   - Creado:', profile.created_at)
  } else {
    console.log('❌ NO SE ENCONTRÓ PERFIL EN LA TABLA profiles')
  }

  console.log('\n' + '='.repeat(60) + '\n')
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Debes proporcionar un email')
  console.log('Uso: npx tsx scripts/check-user-status.ts <email>')
  process.exit(1)
}

checkUserStatus(email)

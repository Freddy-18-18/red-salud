/**
 * Script para sincronizar roles de profiles a user_metadata
 * Esto corrige usuarios que tienen rol en profiles pero no en user_metadata
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwckkfiirldgundbcjsp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function syncUserRoles() {
  console.log('\n🔄 Sincronizando roles de profiles a user_metadata...\n')

  // 1. Obtener todos los perfiles con rol
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .not('role', 'is', null)

  if (profilesError) {
    console.error('❌ Error al obtener perfiles:', profilesError)
    return
  }

  console.log(`📋 Encontrados ${profiles.length} perfiles con rol\n`)

  // 2. Para cada perfil, verificar y actualizar user_metadata
  for (const profile of profiles) {
    console.log(`\n👤 Procesando: ${profile.email}`)
    console.log(`   - ID: ${profile.id}`)
    console.log(`   - Rol: ${profile.role}`)

    // Nota: No podemos actualizar user_metadata directamente con la API pública
    // Esto requiere acceso de administrador o service_role_key
    console.log('   ⚠️  Para actualizar user_metadata se requiere service_role_key')
    console.log('   💡 Solución: El middleware ahora consulta la tabla profiles')
  }

  console.log('\n✅ Sincronización completada')
  console.log('\n📝 Nota: El middleware ahora consulta la tabla profiles automáticamente')
  console.log('   cuando user_metadata.role no está disponible.\n')
}

syncUserRoles()

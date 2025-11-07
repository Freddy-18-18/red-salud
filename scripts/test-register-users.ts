/**
 * Script de prueba para registrar 10 usuarios
 * Ejecutar con: npx tsx test-register-users.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const testUsers = [
  { name: 'Carlos', lastName: 'Rodríguez', email: 'carlos.rodriguez@test.com' },
  { name: 'Ana', lastName: 'Martínez', email: 'ana.martinez@test.com' },
  { name: 'Luis', lastName: 'García', email: 'luis.garcia@test.com' },
  { name: 'Sofia', lastName: 'López', email: 'sofia.lopez@test.com' },
  { name: 'Diego', lastName: 'Hernández', email: 'diego.hernandez@test.com' },
  { name: 'Laura', lastName: 'González', email: 'laura.gonzalez@test.com' },
  { name: 'Miguel', lastName: 'Pérez', email: 'miguel.perez@test.com' },
  { name: 'Carmen', lastName: 'Sánchez', email: 'carmen.sanchez@test.com' },
  { name: 'Roberto', lastName: 'Ramírez', email: 'roberto.ramirez@test.com' },
  { name: 'Patricia', lastName: 'Torres', email: 'patricia.torres@test.com' },
]

async function registerUsers() {
  console.log('🚀 Iniciando registro de usuarios de prueba...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: 'Test123456!',
        options: {
          data: {
            full_name: `${user.name} ${user.lastName}`,
            role: 'paciente',
          },
        },
      })
      
      if (error) {
        console.log(`❌ Error registrando ${user.name}: ${error.message}`)
        errorCount++
      } else {
        console.log(`✅ Usuario registrado: ${user.name} ${user.lastName} (${user.email})`)
        successCount++
      }
      
      // Esperar un poco entre registros para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      console.log(`❌ Error inesperado con ${user.name}:`, err)
      errorCount++
    }
  }
  
  console.log(`\n📊 Resumen:`)
  console.log(`   ✅ Exitosos: ${successCount}`)
  console.log(`   ❌ Errores: ${errorCount}`)
  console.log(`   📝 Total: ${testUsers.length}`)
}

registerUsers().then(() => {
  console.log('\n✨ Proceso completado')
  process.exit(0)
}).catch(err => {
  console.error('💥 Error fatal:', err)
  process.exit(1)
})

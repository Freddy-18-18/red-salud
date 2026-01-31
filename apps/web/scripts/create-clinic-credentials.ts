import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan variables de entorno para Supabase')
  console.error('Requeridas: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const emailInput = process.env.CLINICA_EMAIL || process.argv[2] || ''
const passwordInput = process.env.CLINICA_PASSWORD || process.argv[3] || ''
const fullNameInput = process.env.CLINICA_NOMBRE || process.argv[4] || 'Clínica Principal'

const normalizedEmail = emailInput.trim().toLowerCase()
const fullName = fullNameInput.trim()

if (!normalizedEmail) {
  console.error('El email de la clínica es obligatorio')
  process.exit(1)
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(normalizedEmail)) {
  console.error('El email de la clínica no tiene un formato válido')
  process.exit(1)
}

if (!fullName) {
  console.error('El nombre de la clínica es obligatorio')
  process.exit(1)
}

const generatedPassword = !passwordInput
const password = passwordInput.trim() || generateSecurePassword()

if (!isPasswordStrong(password)) {
  console.error('La contraseña debe tener al menos 12 caracteres y combinar mayúsculas, minúsculas, números y símbolos')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

async function createClinicCredentials() {
  const role = 'clinica'

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
    },
  })

  let user = created?.user || null

  if (createError) {
    const existingUser = await findUserByEmail(normalizedEmail)
    if (!existingUser) {
      console.error('No se pudo crear el usuario de clínica:', createError.message)
      process.exit(1)
    }

    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...existingUser.user_metadata,
        full_name: fullName,
        role,
      },
    })

    if (updateError || !updated?.user) {
      console.error('No se pudo actualizar el usuario existente:', updateError?.message || 'Error desconocido')
      process.exit(1)
    }

    user = updated.user
  }

  if (!user) {
    console.error('No se pudo obtener el usuario creado')
    process.exit(1)
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: normalizedEmail,
        nombre_completo: fullName,
        role,
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    console.error('No se pudo sincronizar el perfil de la clínica:', profileError.message)
    process.exit(1)
  }

  console.log('✅ Credenciales de clínica listas')
  console.log(`Email: ${normalizedEmail}`)
  console.log(`Nombre: ${fullName}`)
  console.log(`Usuario ID: ${user.id}`)
  if (generatedPassword) {
    console.log(`Contraseña generada: ${password}`)
  }
}

function generateSecurePassword() {
  const raw = randomBytes(24).toString('base64')
  return `${raw}Aa1!`
}

function isPasswordStrong(candidate: string) {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/
  return strongRegex.test(candidate)
}

async function findUserByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    console.error('No se pudo listar usuarios existentes:', error.message)
    process.exit(1)
  }
  return data.users.find((entry) => entry.email?.toLowerCase() === email) || null
}

createClinicCredentials().catch((error) => {
  console.error('Error inesperado creando credenciales:', error)
  process.exit(1)
})

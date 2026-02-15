# Guía de Implementación del Sistema de Verificación Multi-Nivel

## 📋 Índice

1. [Aplicar Migraciones](#aplicar-migraciones)
2. [Servicios TypeScript](#servicios-typescript)
3. [Hooks React](#hooks-react)
4. [Componentes UI](#componentes-ui)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Testing](#testing)

---

## 🚀 Aplicar Migraciones

### Opción 1: Script PowerShell (Recomendado)

```powershell
cd c:\Users\Fredd\Developer\red-salud
.\scripts\deploy-verification-migrations.ps1
```

### Opción 2: Supabase CLI Manual

```powershell
# 1. Crear las migraciones
cd apps/web
supabase db push --project-ref hwckkfiirldgundbcjsp

# 2. Verificar que se aplicaron
supabase db diff --linked
```

### Opción 3: Supabase MCP (desde Copilot)

```javascript
// Usa el MCP de Supabase para aplicar las migraciones
mcp_com_supabase__apply_migration({
  project_ref: "hwckkfiirldgundbcjsp",
  // ... parámetros
})
```

---

## 💻 Servicios TypeScript

### 1. Crear `verification-service.ts`

```typescript
// apps/web/lib/supabase/services/verification-service.ts

import { createClient } from '@/lib/supabase/client'
import type { 
  VerificationLevel, 
  VerificationStatus,
  MainRoleType,
  ProfessionalVerification 
} from '@/types/verification'

export class VerificationService {
  private supabase = createClient()

  /**
   * Obtiene la verificación completa de un usuario
   */
  async getUserVerification(userId: string) {
    const { data, error } = await this.supabase
      .rpc('get_user_verification', { p_user_id: userId })
      .single()

    if (error) throw error
    return data as ProfessionalVerification
  }

  /**
   * Crea una nueva solicitud de verificación
   */
  async createVerification(params: {
    userId: string
    mainRole: MainRoleType
    subRole?: string
    professionalId?: string
    institution?: string
    department?: string
  }) {
    const { data, error } = await this.supabase
      .from('professional_verifications')
      .insert({
        user_id: params.userId,
        main_role: params.mainRole,
        sub_role: params.subRole,
        professional_id: params.professionalId,
        institution: params.institution,
        department: params.department,
        verification_level: 'pending',
        verification_status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Sube un documento de verificación
   */
  async uploadVerificationDocument(params: {
    verificationId: string
    userId: string
    documentType: string
    file: File
    metadata?: Record<string, any>
  }) {
    // 1. Subir archivo a Supabase Storage
    const fileName = `${params.userId}/${params.documentType}-${Date.now()}-${params.file.name}`
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('verification-documents')
      .upload(fileName, params.file)

    if (uploadError) throw uploadError

    // 2. Obtener URL pública
    const { data: { publicUrl } } = this.supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName)

    // 3. Registrar en la tabla
    const { data, error } = await this.supabase
      .from('verification_documents')
      .insert({
        verification_id: params.verificationId,
        user_id: params.userId,
        document_type: params.documentType,
        document_name: params.file.name,
        file_url: publicUrl,
        file_path: fileName,
        file_size: params.file.size,
        mime_type: params.file.type,
        document_metadata: params.metadata || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Aprueba una verificación (solo admins)
   */
  async approveVerification(params: {
    verificationId: string
    verifiedBy: string
    verifiedByRole: string
    notes?: string
    expiresAt?: string
    customPermissions?: Record<string, any>
  }) {
    const { data, error } = await this.supabase
      .rpc('approve_verification', {
        p_verification_id: params.verificationId,
        p_verified_by: params.verifiedBy,
        p_verified_by_role: params.verifiedByRole,
        p_notes: params.notes,
        p_expires_at: params.expiresAt,
        p_custom_permissions: params.customPermissions
      })

    if (error) throw error
    return data
  }

  /**
   * Rechaza una verificación (solo admins)
   */
  async rejectVerification(params: {
    verificationId: string
    rejectedBy: string
    rejectedByRole: string
    rejectionReason: string
    notes?: string
  }) {
    const { data, error } = await this.supabase
      .rpc('reject_verification', {
        p_verification_id: params.verificationId,
        p_rejected_by: params.rejectedBy,
        p_rejected_by_role: params.rejectedByRole,
        p_rejection_reason: params.rejectionReason,
        p_notes: params.notes
      })

    if (error) throw error
    return data
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async checkPermission(userId: string, permissionPath: string[]) {
    const { data, error } = await this.supabase
      .rpc('check_user_permission', {
        p_user_id: userId,
        p_permission_path: permissionPath
      })

    if (error) throw error
    return data as boolean
  }

  /**
   * Obtiene verificaciones pendientes (para admins)
   */
  async getPendingVerifications() {
    const { data, error } = await this.supabase
      .from('pending_verifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  /**
   * Obtiene verificaciones próximas a vencer
   */
  async getExpiringVerifications(daysThreshold = 30) {
    const { data, error } = await this.supabase
      .rpc('get_expiring_verifications', {
        p_days_threshold: daysThreshold
      })

    if (error) throw error
    return data
  }

  /**
   * Obtiene profesionales supervisados por un usuario
   */
  async getSupervisedProfessionals(supervisorId: string) {
    const { data, error } = await this.supabase
      .rpc('get_supervised_professionals', {
        p_supervisor_id: supervisorId
      })

    if (error) throw error
    return data
  }

  /**
   * Renueva una verificación
   */
  async renewVerification(params: {
    verificationId: string
    renewedBy: string
    newExpiryDate: string
    notes?: string
  }) {
    const { data, error } = await this.supabase
      .rpc('renew_verification', {
        p_verification_id: params.verificationId,
        p_renewed_by: params.renewedBy,
        p_new_expiry_date: params.newExpiryDate,
        p_notes: params.notes
      })

    if (error) throw error
    return data
  }

  /**
   * Obtiene estadísticas del sistema
   */
  async getStatistics() {
    const { data, error } = await this.supabase
      .rpc('get_verification_statistics')

    if (error) throw error
    return data
  }

  /**
   * Obtiene el historial de una verificación
   */
  async getVerificationHistory(verificationId: string) {
    const { data, error } = await this.supabase
      .from('verification_history')
      .select(`
        *,
        performer:performed_by(nombre_completo, email)
      `)
      .eq('verification_id', verificationId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  /**
   * Obtiene documentos de una verificación
   */
  async getVerificationDocuments(verificationId: string) {
    const { data, error } = await this.supabase
      .from('verification_documents')
      .select('*')
      .eq('verification_id', verificationId)
      .eq('is_current', true)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data
  }

  /**
   * Aprueba un documento
   */
  async approveDocument(params: {
    documentId: string
    reviewedBy: string
    notes?: string
  }) {
    const { data, error } = await this.supabase
      .from('verification_documents')
      .update({
        review_status: 'approved',
        reviewed_by: params.reviewedBy,
        review_notes: params.notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', params.documentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Rechaza un documento
   */
  async rejectDocument(params: {
    documentId: string
    reviewedBy: string
    rejectionReason: string
    notes?: string
  }) {
    const { data, error } = await this.supabase
      .from('verification_documents')
      .update({
        review_status: 'rejected',
        reviewed_by: params.reviewedBy,
        rejection_reason: params.rejectionReason,
        review_notes: params.notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', params.documentId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Exportar instancia singleton
export const verificationService = new VerificationService()
```

---

## 🎣 Hooks React

### 1. `useVerification.ts`

```typescript
// apps/web/hooks/useVerification.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { verificationService } from '@/lib/supabase/services/verification-service'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export function useVerification() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Obtener verificación del usuario actual
  const { data: verification, isLoading, error } = useQuery({
    queryKey: ['verification', user?.id],
    queryFn: () => verificationService.getUserVerification(user!.id),
    enabled: !!user?.id
  })

  // Crear verificación
  const createVerification = useMutation({
    mutationFn: verificationService.createVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] })
      toast.success('Solicitud de verificación creada')
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })

  // Subir documento
  const uploadDocument = useMutation({
    mutationFn: verificationService.uploadVerificationDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Documento subido correctamente')
    },
    onError: (error) => {
      toast.error(`Error al subir documento: ${error.message}`)
    }
  })

  return {
    verification,
    isLoading,
    error,
    isVerified: verification?.verification_status === 'approved',
    isPending: verification?.verification_status === 'pending',
    isRejected: verification?.verification_status === 'rejected',
    createVerification: createVerification.mutate,
    uploadDocument: uploadDocument.mutate,
    isCreating: createVerification.isPending,
    isUploading: uploadDocument.isPending
  }
}
```

### 2. `useVerificationDocuments.ts`

```typescript
// apps/web/hooks/useVerificationDocuments.ts

import { useQuery } from '@tanstack/react-query'
import { verificationService } from '@/lib/supabase/services/verification-service'

export function useVerificationDocuments(verificationId?: string) {
  return useQuery({
    queryKey: ['documents', verificationId],
    queryFn: () => verificationService.getVerificationDocuments(verificationId!),
    enabled: !!verificationId
  })
}
```

### 3. `useAdminVerifications.ts` (Para panel de admin)

```typescript
// apps/web/hooks/useAdminVerifications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { verificationService } from '@/lib/supabase/services/verification-service'
import { toast } from 'sonner'

export function useAdminVerifications() {
  const queryClient = useQueryClient()

  // Obtener verificaciones pendientes
  const { data: pendingVerifications, isLoading } = useQuery({
    queryKey: ['admin', 'pending-verifications'],
    queryFn: () => verificationService.getPendingVerifications()
  })

  // Aprobar verificación
  const approveVerification = useMutation({
    mutationFn: verificationService.approveVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-verifications'] })
      toast.success('Verificación aprobada')
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })

  // Rechazar verificación
  const rejectVerification = useMutation({
    mutationFn: verificationService.rejectVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-verifications'] })
      toast.success('Verificación rechazada')
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })

  return {
    pendingVerifications,
    isLoading,
    approveVerification: approveVerification.mutate,
    rejectVerification: rejectVerification.mutate,
    isApproving: approveVerification.isPending,
    isRejecting: rejectVerification.isPending
  }
}
```

---

## 🎨 Componentes UI

### 1. `VerificationStatusBadge.tsx`

```typescript
// apps/web/components/verification/VerificationStatusBadge.tsx

import { Badge } from '@/components/ui/badge'
import type { VerificationStatus } from '@/types/verification'

interface Props {
  status: VerificationStatus
}

export function VerificationStatusBadge({ status }: Props) {
  const variants = {
    pending: { variant: 'outline' as const, label: 'Pendiente', color: 'text-yellow-600' },
    under_review: { variant: 'outline' as const, label: 'En revisión', color: 'text-blue-600' },
    approved: { variant: 'default' as const, label: 'Aprobado', color: 'text-green-600' },
    rejected: { variant: 'destructive' as const, label: 'Rechazado', color: 'text-red-600' },
    expired: { variant: 'outline' as const, label: 'Expirado', color: 'text-gray-600' }
  }

  const config = variants[status] || variants.pending

  return (
    <Badge variant={config.variant} className={config.color}>
      {config.label}
    </Badge>
  )
}
```

### 2. `VerificationWizard.tsx` (Formulario multi-paso)

```typescript
// apps/web/components/verification/VerificationWizard.tsx

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useVerification } from '@/hooks/useVerification'
import { StepIndicator } from './StepIndicator'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { DocumentsStep } from './steps/DocumentsStep'
import { ReviewStep } from './steps/ReviewStep'

const formSchema = z.object({
  mainRole: z.enum(['medico', 'profesional_salud', 'tecnico', 'administrativo']),
  subRole: z.string().optional(),
  professionalId: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

export function VerificationWizard() {
  const [step, setStep] = useState(1)
  const { createVerification, isCreating } = useVerification()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainRole: 'medico'
    }
  })

  const onSubmit = (data: FormData) => {
    createVerification(data)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <StepIndicator currentStep={step} totalSteps={3} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
          {step === 1 && <BasicInfoStep form={form} />}
          {step === 2 && <DocumentsStep form={form} />}
          {step === 3 && <ReviewStep form={form} />}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Anterior
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isCreating}
                className="ml-auto"
              >
                {isCreating ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
```

---

## 📝 Ejemplos de Uso

### Escenario 1: Técnico Radiólogo se registra

```typescript
// Usuario completa el wizard
const data = {
  mainRole: 'tecnico',
  subRole: 'radiologo',
  professionalId: 'TR-12345',
  institution: 'Hospital Central',
  department: 'Radiología'
}

// Se crea la verificación
await verificationService.createVerification({
  userId: user.id,
  ...data
})

// El técnico sube sus documentos
await verificationService.uploadVerificationDocument({
  verificationId: verification.id,
  userId: user.id,
  documentType: 'certificado_tecnico',
  file: certificadoFile,
  metadata: {
    issue_date: '2020-01-15',
    issuing_authority: 'Instituto Nacional de Radiología'
  }
})

// Admin revisa y aprueba
await verificationService.approveVerification({
  verificationId: verification.id,
  verifiedBy: admin.id,
  verifiedByRole: 'admin',
  notes: 'Documentos válidos, aprobado',
  customPermissions: {
    radiology: {
      operate_equipment: true,
      approve_reports: false,
      take_xrays: true,
      access_pacs: true
    }
  }
})
```

### Escenario 2: Verificar permisos antes de acción

```typescript
// Antes de permitir que el técnico opere el equipo
const canOperate = await verificationService.checkPermission(
  userId,
  ['radiology', 'operate_equipment']
)

if (canOperate) {
  // Permitir acceso al equipo
} else {
  toast.error('No tienes permiso para operar este equipo')
}
```

### Escenario 3: Dashboard de Admin

```typescript
// Obtener verificaciones pendientes
const pending = await verificationService.getPendingVerifications()

// Obtener verificaciones próximas a vencer
const expiring = await verificationService.getExpiringVerifications(30)

// Obtener estadísticas
const stats = await verificationService.getStatistics()
// {
//   total_verifications: 150,
//   pending: 12,
//   approved: 130,
//   rejected: 8,
//   by_level: {
//     sacs_verified: 80,
//     manual_verified: 50,
//     supervisor_verified: 15,
//     doctor_delegated: 5
//   }
// }
```

---

## 🧪 Testing

### Test unitario del servicio

```typescript
// apps/web/lib/supabase/services/__tests__/verification-service.test.ts

import { describe, it, expect, vi } from 'vitest'
import { verificationService } from '../verification-service'

describe('VerificationService', () => {
  it('should create verification', async () => {
    const result = await verificationService.createVerification({
      userId: 'user-123',
      mainRole: 'tecnico',
      subRole: 'radiologo',
      professionalId: 'TR-12345'
    })

    expect(result).toHaveProperty('id')
    expect(result.main_role).toBe('tecnico')
  })

  it('should check permissions correctly', async () => {
    const hasPermission = await verificationService.checkPermission(
      'user-123',
      ['radiology', 'operate_equipment']
    )

    expect(typeof hasPermission).toBe('boolean')
  })
})
```

---

## 🔐 Seguridad y RLS

Todas las tablas tienen RLS habilitado:

- ✅ Usuarios solo pueden ver/editar su propia verificación
- ✅ Admins pueden ver/aprobar todas las verificaciones
- ✅ Supervisores pueden ver sus supervisados
- ✅ Todas las acciones se registran en `verification_history`
- ✅ Documentos solo accesibles por el usuario y admins

---

## 📊 Monitoring

```sql
-- Ver verificaciones pendientes
SELECT * FROM pending_verifications;

-- Ver verificaciones próximas a vencer
SELECT * FROM expiring_verifications;

-- Ver estadísticas
SELECT * FROM get_verification_statistics();

-- Ver historial de una verificación
SELECT * FROM verification_history 
WHERE verification_id = 'xxx' 
ORDER BY created_at DESC;
```

---

## 🎯 Checklist de Implementación

- [ ] Aplicar migraciones SQL
- [ ] Crear bucket `verification-documents` en Supabase Storage
- [ ] Implementar `VerificationService`
- [ ] Crear hooks React
- [ ] Construir wizard multi-paso
- [ ] Crear panel de admin
- [ ] Implementar notificaciones (verificación aprobada/rechazada)
- [ ] Agregar cron job para verificar expiraciones
- [ ] Tests unitarios y e2e
- [ ] Documentación de usuario

---

¿Necesitas ayuda con alguna de estas partes? 🚀

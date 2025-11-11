# 🚀 Inicio Rápido - Dashboard Médico

## ⚡ 3 Pasos para Activar

### 1️⃣ Aplicar Migración (2 minutos)

```bash
# Opción A: Automático
npx tsx scripts/apply-doctor-migration.ts

# Opción B: Manual
# 1. Ir a Supabase Dashboard → SQL Editor
# 2. Copiar contenido de: supabase/migrations/013_create_doctor_system_complete.sql
# 3. Pegar y ejecutar
```

### 2️⃣ Desplegar Servicio SACS (5 minutos)

**Railway (Recomendado)**:
1. Ir a [railway.app](https://railway.app) → Login con GitHub
2. New Project → Deploy from GitHub
3. Root Directory: `sacs-verification-service`
4. Copiar URL: `https://tu-servicio.up.railway.app`

**Configurar en Supabase**:
1. Supabase Dashboard → Edge Functions → Settings
2. Environment Variables → Add:
   ```
   SACS_BACKEND_URL=https://tu-servicio.up.railway.app
   ```

### 3️⃣ Desplegar Edge Function (1 minuto)

```bash
# Instalar CLI (si no lo tienes)
npm install -g supabase

# Login y desplegar
supabase login
supabase functions deploy verify-doctor-sacs
```

## ✅ Probar

1. Ir a: `http://localhost:3000/dashboard/medico`
2. Aparecerá overlay de verificación
3. Ingresar cédula venezolana de médico
4. Sistema verificará con SACS automáticamente
5. Completar información profesional
6. ¡Dashboard activado! 🎉

## 📋 ¿Qué se Implementó?

### ✅ Completado

- **Verificación SACS**: Sistema automático de verificación de médicos venezolanos
- **Base de Datos**: 5 tablas con RLS y políticas de seguridad
- **Dashboard Médico**: Métricas, estadísticas, accesos rápidos
- **Gestión de Pacientes**: Lista, búsqueda, información detallada
- **Tipos TypeScript**: Completos y documentados
- **Documentación**: Guías técnicas y de despliegue

### ⏳ Próximo

- Sistema de mensajería médico-paciente
- Gestión de citas y calendario
- Notas médicas y consultas
- Recetas digitales
- Telemedicina (videoconsultas)

## 🗂️ Archivos Importantes

```
📁 Nuevos Archivos Creados:

Frontend:
├── app/dashboard/medico/perfil/setup/page.tsx    # Verificación SACS
├── app/dashboard/medico/pacientes/page.tsx       # Lista pacientes
├── lib/supabase/types/doctors.ts                 # Tipos
└── scripts/apply-doctor-migration.ts             # Script migración

Backend:
├── supabase/migrations/013_create_doctor_system_complete.sql
└── sacs-verification-service/                    # Servicio Puppeteer

Docs:
├── DASHBOARD_MEDICO_README.md                    # Guía completa
├── INICIO_RAPIDO_DASHBOARD_MEDICO.md            # Este archivo
├── docs/DASHBOARD-MEDICO-IMPLEMENTACION.md       # Técnica
└── docs/DEPLOY-SERVICIO-SACS-BACKEND.md         # Despliegue
```

## 🎯 Flujo de Verificación

```
1. Médico se registra → /dashboard/medico
2. Sistema detecta: sin perfil → Muestra overlay
3. Click "Comenzar Verificación"
4. Paso 1: Ingresar cédula → Verificar con SACS
5. SACS valida: ✅ Médico humano / ❌ Veterinario / ❌ No registrado
6. Paso 2: Completar información profesional
7. Sistema guarda todo → Dashboard activado
```

## 🔐 Seguridad

- ✅ RLS en todas las tablas
- ✅ Médicos solo ven sus datos
- ✅ Pacientes solo ven sus médicos
- ✅ Verificación con sistema oficial SACS
- ✅ Validación de profesiones de salud humana

## 📊 Dashboard Médico

### Métricas Principales
- Citas de hoy
- Total de pacientes
- Consultas completadas
- Calificación promedio

### Módulos Disponibles
- 📅 Citas (próximamente)
- 👥 Pacientes ✅
- 💬 Mensajería (próximamente)
- 🎥 Telemedicina (próximamente)
- 💊 Recetas (próximamente)
- 📊 Estadísticas (próximamente)

## 🐛 Problemas Comunes

### "Edge Function error"
→ Servicio SACS no desplegado. Ver paso 2.

### "Profile not found"
→ Completar setup en `/dashboard/medico/perfil/setup`

### "Specialties not loading"
→ Aplicar migración. Ver paso 1.

### SACS lento
→ Normal. El sistema oficial puede tardar 10-30 segundos.

## 💡 Tips

1. **Testing**: Usa cédulas reales de médicos venezolanos (SACS es público)
2. **Logs**: Railway/Render Dashboard → Logs para debug
3. **Supabase**: Dashboard → Logs → Edge Functions
4. **Performance**: Las stats se cachean automáticamente

## 📞 Recursos

- **Guía Completa**: `DASHBOARD_MEDICO_README.md`
- **Técnica**: `docs/DASHBOARD-MEDICO-IMPLEMENTACION.md`
- **Despliegue SACS**: `docs/DEPLOY-SERVICIO-SACS-BACKEND.md`
- **Servicio SACS**: `sacs-verification-service/README.md`

## 🎉 ¡Eso es Todo!

Después de los 3 pasos, tendrás:

✅ Sistema de verificación SACS funcionando  
✅ Dashboard médico completo  
✅ Gestión de pacientes  
✅ Base para comunicación médico-paciente  
✅ Métricas en tiempo real  

**Tiempo total**: ~10 minutos

---

**¿Listo?** Empieza con el Paso 1 👆

**¿Problemas?** Revisa la sección de troubleshooting o los logs

**¿Siguiente?** Implementar mensajería médico-paciente 💬

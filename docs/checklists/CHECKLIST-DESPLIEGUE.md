# ✅ Checklist de Despliegue - Sistema de Verificación SACS

## 📋 Pre-Despliegue

- [ ] Node.js 18+ instalado
- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Cuenta de Supabase activa
- [ ] Proyecto de Supabase creado
- [ ] Git configurado
- [ ] Acceso al repositorio

---

## 🗄️ Fase 1: Base de Datos (5 minutos)

### Conectar a Supabase
```bash
supabase link --project-ref TU_PROJECT_REF
```
- [ ] Comando ejecutado sin errores
- [ ] Conexión establecida

### Aplicar Migración
```bash
supabase db push
```
- [ ] Migración aplicada exitosamente
- [ ] Sin errores en consola

### Verificar Tabla
```sql
SELECT * FROM doctor_verifications_cache LIMIT 1;
```
- [ ] Tabla existe
- [ ] Columnas correctas

**✅ Fase 1 Completa**

---

## ⚡ Fase 2: Edge Function (5 minutos)

### Desplegar Función
```bash
supabase functions deploy verify-doctor-sacs
```
- [ ] Función desplegada
- [ ] Sin errores

### Verificar Despliegue
```bash
supabase functions list
```
- [ ] Función aparece en la lista
- [ ] Status: ACTIVE

### Configurar Variables (Opcional)
En Supabase Dashboard > Edge Functions > verify-doctor-sacs > Settings:
- [ ] `SACS_BACKEND_URL` configurada (si usas backend)

### Probar Función
En Dashboard > Edge Functions > verify-doctor-sacs > Invoke:
```json
{
  "cedula": "12345678",
  "tipo_documento": "V"
}
```
- [ ] Función responde
- [ ] Sin errores críticos

**✅ Fase 2 Completa**

---

## 🖥️ Fase 3: Servicio Backend (10 minutos)

### Opción A: Local (Desarrollo)

```bash
cd sacs-verification-service
npm install
```
- [ ] Dependencias instaladas
- [ ] Sin errores

```bash
npm start
```
- [ ] Servicio iniciado
- [ ] Puerto 3001 disponible
- [ ] Mensaje "Server running on port 3001"

### Opción B: Railway (Producción)

```bash
npm install -g @railway/cli
railway login
cd sacs-verification-service
railway init
railway up
```
- [ ] Proyecto creado en Railway
- [ ] Código desplegado
- [ ] URL generada
- [ ] Variables configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`

### Opción C: Render (Producción)

En Render Dashboard:
- [ ] Web Service creado
- [ ] Repositorio conectado
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Variables configuradas
- [ ] Despliegue exitoso

### Verificar Servicio
```bash
curl http://localhost:3001/health
# o
curl https://tu-servicio.railway.app/health
```
- [ ] Responde: `{"status":"ok",...}`

**✅ Fase 3 Completa**

---

## 🧪 Fase 4: Pruebas (10 minutos)

### Test Rápido del Backend
```bash
cd sacs-verification-service
node test-quick.js
```
- [ ] Health check: ✅
- [ ] Validación de entrada: ✅
- [ ] Formato inválido: ✅

### Test con Cédula Real
```bash
# Seguir instrucciones del test-quick.js
```
- [ ] Consulta al SACS exitosa
- [ ] Datos extraídos correctamente
- [ ] Validación de profesión funciona

### Verificar Caché
```sql
SELECT * FROM doctor_verifications_cache
ORDER BY verified_at DESC
LIMIT 5;
```
- [ ] Datos guardados en caché
- [ ] Campos completos
- [ ] Timestamps correctos

### Verificar Perfil Creado
```sql
SELECT 
  dd.full_name,
  dd.document_type,
  dd.document_number,
  dd.main_profession,
  dd.is_verified,
  s.name as specialty
FROM doctor_details dd
LEFT JOIN specialties s ON dd.specialty_id = s.id
ORDER BY dd.created_at DESC
LIMIT 5;
```
- [ ] Perfil creado
- [ ] Nombre NO editable
- [ ] Datos del SACS presentes

**✅ Fase 4 Completa**

---

## 🎨 Fase 5: Frontend (5 minutos)

### Verificar Compilación
```bash
npm run build
```
- [ ] Build exitoso
- [ ] Sin errores de TypeScript
- [ ] Sin warnings críticos

### Probar en Desarrollo
```bash
npm run dev
```
- [ ] Servidor inicia
- [ ] Puerto 3000 disponible

### Probar Flujo Completo

1. **Crear Usuario Médico**
   - [ ] Registro exitoso
   - [ ] Rol "medico" asignado
   - [ ] Redirección a setup

2. **Formulario de Verificación**
   - [ ] Página carga correctamente
   - [ ] Selector V/E funciona
   - [ ] Input de cédula funciona
   - [ ] Validaciones funcionan

3. **Verificación**
   - [ ] Click en "Verificar con SACS"
   - [ ] Loading state se muestra
   - [ ] Datos del SACS aparecen
   - [ ] Nombre NO es editable

4. **Completar Perfil**
   - [ ] Selector de especialidad funciona
   - [ ] Campos opcionales funcionan
   - [ ] Submit exitoso
   - [ ] Redirección al dashboard

**✅ Fase 5 Completa**

---

## 🔍 Fase 6: Monitoreo (5 minutos)

### Configurar Logs

```bash
# Terminal 1: Edge Function logs
supabase functions logs verify-doctor-sacs --tail
```
- [ ] Logs aparecen

```bash
# Terminal 2: Backend logs (Railway)
railway logs --tail
```
- [ ] Logs aparecen

### Verificar Métricas
```sql
-- Estadísticas generales
SELECT 
  COUNT(*) as total_verificaciones,
  COUNT(*) FILTER (WHERE verified = true) as exitosas,
  COUNT(*) FILTER (WHERE es_medico_humano = true) as medicos_humanos,
  COUNT(*) FILTER (WHERE es_veterinario = true) as veterinarios,
  COUNT(*) FILTER (WHERE verified_at > NOW() - INTERVAL '24 hours') as ultimas_24h
FROM doctor_verifications_cache;
```
- [ ] Query funciona
- [ ] Datos coherentes

### Configurar Alertas (Opcional)
- [ ] Alertas de error configuradas
- [ ] Notificaciones de Slack/Email
- [ ] Dashboard de métricas

**✅ Fase 6 Completa**

---

## 📚 Fase 7: Documentación (5 minutos)

### Actualizar Variables de Entorno
- [ ] `.env.example` actualizado
- [ ] README con instrucciones
- [ ] Variables documentadas

### Documentar URLs
- [ ] URL de producción del backend
- [ ] URL de Supabase
- [ ] Credenciales seguras

### Capacitar al Equipo
- [ ] Demo del sistema
- [ ] Explicar flujo completo
- [ ] Compartir documentación
- [ ] Explicar troubleshooting

**✅ Fase 7 Completa**

---

## 🎯 Checklist Final

### Funcionalidad
- [ ] Verificación con SACS funciona
- [ ] Caché funciona
- [ ] Filtro de veterinarios funciona
- [ ] Creación de perfil funciona
- [ ] Redirección funciona

### Performance
- [ ] Tiempo de respuesta < 10s (primera vez)
- [ ] Tiempo de respuesta < 1s (con caché)
- [ ] Sin memory leaks
- [ ] Sin errores en consola

### Seguridad
- [ ] RLS configurado
- [ ] Validaciones funcionan
- [ ] Nombre NO editable
- [ ] Logs de auditoría

### Monitoreo
- [ ] Logs funcionan
- [ ] Métricas disponibles
- [ ] Alertas configuradas

### Documentación
- [ ] README actualizado
- [ ] Guías disponibles
- [ ] Equipo capacitado

---

## 🎉 ¡Despliegue Completo!

Si todos los checks están ✅, tu sistema está **100% funcional** y listo para producción.

### 📊 Resumen de Tiempo

| Fase | Tiempo Estimado |
|------|----------------|
| Base de Datos | 5 min |
| Edge Function | 5 min |
| Servicio Backend | 10 min |
| Pruebas | 10 min |
| Frontend | 5 min |
| Monitoreo | 5 min |
| Documentación | 5 min |
| **TOTAL** | **45 min** |

---

## 🚨 Si Algo Falla

1. **Revisar logs** de cada componente
2. **Verificar variables** de entorno
3. **Consultar** [Guía de Troubleshooting](./docs/DEPLOY-PASO-A-PASO.md#troubleshooting)
4. **Ejecutar** tests de diagnóstico
5. **Contactar** al equipo de soporte

---

## 📞 Recursos

- [Guía Completa de Despliegue](./docs/DEPLOY-PASO-A-PASO.md)
- [Comandos Rápidos](./DEPLOY-COMMANDS.md)
- [Documentación Técnica](./docs/SISTEMA-VERIFICACION-COMPLETO.md)
- [Guía de Pruebas](./scripts/test-verification-flow.md)

---

**Desarrollado con ❤️ para Red-Salud**

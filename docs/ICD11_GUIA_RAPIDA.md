# 🚀 Guía Rápida - ICD-11 API

## ✅ Configuración Completada

La API de ICD-11 de la OMS ya está configurada y lista para usar.

## 🔑 Credenciales

Las credenciales ya están en `.env.local`:

```env
ICD_API_CLIENT_ID=6ad1234d-e494-48bf-a76b-a6eca0365465_2c9ff758-a26b-4e05-ae31-0d6fb05b9ecc
ICD_API_CLIENT_SECRET=1iC3qmJ1/F2BA9nS2GW2daySuf3njvx46dNvbnxpUYs=
```

## 🧪 Probar la Implementación

### Opción 1: Demo Interactivo (Recomendado)

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Visita: http://localhost:3000/dashboard/medico/icd11-demo

3. Prueba búsquedas como:
   - diabetes
   - hipertensión
   - asma
   - covid
   - neumonía

### Opción 2: En Formulario de Pacientes

1. Ve a: http://localhost:3000/dashboard/medico/pacientes/nuevo

2. En el campo "Diagnósticos", escribe cualquier término médico

3. Verás sugerencias en tiempo real de la API oficial de ICD-11

### Opción 3: Script de Prueba

```bash
npx tsx scripts/test-icd11-api.ts
```

## 📡 Endpoints API

### Búsqueda
```bash
GET /api/icd11/search?q=diabetes
```

### Validación
```bash
GET /api/icd11/validate?code=5A11
```

## 💡 Uso en Código

```typescript
import { searchICD11, validateICD11Code } from "@/lib/services/icd-api-service";

// Buscar códigos
const results = await searchICD11("diabetes");

// Validar código
const isValid = await validateICD11Code("5A11");
```

## 🎯 Características

✅ Búsqueda en tiempo real  
✅ Soporte para español e inglés  
✅ Autocompletado inteligente  
✅ Validación de códigos  
✅ Cache de tokens OAuth2  
✅ Manejo de errores robusto  
✅ Interfaz intuitiva  

## 📚 Documentación Completa

Ver: `ICD11_API_IMPLEMENTACION.md`

## 🐛 Solución de Problemas

### Error: "credentials not configured"

Asegúrate de que `.env.local` tenga las variables:
```env
ICD_API_CLIENT_ID=...
ICD_API_CLIENT_SECRET=...
```

### Error: "Failed to get ICD API token"

1. Verifica que las credenciales sean correctas
2. Verifica tu conexión a internet
3. Revisa los logs del servidor

### No aparecen resultados

1. Escribe al menos 3 caracteres
2. Espera 500ms (debounce)
3. Verifica la consola del navegador

## 🎉 ¡Listo!

La API de ICD-11 está completamente funcional y lista para producción.

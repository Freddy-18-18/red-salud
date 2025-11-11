# Implementación de ICD-11 API de la OMS

## 📋 Descripción

Se ha implementado la integración con la **API oficial de ICD-11 (CIE-11)** de la Organización Mundial de la Salud (OMS) para proporcionar búsqueda y validación de códigos de diagnóstico médico en tiempo real.

## 🔑 Credenciales Configuradas

Las credenciales proporcionadas ya están configuradas en `.env.example`:

```env
ICD_API_CLIENT_ID=6ad1234d-e494-48bf-a76b-a6eca0365465_2c9ff758-a26b-4e05-ae31-0d6fb05b9ecc
ICD_API_CLIENT_SECRET=1iC3qmJ1/F2BA9nS2GW2daySuf3njvx46dNvbnxpUYs=
```

## 🏗️ Arquitectura

### 1. Servicio Backend (`lib/services/icd-api-service.ts`)

Servicio principal que maneja:
- **Autenticación OAuth2** con la API de ICD
- **Cache de tokens** para optimizar requests
- **Búsqueda de códigos** ICD-11
- **Validación de códigos** existentes
- **Obtención de detalles** de entidades ICD

#### Funciones principales:

```typescript
// Buscar códigos por término
searchICD11(query: string, useFlexibleSearch?: boolean): Promise<ICD11Code[]>

// Obtener sugerencias para autocompletar
getICD11Suggestions(text: string): Promise<ICD11Code[]>

// Buscar por código específico
searchICD11ByCode(code: string): Promise<ICD11Code | null>

// Validar si un código existe
validateICD11Code(code: string): Promise<boolean>

// Obtener detalles completos de una entidad
getICD11Entity(entityId: string): Promise<ICDEntity | null>
```

### 2. API Routes

#### `/api/icd11/search` - Búsqueda de códigos

**GET** con parámetros:
- `q` (requerido): Término de búsqueda
- `mode`: `search` o `suggestions` (default: `search`)
- `flexible`: `true` o `false` (default: `true`)

**Ejemplo:**
```bash
GET /api/icd11/search?q=diabetes&mode=suggestions
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "http://id.who.int/icd/entity/123456",
      "code": "5A11",
      "title": "Diabetes mellitus tipo 2",
      "chapter": "05 Enfermedades endocrinas",
      "score": 0.95
    }
  ],
  "count": 1
}
```

#### `/api/icd11/validate` - Validación de código

**GET** con parámetros:
- `code` (requerido): Código ICD-11 a validar

**Ejemplo:**
```bash
GET /api/icd11/validate?code=5A11
```

**Respuesta:**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "id": "http://id.who.int/icd/entity/123456",
    "code": "5A11",
    "title": "Diabetes mellitus tipo 2"
  }
}
```

### 3. Componente UI (`components/dashboard/medico/icd10-autocomplete.tsx`)

Componente React actualizado para usar la API real:

**Características:**
- ✅ Búsqueda en tiempo real con debounce (500ms)
- ✅ Indicador de carga mientras busca
- ✅ Manejo de errores con mensajes claros
- ✅ Muestra score de relevancia
- ✅ Muestra capítulo ICD-11
- ✅ Interfaz intuitiva con badges
- ✅ Mínimo 3 caracteres para buscar

## 🚀 Uso

### En formularios de pacientes:

```tsx
import { ICD10Autocomplete } from "@/components/dashboard/medico/icd10-autocomplete";

function PatientForm() {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  return (
    <ICD10Autocomplete
      value={diagnostics}
      onChange={setDiagnostics}
      placeholder="Buscar diagnóstico ICD-11..."
    />
  );
}
```

### Búsqueda programática:

```typescript
import { searchICD11, validateICD11Code } from "@/lib/services/icd-api-service";

// Buscar códigos
const results = await searchICD11("diabetes");

// Validar código
const isValid = await validateICD11Code("5A11");
```

## 📚 Recursos de la API

- **Documentación oficial**: https://icd.who.int/icdapi
- **GitHub con ejemplos**: https://github.com/ICD-API
- **Swagger API**: https://id.who.int/swagger/index.html
- **Portal de gestión**: https://icd.who.int/icdapi

## 🔐 Autenticación

La API usa **OAuth2 Client Credentials Flow**:

1. El servicio solicita un token de acceso usando `client_id` y `client_secret`
2. El token se cachea y se renueva automáticamente antes de expirar
3. Cada request a la API incluye el token en el header `Authorization: Bearer {token}`

## 🌍 Idioma

La API soporta múltiples idiomas. Actualmente configurado para **español** mediante el header:
```
Accept-Language: es
```

## 📊 Linearización

Se usa la linearización **MMS (Mortality and Morbidity Statistics)** que es la más común para:
- Certificados de defunción
- Estadísticas de morbilidad
- Registros médicos generales

Endpoint: `https://id.who.int/icd/release/11/2024-01/mms/`

## ⚡ Optimizaciones

1. **Cache de tokens**: Los tokens se guardan en memoria y se reutilizan
2. **Debounce**: Las búsquedas esperan 500ms antes de ejecutarse
3. **Límite de resultados**: Máximo 10 resultados por búsqueda
4. **Búsqueda flexible**: Usa `flexisearch` para mejores resultados

## 🐛 Manejo de Errores

El sistema maneja varios tipos de errores:

- **Credenciales no configuradas**: Mensaje claro en consola
- **Error de autenticación**: Retry automático en siguiente request
- **Error de búsqueda**: Mensaje al usuario sin romper la UI
- **Timeout**: Búsqueda se cancela si tarda más de lo esperado

## 📝 Próximos Pasos

Posibles mejoras futuras:

1. **Cache de búsquedas**: Guardar resultados frecuentes en localStorage
2. **Búsqueda offline**: Base de datos local para códigos más comunes
3. **Historial**: Guardar códigos usados recientemente
4. **Favoritos**: Permitir marcar códigos frecuentes
5. **Múltiples idiomas**: Selector de idioma en la UI
6. **Detalles expandidos**: Modal con información completa del código
7. **Jerarquía**: Mostrar códigos padre/hijo relacionados

## 🧪 Testing

Para probar la implementación:

1. Asegúrate de tener las credenciales en `.env.local`
2. Inicia el servidor: `npm run dev`
3. Ve a la página de nuevo paciente: `/dashboard/medico/pacientes/nuevo`
4. Busca en el campo de diagnósticos: "diabetes", "hipertensión", "asma", etc.
5. Verifica que aparezcan resultados de la API real

## 📞 Soporte

Si tienes problemas con las credenciales o la API:
- Visita: https://icd.who.int/icdapi
- Contacta al soporte de WHO ICD API
- Revisa los logs en la consola del servidor

---

**Implementado por**: Kiro AI Assistant  
**Fecha**: 2025-01-10  
**Versión API**: ICD-11 2024-01 (MMS)

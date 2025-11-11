# 🔍 Investigación: CIE-10 (ICD-10) 2025 + Google Gemini AI

## 📋 CIE-10 / ICD-10 - Clasificación Internacional de Enfermedades

### ¿Qué es?
La **CIE-10** (Clasificación Internacional de Enfermedades, 10ª revisión) es el estándar internacional para clasificar enfermedades y problemas de salud, mantenido por la OMS (Organización Mundial de la Salud).

### Versión 2025
- **Última actualización:** ICD-10-CM 2025 (Clinical Modification)
- **Vigencia:** 1 de octubre de 2024 - 30 de septiembre de 2025
- **Códigos:** ~70,000 códigos diagnósticos

### Fuentes Oficiales

#### 1. **API de la OMS (WHO)**
```
URL: https://icd.who.int/icdapi
Requiere: Registro y API Key
Gratis: Sí (con límites)
```

#### 2. **CMS (Centers for Medicare & Medicaid Services)**
```
URL: https://www.cms.gov/medicare/coding-billing/icd-10-codes
Formato: Archivos descargables (TXT, XML, PDF)
Actualización: Anual
```

#### 3. **Bases de Datos Públicas**
- **UMLS (Unified Medical Language System)** - NIH
- **BioPortal** - Stanford
- **Clinicaltables.nlm.nih.gov** - NLM (National Library of Medicine)

## 🤖 Google Gemini AI Integration

### API Key Proporcionada
```
AIzaSyAviURp4_1s8L22pN0xI1mxqvuMpTFLhZU
```

### Gemini API Details
- **Modelo:** gemini-pro (texto) / gemini-pro-vision (imágenes)
- **Endpoint:** https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
- **Límites Free Tier:**
  - 60 requests/minuto
  - 1,500 requests/día
  - 32,000 tokens por request

### Capacidades para Medicina
1. **Traducción de Síntomas a CIE-10**
2. **Sugerencias de Diagnóstico Diferencial**
3. **Explicación de Códigos**
4. **Validación de Coherencia**
5. **Generación de Notas Médicas**

## 🎯 Estrategia de Implementación

### Opción 1: API de la OMS (Recomendada)
**Ventajas:**
- Oficial y actualizada
- Búsqueda en múltiples idiomas
- Incluye descripciones completas
- Gratis con registro

**Desventajas:**
- Requiere registro
- Límites de rate
- Latencia internacional

### Opción 2: Base de Datos Local + Gemini
**Ventajas:**
- Rápido (sin latencia de red)
- Sin límites de requests
- Funciona offline
- Gemini para traducción inteligente

**Desventajas:**
- Requiere descarga inicial (~50MB)
- Actualización manual anual
- Más complejo de mantener

### Opción 3: Híbrida (Mejor Opción) ✅
**Implementación:**
1. Base de datos local con códigos más comunes (~5,000)
2. API de la OMS para búsquedas avanzadas
3. Gemini AI para traducción de texto libre a códigos
4. Caché de búsquedas frecuentes

## 📊 Estructura de Datos CIE-10

### Formato de Código
```
A00.0 - Cólera debido a Vibrio cholerae 01, biotipo cholerae
│││ │
│││ └─ Subcategoría (opcional)
││└─── Categoría específica
│└──── Categoría general
└───── Capítulo (A-Z)
```

### Capítulos Principales
```
A00-B99   Enfermedades infecciosas y parasitarias
C00-D49   Neoplasias
E00-E89   Enfermedades endocrinas, nutricionales y metabólicas
F01-F99   Trastornos mentales y del comportamiento
G00-G99   Enfermedades del sistema nervioso
H00-H59   Enfermedades del ojo y sus anexos
H60-H95   Enfermedades del oído y de la apófisis mastoides
I00-I99   Enfermedades del sistema circulatorio
J00-J99   Enfermedades del sistema respiratorio
K00-K95   Enfermedades del sistema digestivo
L00-L99   Enfermedades de la piel y del tejido subcutáneo
M00-M99   Enfermedades del sistema osteomuscular
N00-N99   Enfermedades del sistema genitourinario
O00-O9A   Embarazo, parto y puerperio
P00-P96   Afecciones originadas en el período perinatal
Q00-Q99   Malformaciones congénitas
R00-R99   Síntomas y signos no clasificados
S00-T88   Traumatismos, envenenamientos
V00-Y99   Causas externas de morbilidad
Z00-Z99   Factores que influyen en el estado de salud
```

## 🚀 Plan de Implementación

### Fase 1: Base de Datos Local (Inmediato)
```typescript
// Códigos más comunes en Venezuela/Latinoamérica
const CIE10_COMUNES = {
  // Infecciosas
  "A09": "Diarrea y gastroenteritis de presunto origen infeccioso",
  "J00": "Rinofaringitis aguda (resfriado común)",
  
  // Crónicas
  "E11.9": "Diabetes mellitus tipo 2 sin complicaciones",
  "I10": "Hipertensión esencial (primaria)",
  
  // Respiratorias
  "J45.9": "Asma no especificada",
  "J18.9": "Neumonía no especificada",
  
  // ... ~200 códigos más comunes
};
```

### Fase 2: Integración Gemini AI (Inmediato)
```typescript
// Traducir texto libre a códigos CIE-10
async function translateToICD10WithGemini(symptoms: string) {
  const prompt = `
    Eres un asistente médico experto en CIE-10.
    Traduce los siguientes síntomas/diagnóstico a códigos CIE-10:
    
    "${symptoms}"
    
    Responde SOLO en formato JSON:
    [
      {
        "code": "E11.9",
        "description": "Diabetes mellitus tipo 2 sin complicaciones",
        "confidence": 0.95
      }
    ]
  `;
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  
  return response.json();
}
```

### Fase 3: API de la OMS (Opcional)
```typescript
// Búsqueda avanzada en API oficial
async function searchWHO_ICD10(query: string) {
  const response = await fetch(
    `https://id.who.int/icd/release/10/2019/search?q=${query}`,
    {
      headers: {
        'API-Version': 'v2',
        'Accept-Language': 'es'
      }
    }
  );
  
  return response.json();
}
```

## 💡 Casos de Uso con Gemini

### 1. Traducción de Notas a Códigos
```
Input: "Paciente con dolor de cabeza intenso y náuseas"
Gemini: [
  { code: "R51", description: "Cefalea" },
  { code: "R11", description: "Náusea y vómito" }
]
```

### 2. Sugerencias de Diagnóstico Diferencial
```
Input: "Fiebre, tos seca, dificultad respiratoria"
Gemini: [
  { code: "J18.9", description: "Neumonía", probability: "alta" },
  { code: "J20.9", description: "Bronquitis aguda", probability: "media" },
  { code: "U07.1", description: "COVID-19", probability: "considerar" }
]
```

### 3. Validación de Coherencia
```
Input: Códigos seleccionados + Notas médicas
Gemini: "Los códigos son coherentes con las notas. 
         Sugerencia: Agregar E11.9 si el paciente es diabético conocido."
```

### 4. Generación de Resumen
```
Input: Múltiples códigos CIE-10
Gemini: "Resumen: Paciente con diabetes tipo 2 descompensada,
         hipertensión arterial controlada, y episodio reciente
         de infección respiratoria alta."
```

## 📦 Recursos Descargables

### Archivos CIE-10 2025
1. **icd10cm_codes_2025.txt** (~5MB)
   - Todos los códigos válidos
   - Formato: CODE|DESCRIPTION

2. **icd10cm_order_2025.txt** (~8MB)
   - Códigos con jerarquía
   - Incluye categorías padre

3. **icd10cm_index_2025.txt** (~15MB)
   - Índice alfabético
   - Términos de búsqueda

### Fuente de Descarga
```
https://www.cms.gov/medicare/coding-billing/icd-10-codes/2025-icd-10-cm
```

## 🎯 Recomendación Final

### Implementación Óptima:
1. ✅ **Base de datos local** con 200-500 códigos más comunes
2. ✅ **Google Gemini AI** para traducción inteligente
3. ✅ **Caché** de búsquedas frecuentes
4. ⏳ **API de la OMS** como fallback (futuro)

### Ventajas:
- Rápido (local + AI)
- Inteligente (Gemini entiende contexto)
- Escalable (fácil agregar más códigos)
- Económico (Gemini free tier suficiente)
- Actualizable (cambiar base de datos anualmente)

## 🔐 Seguridad de API Key

**IMPORTANTE:** La API key de Gemini debe estar en variables de entorno:

```bash
# .env.local
GOOGLE_GEMINI_API_KEY=AIzaSyAviURp4_1s8L22pN0xI1mxqvuMpTFLhZU
```

**NUNCA** exponerla en el frontend. Todas las llamadas deben ser desde API routes de Next.js.

## 📚 Referencias

1. **OMS - CIE-10:** https://www.who.int/standards/classifications/classification-of-diseases
2. **CMS - ICD-10-CM:** https://www.cms.gov/medicare/coding-billing/icd-10-codes
3. **Google Gemini API:** https://ai.google.dev/docs
4. **NLM Clinical Tables:** https://clinicaltables.nlm.nih.gov/
5. **UMLS:** https://www.nlm.nih.gov/research/umls/

---

## 🚀 Próximos Pasos

1. Expandir base de datos local de CIE-10
2. Implementar API route para Gemini
3. Crear componente mejorado de autocompletado
4. Agregar validación con IA
5. Implementar sugerencias inteligentes
6. Caché de búsquedas frecuentes
7. Dashboard de estadísticas de códigos usados

¡Vamos a implementarlo! 🎉

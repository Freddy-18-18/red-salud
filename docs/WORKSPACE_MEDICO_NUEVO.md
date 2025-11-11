# Workspace Médico - Nueva Interfaz de Diagnóstico

## 🎯 Descripción

Hemos rediseñado completamente la interfaz de registro de pacientes y diagnóstico médico en `/dashboard/medico/pacientes/nuevo`. La nueva interfaz es:

- ✨ **Elegante y minimalista** - Diseño moderno sin distracciones
- 🤖 **IA integrada** - Asistente médico con Google Gemini
- 📱 **Sin scroll** - Todo visible en una sola pantalla
- ⚡ **Autocompletado inteligente** - Sugerencias en tiempo real
- 🔍 **Búsqueda ICD-11** - Integrada directamente en el workspace
- 💊 **Generación de recetas** - Lista para imprimir

## 🏗️ Arquitectura

### Componentes Principales

```
app/dashboard/medico/pacientes/nuevo/page.tsx
└── MedicalWorkspace (components/dashboard/medico/medical-workspace.tsx)
    ├── Panel Izquierdo: Chat IA
    ├── Panel Central: Editor de Notas
    └── Panel Derecho: Diagnósticos ICD-11
```

### Flujo de Trabajo

1. **Paso 1: Información del Paciente**
   - Validación de cédula con CNE
   - Autocompletado de nombre
   - Datos básicos (edad, género, contacto)

2. **Paso 2: Workspace Médico**
   - Chat IA para generar notas
   - Editor de notas médicas
   - Búsqueda y selección de códigos ICD-11
   - Guardar e imprimir

## 🎨 Diseño de la Interfaz

### Layout Principal

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Paciente Info | Botones (Imprimir, Guardar)        │
├──────────────┬──────────────────────────┬───────────────────┤
│              │                          │                   │
│  Chat IA     │   Editor de Notas        │  Diagnósticos     │
│  (384px)     │   (flex-1)               │  (320px)          │
│              │                          │                   │
│  - Mensajes  │   Tabs:                  │  - Lista de       │
│  - Input     │   • Notas Médicas        │    códigos ICD-11 │
│  - Sugerenc. │   • Búsqueda ICD-11      │  - Agregar/       │
│              │                          │    Eliminar       │
│              │                          │                   │
└──────────────┴──────────────────────────┴───────────────────┘
```

### Colores y Estilo

- **Fondo:** Gradiente sutil `from-gray-50 to-blue-50/30`
- **Paneles:** Blanco con bordes sutiles
- **Acentos:** Azul (`blue-500`) y Púrpura (`purple-500`)
- **Chat IA:** Gradiente `from-purple-500 to-blue-500`
- **Tipografía:** Sans-serif para UI, Mono para notas médicas

## 🤖 Funcionalidades del Asistente IA

### 1. Generación de Notas Médicas

**Comando:** "Generar nota sobre [síntomas]"

**Ejemplo:**
```
Usuario: Generar nota sobre dolor abdominal y fiebre
```

**Resultado:**
- Nota médica completa en formato SOAP
- Diagnósticos sugeridos
- Códigos ICD-11 automáticos
- Plan de tratamiento

### 2. Mejora de Notas Existentes

**Comando:** "Mejorar esta nota"

**Funcionalidad:**
- Reestructura la nota siguiendo formato SOAP
- Corrige gramática y ortografía
- Mejora terminología médica
- Agrega secciones faltantes

### 3. Búsqueda de Códigos ICD-11

**Comando:** "Buscar código para [diagnóstico]"

**Ejemplo:**
```
Usuario: Buscar código para gastritis aguda
```

**Resultado:**
- Cambia a la pestaña de búsqueda ICD-11
- Muestra resultados relevantes
- Permite agregar con un clic

### 4. Autocompletado Inteligente

El chat sugiere comandos comunes mientras escribes:

- "Generar nota médica sobre"
- "Buscar código ICD-11 para"
- "Sugerir diagnóstico para"
- "Crear receta para"
- "Mejorar esta nota:"

## 📋 Formato de Notas Médicas

### Formato SOAP

```
SUBJETIVO (S):
- Motivo de consulta
- Síntomas reportados por el paciente
- Historia de la enfermedad actual

OBJETIVO (O):
- Signos vitales
- Hallazgos del examen físico
- Resultados de laboratorio

ANÁLISIS (A):
- Impresión diagnóstica
- Diagnósticos diferenciales
- Códigos ICD-11

PLAN (P):
- Tratamiento farmacológico
- Indicaciones no farmacológicas
- Exámenes complementarios
- Seguimiento
```

## 🔍 Búsqueda ICD-11

### Características

- **Búsqueda en tiempo real** - Resultados mientras escribes
- **Múltiples criterios** - Por código, nombre o descripción
- **Agregar con un clic** - Directamente a la lista de diagnósticos
- **Información completa** - Código, título y definición

### Ejemplo de Uso

1. Cambiar a la pestaña "Búsqueda ICD-11"
2. Escribir: "diabetes"
3. Ver resultados:
   - 5A11 - Diabetes mellitus tipo 2
   - 5A10 - Diabetes mellitus tipo 1
   - etc.
4. Hacer clic en el resultado para agregarlo

## 💾 Guardar e Imprimir

### Guardar Paciente

Al hacer clic en "Guardar Paciente":

1. Se crea el registro del paciente en `offline_patients`
2. Se guardan todas las notas médicas
3. Se incluyen los códigos ICD-11 seleccionados
4. Se registra la actividad en el log
5. Redirección a la vista del paciente

### Imprimir Receta

Al hacer clic en "Imprimir":

1. Se abre el diálogo de impresión del navegador
2. Se muestra una vista optimizada para impresión
3. Incluye:
   - Datos del paciente
   - Notas médicas completas
   - Diagnósticos con códigos ICD-11
   - Fecha y hora

## 🔧 Configuración Requerida

### 1. Google Gemini API

**Obligatorio para el asistente IA**

```bash
# .env.local
GEMINI_API_KEY=tu_api_key_aqui
```

**Obtener API Key:**
1. Visita: https://aistudio.google.com/app/apikey
2. Crea una API key (gratis)
3. Agrégala al archivo `.env.local`
4. Reinicia el servidor

Ver guía completa: `CONFIGURACION_GEMINI_AI.md`

### 2. ICD-11 API

**Opcional - para búsqueda de códigos**

```bash
# .env.local
ICD_API_CLIENT_ID=tu_client_id
ICD_API_CLIENT_SECRET=tu_client_secret
```

**Obtener credenciales:**
1. Visita: https://icd.who.int/icdapi
2. Regístrate y obtén credenciales
3. Agrégalas al archivo `.env.local`

## 🎯 Casos de Uso

### Caso 1: Consulta Rápida

1. Médico ingresa cédula del paciente
2. Sistema autocompleta nombre desde CNE
3. Médico completa datos básicos
4. En el workspace, usa el chat IA:
   - "Generar nota sobre dolor de cabeza"
5. IA genera nota completa
6. Médico revisa y ajusta
7. Guarda el paciente

**Tiempo estimado:** 2-3 minutos

### Caso 2: Diagnóstico Complejo

1. Médico ingresa información del paciente
2. En el workspace, escribe notas manualmente
3. Usa el chat IA:
   - "Mejorar esta nota"
4. IA reestructura la nota
5. Médico busca códigos ICD-11:
   - Cambia a pestaña "Búsqueda ICD-11"
   - Busca "hipertensión"
   - Agrega código I10
6. Guarda e imprime

**Tiempo estimado:** 5-7 minutos

### Caso 3: Seguimiento de Paciente

1. Médico busca paciente existente por cédula
2. Sistema detecta que ya existe
3. Crea relación doctor-paciente
4. Agrega notas de seguimiento
5. Actualiza diagnósticos
6. Guarda cambios

**Tiempo estimado:** 3-4 minutos

## 🚀 Mejoras Futuras

### Corto Plazo

- [ ] Plantillas de notas médicas predefinidas
- [ ] Historial de notas anteriores del paciente
- [ ] Exportar a PDF directamente
- [ ] Firma digital del médico

### Mediano Plazo

- [ ] Reconocimiento de voz para dictar notas
- [ ] Integración con laboratorios
- [ ] Generación automática de recetas
- [ ] Sugerencias de medicamentos

### Largo Plazo

- [ ] IA predictiva para diagnósticos
- [ ] Análisis de tendencias en pacientes
- [ ] Integración con dispositivos médicos
- [ ] Telemedicina integrada

## 📊 Métricas de Éxito

### Objetivos

- ⏱️ **Reducir tiempo de consulta** de 10 min a 3-5 min
- 📝 **Mejorar calidad de notas** con formato SOAP consistente
- 🎯 **Aumentar precisión diagnóstica** con códigos ICD-11
- 😊 **Mejorar satisfacción del médico** con interfaz intuitiva

### KPIs

- Tiempo promedio de registro de paciente
- Número de notas generadas con IA
- Porcentaje de notas con códigos ICD-11
- Tasa de adopción del asistente IA

## 🐛 Solución de Problemas

### Error: "GEMINI_API_KEY no está configurada"

**Causa:** No se ha configurado la API key de Google Gemini

**Solución:**
1. Obtén tu API key en: https://aistudio.google.com/app/apikey
2. Agrégala al archivo `.env.local`
3. Reinicia el servidor

### Error: "No se pudo generar la nota"

**Causa:** Problema con la API de Gemini

**Solución:**
1. Verifica que la API key es válida
2. Verifica que no has excedido el límite gratuito
3. Revisa los logs del servidor para más detalles

### La búsqueda ICD-11 no funciona

**Causa:** Credenciales de ICD-11 API no configuradas

**Solución:**
1. Obtén credenciales en: https://icd.who.int/icdapi
2. Agrégalas al archivo `.env.local`
3. Reinicia el servidor

### El autocompletado no aparece

**Causa:** Necesitas escribir al menos 4 caracteres

**Solución:**
- Escribe más caracteres en el chat
- Las sugerencias aparecen automáticamente

## 📚 Recursos

- [Documentación de Google Gemini](https://ai.google.dev/gemini-api/docs)
- [API de ICD-11](https://icd.who.int/icdapi)
- [Formato SOAP](https://en.wikipedia.org/wiki/SOAP_note)
- [Guía de configuración Gemini](./CONFIGURACION_GEMINI_AI.md)

## 🤝 Contribuir

Para mejorar esta interfaz:

1. Identifica el problema o mejora
2. Crea un issue describiendo el cambio
3. Implementa la mejora
4. Prueba exhaustivamente
5. Crea un pull request

---

**Última actualización:** Noviembre 2025
**Versión:** 2.0.0
**Autor:** Equipo Red-Salud

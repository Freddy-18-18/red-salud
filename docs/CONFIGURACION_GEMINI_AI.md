# Configuración de Google Gemini AI

## ¿Qué es Gemini AI?

Google Gemini es el modelo de inteligencia artificial más avanzado de Google. En Red-Salud lo usamos para:

- ✨ **Generar notas médicas** estructuradas automáticamente
- 🔍 **Sugerir diagnósticos** basados en síntomas
- 📋 **Buscar códigos ICD-11** para diagnósticos
- 📝 **Mejorar y estructurar** notas médicas existentes
- 💊 **Crear recetas médicas** profesionales

## Obtener tu API Key (GRATIS)

1. **Visita Google AI Studio**
   - Ve a: https://aistudio.google.com/app/apikey
   - Inicia sesión con tu cuenta de Google

2. **Crear API Key**
   - Haz clic en "Create API Key"
   - Selecciona un proyecto de Google Cloud (o crea uno nuevo)
   - Copia la API key generada

3. **Configurar en Red-Salud**
   - Abre el archivo `.env.local` en la raíz del proyecto
   - Agrega la línea:
     ```
     GEMINI_API_KEY=tu_api_key_aqui
     ```
   - Guarda el archivo

4. **Reiniciar el servidor**
   ```bash
   npm run dev
   ```

## Límites Gratuitos

Gemini ofrece un plan gratuito muy generoso:

- **60 solicitudes por minuto**
- **1,500 solicitudes por día**
- **1 millón de tokens por mes**

Esto es más que suficiente para uso médico diario.

## Verificar que funciona

1. Ve a `/dashboard/medico/pacientes/nuevo`
2. Completa el Paso 1 (información del paciente)
3. En el Paso 2, usa el chat IA:
   - Escribe: "Generar nota sobre dolor abdominal"
   - Si funciona, verás una nota médica generada automáticamente

## Solución de Problemas

### Error: "GEMINI_API_KEY no está configurada"

**Solución:**
1. Verifica que el archivo `.env.local` existe en la raíz del proyecto
2. Verifica que la línea `GEMINI_API_KEY=...` está presente
3. Reinicia el servidor de desarrollo

### Error: "API key inválida"

**Solución:**
1. Verifica que copiaste la API key completa (sin espacios)
2. Genera una nueva API key en Google AI Studio
3. Reemplaza la API key en `.env.local`

### Error: "Quota exceeded"

**Solución:**
- Has excedido el límite gratuito
- Espera 24 horas para que se reinicie el límite diario
- O actualiza a un plan de pago en Google Cloud

## Seguridad

⚠️ **IMPORTANTE:**
- **NUNCA** compartas tu API key públicamente
- **NUNCA** la subas a GitHub o repositorios públicos
- El archivo `.env.local` está en `.gitignore` por seguridad
- Si accidentalmente expones tu API key, revócala inmediatamente en Google AI Studio

## Características del Asistente IA

### 1. Generación de Notas Médicas

El asistente puede generar notas completas siguiendo el formato SOAP:

- **S (Subjetivo):** Motivo de consulta, síntomas reportados
- **O (Objetivo):** Hallazgos del examen físico
- **A (Análisis):** Impresión diagnóstica
- **P (Plan):** Tratamiento y seguimiento

### 2. Sugerencias de Diagnóstico

Basándose en los síntomas, el asistente sugiere:
- Diagnósticos probables
- Diagnósticos diferenciales
- Códigos ICD-11 correspondientes

### 3. Búsqueda Inteligente ICD-11

El asistente puede buscar códigos ICD-11 por:
- Nombre de la enfermedad
- Síntomas
- Descripción en lenguaje natural

### 4. Mejora de Notas

Si ya tienes una nota escrita, el asistente puede:
- Estructurarla profesionalmente
- Corregir gramática y ortografía
- Agregar secciones faltantes
- Mejorar la terminología médica

## Ejemplos de Uso

### Ejemplo 1: Generar Nota Completa

**Usuario:** "Generar nota sobre paciente con fiebre y tos de 3 días"

**Asistente:** Genera una nota completa con:
- Motivo de consulta
- Historia de la enfermedad actual
- Examen físico sugerido
- Impresión diagnóstica (ej: Infección respiratoria alta)
- Plan de tratamiento
- Códigos ICD-11 sugeridos

### Ejemplo 2: Buscar Código ICD-11

**Usuario:** "Buscar código para diabetes tipo 2"

**Asistente:** Cambia a la pestaña de búsqueda ICD-11 y muestra:
- 5A11 - Diabetes mellitus tipo 2
- Códigos relacionados
- Definiciones

### Ejemplo 3: Mejorar Nota Existente

**Usuario:** "Mejorar esta nota"

**Asistente:** Toma la nota actual y la reestructura siguiendo el formato SOAP profesional.

## Privacidad y Datos

- Las consultas a Gemini AI se envían a los servidores de Google
- Google puede usar los datos para mejorar sus modelos
- **NO** envíes información personal identificable (nombres reales, cédulas)
- Usa datos genéricos o anonimizados para pruebas

## Soporte

Si tienes problemas con la configuración:
1. Revisa este documento
2. Verifica los logs del servidor (`npm run dev`)
3. Consulta la documentación oficial: https://ai.google.dev/gemini-api/docs

---

**Última actualización:** Noviembre 2025

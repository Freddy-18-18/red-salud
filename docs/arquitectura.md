# Arquitectura

## Visión general

Sistema de telemedicina con front-end Next.js (App Router) y backend gestionado vía Supabase (auth, DB, storage). El objetivo principal es velocidad de iteración y separación clara entre presentación y lógica de negocio.

## Capas

1. Presentación (`app/`, `components/`)
2. Lógica de feature (`hooks/`)
3. Servicios / Integraciones (`lib/supabase`, `lib/templates`, `lib/i18n`)
4. Datos (Supabase: tablas y migraciones)
5. Assets (`public/`)

## Principios

- SRP estricto (una responsabilidad por archivo)
- Archivos < 400 LOC
- Componentes UI atómicos o compuestos pero sin lógica de negocio pesada
- Hooks para orquestar estado y llamadas
- Servicios encapsulan acceso externo (supabase / APIs)

## Flujos principales

Paciente:
1. Autenticación → Perfil → Configuración → Citas / Telemedicina
Médico:
1. Autenticación → Workspace médico → Gestión de pacientes → Notas estructuradas

## i18n

Se migra a estructura por namespace y archivo por idioma. Lazy-load para reducir bundle.

## Telemedicina

Separar lógica de sesiones en hooks dedicados y servicios para métricas / historial.

## Próximos pasos sugeridos

- Extraer editor estructurado a paquete interno (`packages/editor-structured/`)
- Añadir tests unitarios a servicios críticos (migraciones, verificación médicos)
- Implementar code-splitting por ruta pesada

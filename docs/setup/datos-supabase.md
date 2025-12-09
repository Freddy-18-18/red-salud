# Datos y Supabase

## Uso principal

- Auth (usuarios, perfiles)
- Tablas de paciente (detalles médicos, preferencias, notificaciones, privacidad)
- Verificación médicos (migraciones específicas)

## Buenas prácticas

- Un servicio por entidad en `lib/supabase/services/`
- Evitar lógica de parsing en las páginas; usar funciones helpers
- Revisar políticas RLS al agregar nuevas tablas

## Migraciones

Mantener migraciones claras y con prefijos incrementales. Priorizar dividir migraciones largas (>500 líneas) por temática.

## Próximos pasos sugeridos

- Añadir tests para servicios críticos (verificación médicos, telemedicina)
- Implementar caché client-side ligera para lecturas repetidas

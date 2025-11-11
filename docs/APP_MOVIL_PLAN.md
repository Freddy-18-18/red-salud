# App Móvil (React Native + Expo)

Este documento describe la arquitectura, dependencias y pasos para la app móvil nativa enfocada primero en el Dashboard de Paciente.

## Objetivos
- Experiencia 100% nativa con Expo + React Native.
- Reutilizar lógica/Tipos en `packages/core`.
- Autenticación real con Supabase, persistencia con AsyncStorage.
- Datos con React Query y UI minimalista con NativeWind (Tailwind).

## Estructura
```
/mobile
  app/
    (auth)/login.tsx
    (tabs)/
      _layout.tsx
      paciente/
        index.tsx
        citas/
          index.tsx
          nueva.tsx
        telemedicina/
          index.tsx
          sesion/[id].tsx
        medicamentos/index.tsx
        laboratorio/index.tsx
    _layout.tsx
    +not-found.tsx
  src/
    components/ui/{Button.tsx,Card.tsx}
    providers/{AuthProvider.tsx,QueryProvider.tsx}
    services/
      supabaseClient.ts
      paciente/{citas.ts,telemedicina.ts,perfil.ts}
  package.json, app.json, tsconfig.json, babel.config.js, tailwind.config.js, nativewind.d.ts
/packages/core
  src/{index.ts,types/paciente.ts,utils/format.ts}
  package.json, tsconfig.json
```

## Dependencias principales
- expo, expo-router, react, react-native
- @tanstack/react-query
- @supabase/supabase-js, @react-native-async-storage/async-storage, expo-linking, expo-secure-store
- nativewind, tailwindcss

## Configuración Supabase
- RN no soporta `detectSessionInUrl`; usar `detectSessionInUrl: false`.
- `storage: AsyncStorage` con `persistSession: true` y `autoRefreshToken: true`.
- Definir `scheme` (por ejemplo `redsalud`) para deep links en `app.json`.

## Flujo de navegación
- Expo Router con Tabs para "Paciente" y subrutas para Citas, Telemedicina, etc.
- `AuthProvider` escucha sesión y `AuthGate` redirige a `(auth)/login` si no hay sesión.

## Pasos para ejecutar (opcional)
```
cd mobile
npm install
npm run dev
```

## Próximos hitos
- Migrar HomePaciente con datos reales (perfil, próximas citas).
- Implementar creación de cita.
- Telemedicina: integrar cámara/micro (react-native-webrtc) en una fase posterior.

## Notas
- Mantener archivos < 400 líneas y modularizar.
- Colocar lógica compartible en `packages/core` (tipos, utilidades, formateos).

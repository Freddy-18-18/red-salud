# Cómo generar el APK release de Red Salud Paciente

## Pre-requisitos (instalación una sola vez)

Estos comandos los corrés vos en una terminal con tu usuario.

```bash
# Si todavía no instalaste el toolchain (scoop):
scoop bucket add extras
scoop bucket add java
scoop install temurin17-jdk
scoop install flutter
scoop install android-studio

# Verificar
java --version          # debe decir Temurin 17.x
flutter --version       # debe decir Flutter 3.41.x
```

## 1. Configurar Android SDK

Abrí Android Studio una vez. Te va a pedir aceptar licencias y descargar:
- Android SDK 34 (o la última)
- Android SDK Build-Tools
- Android SDK Command-line Tools
- Emulator (opcional)

Después en una terminal:

```bash
flutter doctor --android-licenses    # Acepta todo con `y`
flutter doctor                       # Tiene que estar todo en verde
```

## 2. Generar la carpeta `android/` del proyecto

El proyecto ya tiene `lib/` completo, pero falta el shell nativo Android. Desde la raíz del proyecto Flutter:

```bash
cd C:/Users/Fredd/Dev/red-salud/apps/paciente/mobile
flutter create . --platforms=android --org com.redsalud
flutter pub get
```

> Esto NO sobreescribe tu `lib/` ni tu `pubspec.yaml` — solo crea la carpeta `android/` con el Gradle setup.

## 3. Generar tu keystore (UNA sola vez en tu vida)

El keystore es **TUYO** — quien lo tiene puede publicar updates de la app. Si lo perdés, no podés actualizar la app en Play Store nunca más. Guardalo en un lugar seguro (1Password, etc.).

```bash
keytool -genkey -v \
  -keystore C:/Users/Fredd/red-salud-paciente.jks \
  -alias paciente \
  -keyalg RSA -keysize 2048 -validity 10000
```

Te va a pedir:
- Password del keystore (mínimo 6 caracteres)
- Tus datos (nombre, organización, ciudad, etc.)

## 4. Configurar Gradle para usar tu keystore

Crear `apps/paciente/mobile/android/key.properties` (NO COMMITEAR):

```properties
storePassword=tu-password-del-keystore
keyPassword=tu-password-del-keystore
keyAlias=paciente
storeFile=C:/Users/Fredd/red-salud-paciente.jks
```

Editar `apps/paciente/mobile/android/app/build.gradle.kts` (o `build.gradle`), agregar antes del bloque `android {`:

```kotlin
import java.util.Properties
import java.io.FileInputStream

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}
```

Y dentro del bloque `android { ... }`:

```kotlin
signingConfigs {
    create("release") {
        keyAlias = keystoreProperties["keyAlias"] as String
        keyPassword = keystoreProperties["keyPassword"] as String
        storeFile = keystoreProperties["storeFile"]?.let { file(it as String) }
        storePassword = keystoreProperties["storePassword"] as String
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
        isShrinkResources = true
    }
}
```

Y cambiar el `applicationId` a `com.redsalud.paciente`.

## 5. Compilar el APK release

```bash
cd C:/Users/Fredd/Dev/red-salud/apps/paciente/mobile

flutter pub get

# Build con tus envs reales
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://hwckkfiirldgundbcjsp.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY \
  --dart-define=API_GATEWAY_URL=http://10.0.2.2:8080
```

> `10.0.2.2` es la IP de tu PC vista desde el emulador Android. Si vas a probar en tu **móvil físico** conectado por USB, reemplazá por la IP de tu PC en la red local (ej. `http://192.168.1.50:8080`) y asegurate que el firewall de Windows permita esa conexión.

El APK queda en:
```
build/app/outputs/flutter-apk/app-release.apk
```

## 6. Instalar en tu móvil

**Opción A — vía adb (cable USB)**:
```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

**Opción B — sin cable**:
1. Copiá el `.apk` al teléfono (Drive, Telegram a vos mismo, etc.)
2. En el teléfono, abrilo y permití "Instalar de fuentes desconocidas" si pide
3. Listo

## Login de prueba

Usuario paciente seedeado:
- Email: `paciente.prueba@redsalud.test`
- Password: `TestRS!2026Pat`

Vas a ver los 3 doctores reales del SACS:
- Marlin Sanchez (Medicina Interna)
- Karim Moukhallalele (Infectología Pediátrica)
- Jose Montilla (Urología)

## Troubleshooting

- **`flutter doctor` falla en `Android toolchain`**: corré `flutter doctor --android-licenses`.
- **`flutter pub get` falla por `red_salud_flutter_core`**: el `pubspec.yaml` referencia `../../../packages/flutter-core`. Si estás compilando desde otra ubicación, ajustá el path o copiá el package.
- **APK abre y crashea al login**: `API_GATEWAY_URL` debe apuntar a una URL alcanzable desde el teléfono. `127.0.0.1` NO funciona desde móvil físico — usá la IP de tu PC en la red.

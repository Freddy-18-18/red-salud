# 📘 Guía de Uso: Sistema de Secretarias Médicas

## 🎯 Resumen Ejecutivo

El sistema de secretarias permite que los médicos deleguen tareas administrativas a personal de confianza, manteniendo control total sobre los permisos y accesos.

### Características Principales
- ✅ Cada secretaria tiene su propia cuenta segura
- ✅ Permisos granulares configurables por médico
- ✅ Sincronización en tiempo real
- ✅ Auditoría completa de acciones
- ✅ Soporte para múltiples médicos por secretaria

## 👥 Para Médicos

### 1. Agregar una Secretaria

#### Paso 1: Verificar que la secretaria esté registrada
La secretaria debe primero crear su cuenta:
1. Ir a `https://tu-dominio.com/register/secretaria`
2. Completar el formulario de registro
3. Confirmar su email

#### Paso 2: Vincular la secretaria (Próximamente)
```
1. Ir a Dashboard → Configuración → Secretarias
2. Clic en "Agregar Secretaria"
3. Ingresar el email de la secretaria
4. Configurar permisos (o usar los predeterminados)
5. Guardar
```

**Permisos Predeterminados:**
- ✅ Ver agenda
- ✅ Crear citas
- ✅ Editar citas
- ✅ Cancelar citas
- ✅ Ver pacientes
- ✅ Registrar pacientes
- ❌ Ver historias clínicas
- ✅ Enviar mensajes
- ❌ Ver estadísticas

### 2. Gestionar Permisos

Puedes personalizar qué puede hacer cada secretaria:

```typescript
// Ejemplo de permisos personalizados
{
  can_view_agenda: true,           // Puede ver la agenda
  can_create_appointments: true,   // Puede crear citas
  can_edit_appointments: false,    // NO puede editar citas
  can_cancel_appointments: false,  // NO puede cancelar citas
  can_view_patients: true,         // Puede ver pacientes
  can_register_patients: false,    // NO puede registrar pacientes
  can_view_medical_records: false, // NO puede ver historias
  can_send_messages: true,         // Puede enviar mensajes
  can_view_statistics: false,      // NO puede ver estadísticas
}
```

### 3. Desactivar una Secretaria

Si necesitas revocar el acceso temporalmente:
```
1. Ir a Dashboard → Configuración → Secretarias
2. Encontrar la secretaria
3. Cambiar estado a "Inactiva"
4. El acceso se bloquea inmediatamente
```

### 4. Eliminar una Secretaria

Para remover permanentemente:
```
1. Ir a Dashboard → Configuración → Secretarias
2. Encontrar la secretaria
3. Clic en "Eliminar"
4. Confirmar la acción
```

### 5. Ver Actividad de Secretarias

Monitorea qué hacen tus secretarias:
```
1. Ir a Dashboard → Configuración → Secretarias
2. Clic en "Ver Actividad"
3. Revisar el registro de acciones
```

## 👩‍💼 Para Secretarias

### 1. Registro Inicial

#### Crear tu cuenta:
1. Ir a `https://tu-dominio.com/register/secretaria`
2. Completar el formulario:
   - Nombre completo
   - Email (importante: usa el email que el médico conoce)
   - Contraseña segura
   - Teléfono
3. Confirmar tu email
4. Esperar que el médico te agregue

### 2. Primer Inicio de Sesión

```
1. Ir a https://tu-dominio.com/login/secretaria
2. Ingresar tu email y contraseña
3. Si el médico ya te agregó, verás el dashboard
4. Si no, verás un mensaje indicando que esperes
```

### 3. Trabajar con Múltiples Médicos

Si trabajas para varios médicos:

```
1. Iniciar sesión normalmente
2. En el menú lateral, verás un selector de médico
3. Seleccionar el médico con el que quieres trabajar
4. El dashboard se actualiza con los datos de ese médico
5. Tus permisos pueden ser diferentes para cada médico
```

### 4. Gestionar la Agenda

#### Ver la agenda:
```
1. Dashboard → Agenda
2. Verás el calendario del médico actual
3. Puedes cambiar entre vista día, semana y mes
```

#### Crear una cita:
```
1. Dashboard → Agenda → Nueva Cita
2. O hacer clic en un horario vacío del calendario
3. Completar el formulario:
   - Paciente (buscar o crear nuevo)
   - Fecha y hora
   - Duración
   - Motivo de consulta
   - Tipo de cita
4. Guardar
```

#### Editar una cita:
```
1. Hacer clic en la cita en el calendario
2. Clic en "Editar"
3. Modificar los campos necesarios
4. Guardar cambios
```

#### Cancelar una cita:
```
1. Hacer clic en la cita en el calendario
2. Clic en "Cancelar"
3. Ingresar motivo de cancelación
4. Confirmar
```

### 5. Gestionar Pacientes

#### Ver lista de pacientes:
```
1. Dashboard → Pacientes
2. Verás todos los pacientes del médico
3. Puedes buscar y filtrar
```

#### Registrar un nuevo paciente:
```
1. Dashboard → Pacientes → Nuevo Paciente
2. Completar el formulario:
   - Datos personales
   - Contacto
   - Información médica básica
3. Guardar
```

### 6. Enviar Mensajes

```
1. Dashboard → Mensajes
2. Seleccionar un paciente
3. Escribir el mensaje
4. Enviar
```

**Nota:** Los mensajes aparecen como enviados por el médico, pero se registra que fuiste tú quien los envió.

### 7. Cambiar de Médico

Si trabajas con varios médicos:

```
1. En el menú lateral, busca el selector de médico
2. Haz clic en el nombre del médico actual
3. Selecciona otro médico de la lista
4. El dashboard se actualiza automáticamente
```

### 8. Cerrar Sesión

```
1. Menú lateral → Cerrar Sesión
2. O hacer clic en tu avatar → Cerrar Sesión
```

## 🔐 Seguridad y Buenas Prácticas

### Para Médicos

1. **Revisa los permisos regularmente**
   - Asegúrate de que cada secretaria tenga solo los permisos necesarios
   - Principio de mínimo privilegio

2. **Monitorea la actividad**
   - Revisa el registro de actividades periódicamente
   - Identifica patrones inusuales

3. **Actualiza permisos según necesidad**
   - Si una secretaria cambia de rol, ajusta sus permisos
   - Revoca acceso cuando ya no sea necesario

4. **Usa contraseñas fuertes**
   - Tu cuenta es la que controla todo
   - Activa 2FA cuando esté disponible

### Para Secretarias

1. **Protege tus credenciales**
   - Nunca compartas tu contraseña
   - No dejes tu sesión abierta en computadoras compartidas

2. **Cierra sesión al terminar**
   - Especialmente en computadoras públicas
   - Usa "Recordarme" solo en dispositivos personales

3. **Verifica antes de actuar**
   - Confirma datos del paciente antes de crear citas
   - Revisa horarios disponibles

4. **Comunica con el médico**
   - Si necesitas más permisos, solicítalos
   - Reporta cualquier problema técnico

## ❓ Preguntas Frecuentes

### Para Médicos

**P: ¿Cuántas secretarias puedo tener?**
R: No hay límite. Puedes tener tantas secretarias como necesites.

**P: ¿Puedo tener diferentes permisos para cada secretaria?**
R: Sí, cada relación médico-secretaria tiene sus propios permisos.

**P: ¿Las secretarias pueden ver las historias clínicas?**
R: Solo si les das ese permiso específicamente. Por defecto, NO pueden.

**P: ¿Cómo sé qué hizo cada secretaria?**
R: Todas las acciones se registran con el ID de quien las realizó.

**P: ¿Puedo reactivar una secretaria desactivada?**
R: Sí, solo cambia su estado de "Inactiva" a "Activa".

### Para Secretarias

**P: ¿Puedo trabajar para varios médicos?**
R: Sí, puedes estar vinculada a múltiples médicos con una sola cuenta.

**P: ¿Los pacientes saben que soy secretaria?**
R: Los mensajes y acciones aparecen como del médico, pero se registra internamente.

**P: ¿Qué hago si no puedo hacer algo?**
R: Probablemente no tienes ese permiso. Contacta al médico para solicitarlo.

**P: ¿Puedo cambiar mis datos personales?**
R: Sí, en Dashboard → Perfil puedes actualizar tu información.

**P: ¿Qué pasa si olvido mi contraseña?**
R: Usa la opción "Olvidé mi contraseña" en el login.

## 🆘 Soporte

### Problemas Comunes

#### "No tengo médicos asignados"
- Verifica que el médico te haya agregado
- Confirma que usaste el email correcto al registrarte
- Contacta al médico para que verifique

#### "No puedo crear citas"
- Verifica que tengas el permiso `can_create_appointments`
- Contacta al médico para solicitar el permiso

#### "No veo la agenda"
- Verifica que tengas el permiso `can_view_agenda`
- Asegúrate de haber seleccionado un médico

#### "El selector de médico no aparece"
- Solo aparece si trabajas con múltiples médicos
- Si solo tienes un médico, se selecciona automáticamente

## 📞 Contacto

Para soporte técnico:
- Email: soporte@red-salud.com
- Teléfono: +1 (555) 123-4567
- Chat en vivo: Disponible en el dashboard

## 🔄 Actualizaciones

Este sistema se actualiza regularmente. Mantente al tanto de:
- Nuevas funcionalidades
- Mejoras de seguridad
- Cambios en la interfaz

**Última actualización:** Noviembre 2025
**Versión:** 1.0.0

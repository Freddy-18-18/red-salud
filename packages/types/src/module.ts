/**
 * @file module.ts
 * @description Interfaces estrictas para el sistema de módulos médicos.
 *
 * Cada módulo declara explícitamente sus requerimientos de contexto,
 * permisos, datos y capacidades del runtime. El WidgetRegistry usa
 * estas declaraciones para prevenir la configuración de un módulo
 * en un contexto donde fallaría.
 *
 * @module Module
 */

// ============================================================================
// CONTEXT REQUIREMENTS — "¿Qué necesita este módulo para funcionar?"
// ============================================================================

/**
 * Requisitos de datos que un módulo necesita del contexto.
 * Si `required: true`, el módulo NO se renderiza sin ese dato.
 * Si `required: false`, funciona con funcionalidad reducida.
 */
export interface ModuleDataRequirement<T = unknown> {
  /** Identificador semántico del dato: 'patientId', 'appointmentId', etc. */
  key: string;
  /** Tipo TypeScript en string para documentación: 'string', 'string[]', etc. */
  type: string;
  /** Si el módulo falla sin este dato */
  required: boolean;
  /** Descripción legible para devs y UI de administración */
  description: string;
  /** Función de validación runtime — recibe el valor y retorna si es válido */
  validate?: (value: T) => boolean;
  /** Valor por defecto cuando no se provee y required=false */
  defaultValue?: T;
}

/**
 * Requisitos de permisos. Mapea al sistema RBAC existente.
 */
export interface ModulePermissionRequirement {
  /** Clave del permiso: 'can_view_patients', 'can_prescribe', etc. */
  permission: string;
  /** Si es estrictamente necesario o solo mejora la experiencia */
  required: boolean;
  /** Descripción legible */
  description: string;
}

/**
 * Capacidades del runtime que el módulo necesita.
 * Ejemplo: un módulo de imágenes DICOM necesita WebGL.
 */
export type RuntimeCapability =
  | 'webgl'           // Renderizado 3D (modelos dentales, imágenes)
  | 'camera'          // Acceso a cámara (telemedicina, fotos clínicas)
  | 'microphone'      // Acceso a micrófono (telemedicina, VoIP)
  | 'geolocation'     // GPS (ambulancias, visitas domiciliarias)
  | 'notifications'   // Push notifications
  | 'offline'         // Funciona offline (Tauri/PWA)
  | 'bluetooth'       // Dispositivos médicos vía BLE
  | 'print'           // Impresión (recetas, órdenes)
  | 'file-system'     // Acceso al filesystem (Tauri)
  | 'clipboard'       // Portapapeles
  | 'speech'          // Reconocimiento de voz (dictado clínico)
  | 'websocket'       // Conexión en tiempo real
  | 'indexeddb';      // Almacenamiento local grande

/**
 * Roles del sistema que pueden acceder al módulo
 */
export type ModuleAccessRole =
  | 'medico'
  | 'profesional_salud'
  | 'tecnico_salud'
  | 'secretaria'
  | 'admin'
  | 'paciente';

/**
 * Verificación profesional requerida
 */
export type VerificationLevel =
  | 'none'           // Sin verificación (demos, previews)
  | 'email'          // Solo email verificado
  | 'profile'        // Perfil profesional completo
  | 'sacs'           // Verificación SACS (Venezuela)
  | 'license'        // Licencia profesional verificada
  | 'board_certified'; // Certificación de especialidad

// ============================================================================
// CONTEXTO DISPONIBLE — "¿Qué provee el dashboard al módulo?"
// ============================================================================

/**
 * Contexto que el dashboard inyecta a los módulos.
 * Los módulos declaran qué keys de este contexto necesitan.
 */
export interface ModuleRuntimeContext {
  // === Identidad ===
  /** ID del médico autenticado */
  userId: string;
  /** ID del perfil del médico */
  profileId: string;
  /** Rol del usuario actual */
  userRole: ModuleAccessRole;

  // === Especialidad ===
  /** ID de la especialidad detectada */
  specialtyId: string;
  /** Categoría de la especialidad */
  specialtyCategory: string;
  /** Nombre de la especialidad */
  specialtyName: string;

  // === Verificación ===
  /** Nivel de verificación actual del médico */
  verificationLevel: VerificationLevel;
  /** Si está verificado por SACS */
  isVerified: boolean;

  // === Paciente (opcional, depende de la ruta) ===
  /** ID del paciente seleccionado */
  patientId?: string;
  /** Datos básicos del paciente */
  patientData?: {
    id: string;
    nombre_completo: string;
    cedula?: string;
    fecha_nacimiento?: string;
    sexo?: string;
  };

  // === Cita (opcional) ===
  /** ID de la cita activa */
  appointmentId?: string;

  // === Consulta (opcional) ===
  /** ID de la consulta activa */
  consultationId?: string;

  // === Consultorio ===
  /** ID del consultorio/oficina actual */
  officeId?: string;

  // === Runtime ===
  /** Plataforma actual */
  platform: 'web' | 'tauri' | 'mobile';
  /** Capacidades disponibles del runtime */
  availableCapabilities: RuntimeCapability[];
  /** Si tiene conexión a internet */
  isOnline: boolean;
  /** Locale del usuario */
  locale: string;
}

// ============================================================================
// MODULE CONTEXT CONTRACT — El contrato estricto del módulo
// ============================================================================

/**
 * Contrato de contexto de un módulo.
 * Define TODO lo que el módulo necesita del exterior.
 * El WidgetRegistry valida este contrato antes de permitir
 * que el módulo se monte.
 */
export interface ModuleContextContract {
  // === Datos requeridos del runtime context ===
  /**
   * Keys del ModuleRuntimeContext que este módulo necesita.
   * Ejemplo: ['patientId', 'appointmentId']
   * El registry verifica que estos campos existan y no sean undefined.
   */
  requiredContextKeys: (keyof ModuleRuntimeContext)[];

  /**
   * Keys opcionales que mejoran la funcionalidad.
   * El módulo funciona sin ellos pero con capacidades reducidas.
   */
  optionalContextKeys?: (keyof ModuleRuntimeContext)[];

  /**
   * Requisitos de datos custom (más allá del runtime context).
   * Para datos que vienen de props o queries específicas.
   */
  dataRequirements?: ModuleDataRequirement[];

  // === Permisos y acceso ===
  /**
   * Roles que pueden acceder a este módulo.
   * Vacío = todos los roles.
   */
  allowedRoles: ModuleAccessRole[];

  /**
   * Permisos granulares requeridos.
   */
  permissions?: ModulePermissionRequirement[];

  /**
   * Nivel mínimo de verificación profesional.
   */
  minimumVerification: VerificationLevel;

  // === Especialidades compatibles ===
  /**
   * IDs de especialidades que pueden usar este módulo.
   * `['*']` = todas las especialidades.
   * Vacío `[]` = ninguna (módulo deshabilitado).
   */
  compatibleSpecialties: string[];

  /**
   * Categorías de especialidad compatibles.
   * Se combinan con `compatibleSpecialties` (OR logic).
   * `['*']` = todas.
   */
  compatibleCategories?: string[];

  // === Runtime ===
  /**
   * Capacidades del runtime que el módulo necesita obligatoriamente.
   */
  requiredCapabilities?: RuntimeCapability[];

  /**
   * Capacidades opcionales que habilitan features extra.
   */
  optionalCapabilities?: RuntimeCapability[];

  /**
   * Plataformas soportadas. Vacío = todas.
   */
  supportedPlatforms?: ('web' | 'tauri' | 'mobile')[];
}

// ============================================================================
// MODULE DEFINITION — La definición completa y estricta de un módulo
// ============================================================================

/**
 * Grupo funcional al que pertenece un módulo (sidebar navigation).
 */
export type ModuleGroup =
  | 'clinical'
  | 'financial'
  | 'lab'
  | 'technology'
  | 'communication'
  | 'growth'
  | 'administrative'
  | 'education';

/**
 * Tamaño del widget cuando se muestra en el dashboard grid.
 */
export type ModuleWidgetSize = 'small' | 'medium' | 'large' | 'full';

/**
 * Estado del ciclo de vida de un módulo.
 */
export type ModuleLifecycleStatus =
  | 'stable'       // Producción, fully tested
  | 'beta'         // Funcional pero puede tener bugs
  | 'alpha'        // En desarrollo activo
  | 'deprecated'   // Se va a remover
  | 'experimental'; // Proof of concept

/**
 * Definición estricta y completa de un módulo médico.
 *
 * Esta es la interfaz maestra. TODO módulo del sistema —ya sea
 * un item del sidebar, un widget del dashboard, o une page route—
 * DEBE implementar esta interfaz.
 *
 * @example
 * ```ts
 * const consultaModule: ModuleDefinition = {
 *   id: 'clinical-consultation',
 *   name: 'Consulta Médica',
 *   slug: 'consulta',
 *   version: '2.0.0',
 *   group: 'clinical',
 *   icon: 'Stethoscope',
 *   description: 'Módulo de consulta con notas SOAP',
 *   route: '/dashboard/medico/consulta',
 *   lifecycle: 'stable',
 *   context: {
 *     requiredContextKeys: ['userId', 'profileId'],
 *     optionalContextKeys: ['patientId', 'appointmentId'],
 *     allowedRoles: ['medico', 'profesional_salud'],
 *     minimumVerification: 'profile',
 *     compatibleSpecialties: ['*'],
 *   },
 *   widget: {
 *     enabled: true,
 *     defaultSize: 'medium',
 *     defaultVisible: true,
 *   },
 * };
 * ```
 */
export interface ModuleDefinition {
  // === Identificación ===
  /** ID único global: 'clinical-consultation', 'dental-periodontogram' */
  id: string;
  /** Nombre legible: 'Consulta Médica', 'Periodontograma' */
  name: string;
  /** Slug para URL: 'consulta', 'periodontograma' */
  slug: string;
  /** Versión semántica del módulo */
  version: string;

  // === Organización ===
  /** Grupo funcional para el sidebar */
  group: ModuleGroup;
  /** Nombre del icono Lucide */
  icon: string;
  /** Descripción corta para tooltips y documentación */
  description: string;
  /** Descripción larga para marketplace/admin */
  longDescription?: string;
  /** Tags para búsqueda y filtrado */
  tags?: string[];
  /** Orden de aparición dentro del grupo (menor = primero) */
  order?: number;

  // === Navegación ===
  /** Ruta absoluta del módulo */
  route: string;
  /** Ruta del componente para dynamic import */
  componentPath?: string;

  // === Contrato de contexto (LO MÁS IMPORTANTE) ===
  /** Contrato estricto de lo que necesita el módulo */
  context: ModuleContextContract;

  // === Widget Dashboard ===
  /** Configuración del widget si el módulo se puede mostrar en el dashboard grid */
  widget?: {
    /** Si tiene representación como widget */
    enabled: boolean;
    /** Path al componente del widget (puede ser distinto al módulo completo) */
    componentPath?: string;
    /** Tamaño default en el grid */
    defaultSize: ModuleWidgetSize;
    /** Si se muestra por defecto al crear el dashboard */
    defaultVisible: boolean;
    /** Posición sugerida en el grid */
    defaultPosition?: { row: number; col: number };
    /** Si el widget necesita datos en tiempo real */
    realtime?: boolean;
    /** Intervalo de refresh en ms (si no es realtime) */
    refreshInterval?: number;
  };

  // === KPIs ===
  /** KPIs que este módulo contribuye al dashboard */
  kpiKeys?: string[];

  // === Lifecycle ===
  /** Estado del ciclo de vida */
  lifecycle: ModuleLifecycleStatus;
  /** Fecha de deprecación si aplica */
  deprecatedAt?: string;
  /** Módulo que lo reemplaza si deprecated */
  replacedBy?: string;

  // === Habilitación ===
  /** Si está habilitado por defecto en una especialidad que lo incluye */
  enabledByDefault: boolean;
  /** Settings específicos del módulo */
  settings?: Record<string, unknown>;
}

// ============================================================================
// VALIDATION RESULT — Resultado de validar un módulo contra un contexto
// ============================================================================

/**
 * Tipo de error de validación.
 */
export type ModuleValidationErrorType =
  | 'missing_context'        // Falta un contextKey requerido
  | 'invalid_role'           // El rol del usuario no tiene acceso
  | 'insufficient_verification' // Nivel de verificación insuficiente
  | 'incompatible_specialty' // La especialidad no es compatible
  | 'missing_capability'     // Falta una capacidad del runtime
  | 'unsupported_platform'   // Plataforma no soportada
  | 'missing_permission'     // Falta un permiso requerido
  | 'invalid_data'           // Un dato custom no pasó la validación
  | 'deprecated_module';     // El módulo está deprecado

/**
 * Error individual de validación.
 */
export interface ModuleValidationError {
  /** Tipo de error */
  type: ModuleValidationErrorType;
  /** Mensaje legible */
  message: string;
  /** Campo o key que causó el error */
  field?: string;
  /** Si el error es bloqueante (impide renderizar) o solo un warning */
  severity: 'error' | 'warning';
}

/**
 * Resultado de validar un módulo contra un contexto runtime.
 *
 * @example
 * ```ts
 * const result = validateModule(perioModule, runtimeContext);
 * if (!result.canMount) {
 *   console.error('Cannot mount:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.warn('Degraded mode:', result.warnings);
 * }
 * ```
 */
export interface ModuleValidationResult {
  /** Si el módulo se puede montar en este contexto */
  canMount: boolean;
  /** Errores bloqueantes */
  errors: ModuleValidationError[];
  /** Warnings (módulo funciona pero con capacidades reducidas) */
  warnings: ModuleValidationError[];
  /** Context keys que están disponibles */
  availableContextKeys: string[];
  /** Context keys que faltan (requeridos) */
  missingRequiredKeys: string[];
  /** Context keys opcionales que faltan */
  missingOptionalKeys: string[];
  /** Capacidades que faltan */
  missingCapabilities: RuntimeCapability[];
}

// ============================================================================
// MODULE REGISTRY TYPES — Para el registro y descubrimiento de módulos
// ============================================================================

/**
 * Filtros para buscar módulos en el registry.
 */
export interface ModuleSearchFilter {
  /** Filtrar por grupo */
  group?: ModuleGroup;
  /** Filtrar por especialidad compatible */
  specialtyId?: string;
  /** Filtrar por categoría de especialidad */
  specialtyCategory?: string;
  /** Filtrar por lifecycle status */
  lifecycle?: ModuleLifecycleStatus | ModuleLifecycleStatus[];
  /** Filtrar por tags */
  tags?: string[];
  /** Solo módulos habilitados por defecto */
  enabledByDefault?: boolean;
  /** Solo módulos con widget */
  hasWidget?: boolean;
  /** Filtrar por plataforma soportada */
  platform?: 'web' | 'tauri' | 'mobile';
  /** Filtrar por capacidad requerida */
  capability?: RuntimeCapability;
  /** Filtrar por rol */
  role?: ModuleAccessRole;
  /** Texto libre para buscar en name, description, tags */
  search?: string;
}

/**
 * Resultado de una búsqueda en el registry.
 */
export interface ModuleSearchResult {
  /** Módulos que coinciden con el filtro */
  modules: ModuleDefinition[];
  /** Total de módulos registrados */
  totalRegistered: number;
  /** Filtros aplicados */
  appliedFilters: ModuleSearchFilter;
}

/**
 * Snapshot de la tabla `module_registry` en Supabase.
 * Almacena la configuración de habilitación por médico.
 */
export interface DoctorModulePreference {
  /** UUID del registro */
  id: string;
  /** UUID del médico */
  doctor_id: string;
  /** ID del módulo */
  module_id: string;
  /** Si el médico lo tiene habilitado */
  is_enabled: boolean;
  /** Orden personalizado dentro del grupo */
  custom_order?: number;
  /** Settings personalizados del módulo para este médico */
  custom_settings?: Record<string, unknown>;
  /** Timestamps */
  created_at: string;
  updated_at: string;
}

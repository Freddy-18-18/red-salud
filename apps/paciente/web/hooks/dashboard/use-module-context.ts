'use client';

// ============================================
// useModuleContext Hook
// Validates a module against the current runtime context
// and provides safe access patterns.
// ============================================

import { useMemo, useCallback } from 'react';
import type {
  ModuleDefinition,
  ModuleRuntimeContext,
  ModuleValidationResult,
  ModuleGroup,
  RuntimeCapability,
  VerificationLevel,
} from '@red-salud/types';
import {
  validateModule,
  filterMountableModules,
} from '@/lib/specialties/core/module-validator';
import {
  getModulesForContext,
  getModulesForGroup,
  getWidgetModulesForContext,
  validateModuleInContext,
} from '@/lib/specialties/core/module-registry';

// ============================================================================
// RUNTIME CONTEXT BUILDER
// ============================================================================

/**
 * Build a ModuleRuntimeContext from common dashboard props.
 * Use this to create the context object that modules are validated against.
 */
export function buildRuntimeContext(params: {
  userId: string;
  profileId: string;
  userRole: ModuleRuntimeContext['userRole'];
  specialtyId: string;
  specialtyCategory: string;
  specialtyName: string;
  verificationLevel: VerificationLevel;
  isVerified: boolean;
  patientId?: string;
  appointmentId?: string;
  consultationId?: string;
  officeId?: string;
  platform?: 'web' | 'tauri' | 'mobile';
}): ModuleRuntimeContext {
  return {
    userId: params.userId,
    profileId: params.profileId,
    userRole: params.userRole,
    specialtyId: params.specialtyId,
    specialtyCategory: params.specialtyCategory,
    specialtyName: params.specialtyName,
    verificationLevel: params.verificationLevel,
    isVerified: params.isVerified,
    patientId: params.patientId,
    appointmentId: params.appointmentId,
    consultationId: params.consultationId,
    officeId: params.officeId,
    platform: params.platform ?? detectPlatform(),
    availableCapabilities: detectCapabilities(params.platform),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    locale: typeof navigator !== 'undefined' ? navigator.language : 'es-VE',
  };
}

// ============================================================================
// MAIN HOOK: useModuleContext
// ============================================================================

interface UseModuleContextResult {
  /** All modules that can mount in the current context */
  mountableModules: ModuleDefinition[];
  /** Modules excluded with reasons */
  excludedModules: Array<{ module: ModuleDefinition; validation: ModuleValidationResult }>;
  /** Get mountable modules for a specific sidebar group */
  getGroupModules: (group: ModuleGroup) => ModuleDefinition[];
  /** Get modules that can render as widgets */
  widgetModules: ModuleDefinition[];
  /** Validate a specific module by ID */
  validateById: (moduleId: string) => ModuleValidationResult | null;
  /** Check if a specific module can mount */
  canMount: (moduleId: string) => boolean;
  /** The runtime context being used */
  context: ModuleRuntimeContext;
}

/**
 * Hook that provides context-validated module access.
 *
 * @example
 * ```tsx
 * function DashboardSidebar({ userId, specialtyId, ... }) {
 *   const { getGroupModules, canMount } = useModuleContext({
 *     userId,
 *     profileId: userId,
 *     userRole: 'medico',
 *     specialtyId: 'dental',
 *     specialtyCategory: 'dental',
 *     specialtyName: 'Odontología',
 *     verificationLevel: 'sacs',
 *     isVerified: true,
 *   });
 *
 *   const clinicalModules = getGroupModules('clinical');
 *   // Only modules compatible with dental + verified docs appear
 *
 *   return (
 *     <nav>
 *       {clinicalModules.map(mod => (
 *         <SidebarItem key={mod.id} module={mod} />
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useModuleContext(
  params: Parameters<typeof buildRuntimeContext>[0]
): UseModuleContextResult {
  const context = useMemo(
    () => buildRuntimeContext(params),
    [
      params.userId,
      params.profileId,
      params.userRole,
      params.specialtyId,
      params.specialtyCategory,
      params.specialtyName,
      params.verificationLevel,
      params.isVerified,
      params.patientId,
      params.appointmentId,
      params.consultationId,
      params.officeId,
      params.platform,
    ]
  );

  const { mountable, excluded } = useMemo(
    () => getModulesForContext(context),
    [context]
  );

  const mountableModules = useMemo(
    () => mountable.map(({ module: m }) => m),
    [mountable]
  );

  const widgetModules = useMemo(() => {
    const widgets = getWidgetModulesForContext(context);
    return widgets.map(({ module: m }) => m);
  }, [context]);

  const getGroupModules = useCallback(
    (group: ModuleGroup) => getModulesForGroup(group, context),
    [context]
  );

  const validateById = useCallback(
    (moduleId: string) => validateModuleInContext(moduleId, context),
    [context]
  );

  const canMount = useCallback(
    (moduleId: string) => {
      const result = validateModuleInContext(moduleId, context);
      return result?.canMount ?? false;
    },
    [context]
  );

  return {
    mountableModules,
    excludedModules: excluded,
    getGroupModules,
    widgetModules,
    validateById,
    canMount,
    context,
  };
}

// ============================================================================
// SECONDARY HOOK: useModuleValidation
// ============================================================================

/**
 * Validate a single module definition inline.
 * Useful for conditionally showing/hiding a specific feature.
 *
 * @example
 * ```tsx
 * function PeriodontogramButton({ module, context }) {
 *   const { canMount, errors, warnings } = useModuleValidation(module, context);
 *
 *   if (!canMount) return null;
 *
 *   return (
 *     <Button>
 *       {module.name}
 *       {warnings.length > 0 && <Badge>⚠️</Badge>}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useModuleValidation(
  module: ModuleDefinition,
  context: ModuleRuntimeContext
): ModuleValidationResult {
  return useMemo(() => validateModule(module, context), [module, context]);
}

// ============================================================================
// PLATFORM & CAPABILITY DETECTION
// ============================================================================

function detectPlatform(): 'web' | 'tauri' | 'mobile' {
  if (typeof window === 'undefined') return 'web';
  if ('__TAURI__' in window || '__TAURI_INTERNALS__' in window) return 'tauri';
  // Basic mobile detection
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return 'mobile';
  return 'web';
}

function detectCapabilities(
  platform?: 'web' | 'tauri' | 'mobile'
): RuntimeCapability[] {
  if (typeof window === 'undefined') return [];

  const caps: RuntimeCapability[] = [];
  const detectedPlatform = platform ?? detectPlatform();

  // WebGL
  try {
    const canvas = document.createElement('canvas');
    if (canvas.getContext('webgl2') || canvas.getContext('webgl')) {
      caps.push('webgl');
    }
  } catch {
    // no webgl
  }

  // Media devices (camera, microphone)
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
    caps.push('camera', 'microphone');
  }

  // Geolocation
  if ('geolocation' in navigator) {
    caps.push('geolocation');
  }

  // Notifications
  if ('Notification' in window) {
    caps.push('notifications');
  }

  // Clipboard
  if (navigator.clipboard) {
    caps.push('clipboard');
  }

  // Speech recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    caps.push('speech');
  }

  // WebSocket
  if ('WebSocket' in window) {
    caps.push('websocket');
  }

  // IndexedDB
  if ('indexedDB' in window) {
    caps.push('indexeddb');
  }

  // Print
  if (typeof window.print === 'function') {
    caps.push('print');
  }

  // Tauri-specific
  if (detectedPlatform === 'tauri') {
    caps.push('offline', 'file-system');
  }

  return caps;
}

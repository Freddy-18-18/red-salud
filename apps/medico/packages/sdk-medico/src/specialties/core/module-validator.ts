// ============================================
// MODULE VALIDATOR
// Validates modules against runtime context
// Prevents mounting a module in invalid contexts
// ============================================

import type {
  ModuleDefinition,
  ModuleRuntimeContext,
  ModuleValidationResult,
  ModuleValidationError,
  ModuleValidationErrorType,
  VerificationLevel,
  RuntimeCapability,
} from '@red-salud/types';

// ============================================================================
// VERIFICATION LEVEL HIERARCHY
// ============================================================================

const VERIFICATION_HIERARCHY: Record<VerificationLevel, number> = {
  none: 0,
  email: 1,
  profile: 2,
  sacs: 3,
  license: 4,
  board_certified: 5,
};

function meetsVerificationLevel(
  current: VerificationLevel,
  required: VerificationLevel
): boolean {
  return VERIFICATION_HIERARCHY[current] >= VERIFICATION_HIERARCHY[required];
}

// ============================================================================
// CORE VALIDATION
// ============================================================================

/**
 * Validates a module definition against a runtime context.
 *
 * Returns a detailed result indicating whether the module can be mounted,
 * along with specific errors and warnings.
 *
 * @example
 * ```ts
 * const result = validateModule(perioModule, {
 *   userId: '123',
 *   profileId: '456',
 *   userRole: 'medico',
 *   specialtyId: 'dental',
 *   specialtyCategory: 'dental',
 *   specialtyName: 'Odontología',
 *   verificationLevel: 'sacs',
 *   isVerified: true,
 *   platform: 'web',
 *   availableCapabilities: ['websocket', 'print'],
 *   isOnline: true,
 *   locale: 'es-VE',
 * });
 *
 * if (!result.canMount) {
 *   // Show error UI or hide the module
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateModule(
  module: ModuleDefinition,
  context: ModuleRuntimeContext
): ModuleValidationResult {
  const errors: ModuleValidationError[] = [];
  const warnings: ModuleValidationError[] = [];
  const availableContextKeys: string[] = [];
  const missingRequiredKeys: string[] = [];
  const missingOptionalKeys: string[] = [];
  const missingCapabilities: RuntimeCapability[] = [];

  // ── 1. Check lifecycle status ──────────────────────────────────────
  if (module.lifecycle === 'deprecated') {
    warnings.push(
      createValidationError(
        'deprecated_module',
        `Module "${module.id}" is deprecated${module.replacedBy ? `. Use "${module.replacedBy}" instead` : ''}`,
        'module.lifecycle',
        'warning'
      )
    );
  }

  // ── 2. Check required context keys ─────────────────────────────────
  for (const key of module.context.requiredContextKeys) {
    const value = context[key];
    if (value === undefined || value === null) {
      missingRequiredKeys.push(key);
      errors.push(
        createValidationError(
          'missing_context',
          `Required context key "${key}" is missing or null`,
          key,
          'error'
        )
      );
    } else {
      availableContextKeys.push(key);
    }
  }

  // ── 3. Check optional context keys ─────────────────────────────────
  if (module.context.optionalContextKeys) {
    for (const key of module.context.optionalContextKeys) {
      const value = context[key];
      if (value === undefined || value === null) {
        missingOptionalKeys.push(key);
        warnings.push(
          createValidationError(
            'missing_context',
            `Optional context key "${key}" is missing — module will run with reduced functionality`,
            key,
            'warning'
          )
        );
      } else {
        availableContextKeys.push(key);
      }
    }
  }

  // ── 4. Check custom data requirements ──────────────────────────────
  if (module.context.dataRequirements) {
    for (const req of module.context.dataRequirements) {
      // Custom data requirements are validated via their validate function
      // They're checked separately from context keys (props, query params, etc.)
      if (req.required && req.validate) {
        // We can't validate here without the actual value — this is for
        // pre-mount checks. The actual validation happens at mount time.
        // For now, we just document the requirement.
        availableContextKeys.push(`data:${req.key}`);
      }
    }
  }

  // ── 5. Check user role ────────────────────────────────────────────
  if (
    module.context.allowedRoles.length > 0 &&
    !module.context.allowedRoles.includes(context.userRole)
  ) {
    errors.push(
      createValidationError(
        'invalid_role',
        `Role "${context.userRole}" is not allowed. Required: ${module.context.allowedRoles.join(', ')}`,
        'userRole',
        'error'
      )
    );
  }

  // ── 6. Check verification level ──────────────────────────────────
  if (
    !meetsVerificationLevel(
      context.verificationLevel,
      module.context.minimumVerification
    )
  ) {
    errors.push(
      createValidationError(
        'insufficient_verification',
        `Verification level "${context.verificationLevel}" is insufficient. Minimum required: "${module.context.minimumVerification}"`,
        'verificationLevel',
        'error'
      )
    );
  }

  // ── 7. Check specialty compatibility ──────────────────────────────
  const specialtyMatch = checkSpecialtyCompatibility(
    context.specialtyId,
    context.specialtyCategory,
    module.context.compatibleSpecialties,
    module.context.compatibleCategories
  );

  if (!specialtyMatch) {
    errors.push(
      createValidationError(
        'incompatible_specialty',
        `Specialty "${context.specialtyId}" (category: ${context.specialtyCategory}) is not compatible with module "${module.id}"`,
        'specialtyId',
        'error'
      )
    );
  }

  // ── 8. Check required runtime capabilities ────────────────────────
  if (module.context.requiredCapabilities) {
    for (const cap of module.context.requiredCapabilities) {
      if (!context.availableCapabilities.includes(cap)) {
        missingCapabilities.push(cap);
        errors.push(
          createValidationError(
            'missing_capability',
            `Required runtime capability "${cap}" is not available`,
            cap,
            'error'
          )
        );
      }
    }
  }

  // ── 9. Check optional runtime capabilities ────────────────────────
  if (module.context.optionalCapabilities) {
    for (const cap of module.context.optionalCapabilities) {
      if (!context.availableCapabilities.includes(cap)) {
        missingCapabilities.push(cap);
        warnings.push(
          createValidationError(
            'missing_capability',
            `Optional capability "${cap}" is not available — some features may be limited`,
            cap,
            'warning'
          )
        );
      }
    }
  }

  // ── 10. Check platform ─────────────────────────────────────────────
  if (
    module.context.supportedPlatforms &&
    module.context.supportedPlatforms.length > 0 &&
    !module.context.supportedPlatforms.includes(context.platform)
  ) {
    errors.push(
      createValidationError(
        'unsupported_platform',
        `Platform "${context.platform}" is not supported. Supported: ${module.context.supportedPlatforms.join(', ')}`,
        'platform',
        'error'
      )
    );
  }

  // ── 11. Check permissions ──────────────────────────────────────────
  if (module.context.permissions) {
    for (const perm of module.context.permissions) {
      // Permission checking needs integration with the RBAC system.
      // For now, we document the requirement — actual checking happens
      // at mount time via the auth provider.
      if (perm.required) {
        availableContextKeys.push(`perm:${perm.permission}`);
      }
    }
  }

  // ── Build result ───────────────────────────────────────────────────
  const hasBlockingErrors = errors.some((e) => e.severity === 'error');

  return {
    canMount: !hasBlockingErrors,
    errors: errors.filter((e) => e.severity === 'error'),
    warnings: [...warnings, ...errors.filter((e) => e.severity === 'warning')],
    availableContextKeys,
    missingRequiredKeys,
    missingOptionalKeys,
    missingCapabilities,
  };
}

// ============================================================================
// BATCH VALIDATION
// ============================================================================

/**
 * Validates multiple modules against a context and returns only the mountable ones.
 *
 * @example
 * ```ts
 * const { mountable, excluded } = filterMountableModules(allModules, context);
 * // Only render `mountable` in the sidebar/dashboard
 * ```
 */
export function filterMountableModules(
  modules: ModuleDefinition[],
  context: ModuleRuntimeContext
): {
  mountable: Array<{ module: ModuleDefinition; validation: ModuleValidationResult }>;
  excluded: Array<{ module: ModuleDefinition; validation: ModuleValidationResult }>;
} {
  const mountable: Array<{ module: ModuleDefinition; validation: ModuleValidationResult }> = [];
  const excluded: Array<{ module: ModuleDefinition; validation: ModuleValidationResult }> = [];

  for (const mod of modules) {
    const validation = validateModule(mod, context);
    if (validation.canMount) {
      mountable.push({ module: mod, validation });
    } else {
      excluded.push({ module: mod, validation });
    }
  }

  return { mountable, excluded };
}

/**
 * Get a summary of why modules were excluded.
 * Useful for admin dashboards and debugging.
 */
export function getExclusionSummary(
  excluded: Array<{ module: ModuleDefinition; validation: ModuleValidationResult }>
): Array<{ moduleId: string; moduleName: string; reasons: string[] }> {
  return excluded.map(({ module: mod, validation }) => ({
    moduleId: mod.id,
    moduleName: mod.name,
    reasons: validation.errors.map((e) => e.message),
  }));
}

// ============================================================================
// HELPERS
// ============================================================================

function createValidationError(
  type: ModuleValidationErrorType,
  message: string,
  field: string,
  severity: 'error' | 'warning'
): ModuleValidationError {
  return { type, message, field, severity };
}

function checkSpecialtyCompatibility(
  specialtyId: string,
  specialtyCategory: string,
  compatibleSpecialties: string[],
  compatibleCategories?: string[]
): boolean {
  // Wildcard = all specialties
  if (compatibleSpecialties.includes('*')) return true;

  // Direct specialty match
  if (compatibleSpecialties.includes(specialtyId)) return true;

  // Category match
  if (compatibleCategories) {
    if (compatibleCategories.includes('*')) return true;
    if (compatibleCategories.includes(specialtyCategory)) return true;
  }

  return false;
}

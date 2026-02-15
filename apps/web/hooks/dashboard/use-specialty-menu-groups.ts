// ============================================
// SPECIALTY MENU HOOK
// Replaces useDashboardMenuGroups with new specialty system
// ============================================

import { useMemo } from 'react';
import type { MenuGroup } from '@/components/dashboard/layout/dashboard-sidebar';
import {
  getSpecialtyExperienceConfig,
  getSpecialtyMenuGroups,
  isSpecialtyMatch,
  type SpecialtyContext,
} from '@/lib/specialties';
import { PATIENT_MODULE_CONFIG } from '@/lib/constants';

interface SecretaryPermissions {
  can_view_agenda?: boolean;
  can_view_patients?: boolean;
  can_send_messages?: boolean;
}

/**
 * Enhanced hook for dashboard menu groups
 * Supports dynamic specialty detection and 132+ specialties
 *
 * @param userRole - The user's role
 * @param secretaryPermissions - Permissions for secretary role
 * @param specialtyContext - Context for specialty detection
 * @returns Menu groups and dashboard route
 *
 * @example
 * ```tsx
 * const { menuGroups, dashboardRoute, specialtyConfig } = useSpecialtyMenuGroups({
 *   userRole: 'medico',
 *   specialtyContext: {
 *     specialtyName: profile?.specialty?.name,
 *     subSpecialties: profile?.subespecialidades,
 *     sacsEspecialidad: profile?.sacs_especialidad,
 *   }
 * });
 * ```
 */
export function useSpecialtyMenuGroups(
  userRole: 'paciente' | 'medico' | 'secretaria' = 'paciente',
  secretaryPermissions?: SecretaryPermissions,
  specialtyContext?: SpecialtyContext
): {
  menuGroups: MenuGroup[];
  dashboardRoute: string;
  specialtyConfig: ReturnType<typeof getSpecialtyExperienceConfig>;
} {
  return useMemo(() => {
    // Determine dashboard route
    const dashboardRoute =
      userRole === 'secretaria'
        ? '/dashboard/secretaria'
        : userRole === 'medico'
          ? '/dashboard/medico'
          : '/dashboard/paciente';

    // Get specialty configuration
    const specialtyConfig = getSpecialtyExperienceConfig(specialtyContext || {});

    let menuGroups: MenuGroup[] = [];

    if (userRole === 'secretaria') {
      // Secretary menu (unchanged)
      menuGroups = [
        {
          label: 'Principal',
          items: [
            ...(secretaryPermissions?.can_view_agenda
              ? [
                  {
                    key: 'agenda',
                    label: 'Agenda',
                    icon: 'Calendar',
                    route: '/dashboard/secretaria/agenda',
                  },
                ]
              : []),
            ...(secretaryPermissions?.can_view_patients
              ? [
                  {
                    key: 'pacientes',
                    label: 'Pacientes',
                    icon: 'User',
                    route: '/dashboard/secretaria/pacientes',
                  },
                ]
              : []),
            ...(secretaryPermissions?.can_send_messages
              ? [
                  {
                    key: 'mensajes',
                    label: 'Mensajes',
                    icon: 'MessageSquare',
                    route: '/dashboard/secretaria/mensajes',
                  },
                ]
              : []),
          ],
        },
      ].filter((group) => group.items.length > 0);
    } else if (userRole === 'medico') {
      const isDental = isSpecialtyMatch(specialtyContext || {}, 'dental');

      // ==================== BASE MENU ====================
      const baseItems = [
        {
          key: 'citas',
          label: isDental ? 'Agenda & Operaciones' : 'Agenda',
          icon: 'Calendar',
          route: '/dashboard/medico/citas',
          description: isDental
            ? 'Citas, Morning Huddle, Lista de Espera'
            : undefined,
        },
        {
          key: 'pacientes',
          label: 'Pacientes',
          icon: 'User',
          route: '/dashboard/medico/pacientes',
        },
        {
          key: 'mensajeria',
          label: 'Mensajes',
          icon: 'MessageSquare',
          route: '/dashboard/medico/mensajeria',
        },
        {
          key: 'estadisticas',
          label: 'Estadísticas',
          icon: 'Activity',
          route: '/dashboard/medico/estadisticas',
        },
      ];

      // Non-dental specific items
      if (!isDental) {
        baseItems.splice(1, 0, {
          key: 'consulta',
          label: 'Consulta',
          icon: 'Stethoscope',
          route: '/dashboard/medico/consulta',
        });
        baseItems.splice(4, 0, {
          key: 'telemedicina',
          label: 'Telemedicina',
          icon: 'Video',
          route: '/dashboard/medico/telemedicina',
        });
        baseItems.splice(5, 0, {
          key: 'recipes',
          label: 'Recetas',
          icon: 'Pill',
          route: '/dashboard/medico/recetas',
        });
      }

      menuGroups = [
        {
          label: 'Principal',
          items: baseItems,
        },
      ];

      // ==================== SPECIALTY MODULES ====================
      const specialtyMenuGroups = getSpecialtyMenuGroups(specialtyConfig);

      // Merge specialty groups into main menu
      menuGroups = [...menuGroups, ...specialtyMenuGroups];
    } else {
      // Patient menu (unchanged)
      menuGroups = [
        {
          label: 'Principal',
          items: Object.entries(PATIENT_MODULE_CONFIG)
            .filter(([key]) => key !== 'configuracion')
            .map(([key, config]) => ({
              key,
              label: config.label,
              icon: config.icon,
              route: config.route,
              color: config.color,
            })),
        },
      ];
    }

    return {
      menuGroups,
      dashboardRoute,
      specialtyConfig,
    };
  }, [
    userRole,
    secretaryPermissions,
    specialtyContext?.specialtyName,
    specialtyContext?.subSpecialties,
    specialtyContext?.sacsEspecialidad,
    specialtyContext?.forceSpecialtyId,
  ]);
}

/**
 * Type guard to check if user has secretary permissions
 */
export function hasSecretaryPermissions(
  permissions?: SecretaryPermissions
): permissions is SecretaryPermissions {
  return !!(
    permissions?.can_view_agenda ||
    permissions?.can_view_patients ||
    permissions?.can_send_messages
  );
}

/**
 * Get available specialty IDs for debugging
 */
export function getAvailableSpecialtyIds(): string[] {
  const {
    getAllSpecialties,
  } = require('@/lib/specialties/core/registry');
  return getAllSpecialties().map((s: { id: string }) => s.id);
}

/**
 * Corporate User Types and Permissions
 * Defines the role hierarchy and permission system for corporate users
 */

// Corporate-specific roles (distinct from platform roles like 'medico', 'paciente')
export type CorporateRole =
    | 'gerente'        // General Manager - highest authority
    | 'administrador'  // System Administrator
    | 'contador'       // Accountant / Finance
    | 'rrhh'           // Human Resources
    | 'soporte'        // Technical Support
    | 'analista'       // Data Analyst
    | 'supervisor';    // Supervisor

export interface CorporatePermissions {
    // User Management
    can_create_users: boolean;
    can_edit_users: boolean;
    can_delete_users: boolean;
    can_manage_roles: boolean;

    // Financial
    can_view_finances: boolean;
    can_manage_billing: boolean;
    can_export_reports: boolean;

    // System
    can_view_analytics: boolean;
    can_manage_system: boolean;
    can_view_audit_logs: boolean;
    can_manage_announcements: boolean;

    // Support
    can_view_tickets: boolean;
    can_resolve_tickets: boolean;

    // Data
    can_view_all_data: boolean;
    can_export_data: boolean;
}

export interface CorporateUser {
    id: string;
    email: string;
    nombre_completo: string;
    corporate_role: CorporateRole;
    department?: string;
    access_level: number; // 1-10
    permissions: CorporatePermissions;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login?: string;
}

// Role definitions with default permissions
export const CORPORATE_ROLES: Record<CorporateRole, {
    label: string;
    description: string;
    icon: string;
    accessLevel: number;
    defaultPermissions: CorporatePermissions;
}> = {
    gerente: {
        label: 'Gerente General',
        description: 'Acceso total al sistema, gestión estratégica',
        icon: 'Crown',
        accessLevel: 10,
        defaultPermissions: {
            can_create_users: true,
            can_edit_users: true,
            can_delete_users: true,
            can_manage_roles: true,
            can_view_finances: true,
            can_manage_billing: true,
            can_export_reports: true,
            can_view_analytics: true,
            can_manage_system: true,
            can_view_audit_logs: true,
            can_manage_announcements: true,
            can_view_tickets: true,
            can_resolve_tickets: true,
            can_view_all_data: true,
            can_export_data: true
        }
    },
    administrador: {
        label: 'Administrador',
        description: 'Gestión técnica y configuración del sistema',
        icon: 'Settings',
        accessLevel: 9,
        defaultPermissions: {
            can_create_users: true,
            can_edit_users: true,
            can_delete_users: false,
            can_manage_roles: true,
            can_view_finances: false,
            can_manage_billing: false,
            can_export_reports: true,
            can_view_analytics: true,
            can_manage_system: true,
            can_view_audit_logs: true,
            can_manage_announcements: true,
            can_view_tickets: true,
            can_resolve_tickets: true,
            can_view_all_data: true,
            can_export_data: true
        }
    },
    contador: {
        label: 'Contador',
        description: 'Gestión financiera y reportes contables',
        icon: 'Calculator',
        accessLevel: 7,
        defaultPermissions: {
            can_create_users: false,
            can_edit_users: false,
            can_delete_users: false,
            can_manage_roles: false,
            can_view_finances: true,
            can_manage_billing: true,
            can_export_reports: true,
            can_view_analytics: true,
            can_manage_system: false,
            can_view_audit_logs: true,
            can_manage_announcements: false,
            can_view_tickets: false,
            can_resolve_tickets: false,
            can_view_all_data: false,
            can_export_data: true
        }
    },
    rrhh: {
        label: 'Recursos Humanos',
        description: 'Gestión de personal y usuarios internos',
        icon: 'Users',
        accessLevel: 7,
        defaultPermissions: {
            can_create_users: true,
            can_edit_users: true,
            can_delete_users: false,
            can_manage_roles: false,
            can_view_finances: false,
            can_manage_billing: false,
            can_export_reports: true,
            can_view_analytics: true,
            can_manage_system: false,
            can_view_audit_logs: false,
            can_manage_announcements: true,
            can_view_tickets: false,
            can_resolve_tickets: false,
            can_view_all_data: false,
            can_export_data: true
        }
    },
    soporte: {
        label: 'Soporte Técnico',
        description: 'Atención de tickets y soporte a usuarios',
        icon: 'Headphones',
        accessLevel: 5,
        defaultPermissions: {
            can_create_users: false,
            can_edit_users: false,
            can_delete_users: false,
            can_manage_roles: false,
            can_view_finances: false,
            can_manage_billing: false,
            can_export_reports: false,
            can_view_analytics: false,
            can_manage_system: false,
            can_view_audit_logs: false,
            can_manage_announcements: false,
            can_view_tickets: true,
            can_resolve_tickets: true,
            can_view_all_data: false,
            can_export_data: false
        }
    },
    analista: {
        label: 'Analista de Datos',
        description: 'Análisis y reportes de métricas',
        icon: 'BarChart3',
        accessLevel: 6,
        defaultPermissions: {
            can_create_users: false,
            can_edit_users: false,
            can_delete_users: false,
            can_manage_roles: false,
            can_view_finances: true,
            can_manage_billing: false,
            can_export_reports: true,
            can_view_analytics: true,
            can_manage_system: false,
            can_view_audit_logs: true,
            can_manage_announcements: false,
            can_view_tickets: true,
            can_resolve_tickets: false,
            can_view_all_data: true,
            can_export_data: true
        }
    },
    supervisor: {
        label: 'Supervisor',
        description: 'Supervisión de operaciones y equipos',
        icon: 'Eye',
        accessLevel: 6,
        defaultPermissions: {
            can_create_users: false,
            can_edit_users: false,
            can_delete_users: false,
            can_manage_roles: false,
            can_view_finances: false,
            can_manage_billing: false,
            can_export_reports: true,
            can_view_analytics: true,
            can_manage_system: false,
            can_view_audit_logs: true,
            can_manage_announcements: false,
            can_view_tickets: true,
            can_resolve_tickets: false,
            can_view_all_data: true,
            can_export_data: false
        }
    }
};

// Helper to get role info
export function getCorporateRoleInfo(role: CorporateRole) {
    return CORPORATE_ROLES[role];
}

// Helper to check if user has permission
export function hasPermission(
    permissions: CorporatePermissions,
    permission: keyof CorporatePermissions
): boolean {
    return permissions[permission] === true;
}

// Get all corporate roles as options for select/dropdown
export function getCorporateRoleOptions() {
    return Object.entries(CORPORATE_ROLES).map(([key, value]) => ({
        value: key as CorporateRole,
        label: value.label,
        description: value.description,
        accessLevel: value.accessLevel
    }));
}

/**
 * Corporate Users Service
 * CRUD operations for corporate users in Supabase
 */

import { supabase } from '../lib/supabase';
import type { CorporateRole, CorporatePermissions, CORPORATE_ROLES } from '../types/corporate-users.types';

// ============================================
// CORPORATE USERS CRUD
// ============================================

export interface CreateCorporateUserInput {
    email: string;
    password: string;
    nombre_completo: string;
    corporate_role: CorporateRole;
    access_level?: number;
    permissions?: Partial<CorporatePermissions>;
    department?: string;
}

/**
 * Create a new corporate user
 */
export async function createCorporateUser(input: CreateCorporateUserInput) {
    try {
        console.log('[createCorporateUser] Creating user:', input.email);

        // Get default permissions for the role
        const { CORPORATE_ROLES } = await import('../types/corporate-users.types');
        const roleConfig = CORPORATE_ROLES[input.corporate_role];

        const permissions = {
            ...roleConfig.defaultPermissions,
            ...input.permissions
        };

        const accessLevel = input.access_level ?? roleConfig.accessLevel;

        // 1. Sign up user in Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: {
                data: {
                    nombre_completo: input.nombre_completo,
                    role: input.corporate_role,
                    access_level: accessLevel,
                    permissions: permissions,
                    department: input.department
                }
            }
        });

        if (authError) {
            console.error('[createCorporateUser] Auth error:', authError);
            throw authError;
        }

        console.log('[createCorporateUser] User created successfully:', authData.user?.id);

        return {
            success: true,
            userId: authData.user?.id,
            message: 'Usuario corporativo creado exitosamente'
        };

    } catch (error) {
        console.error('[createCorporateUser] Failed:', error);
        throw error;
    }
}

/**
 * Get all corporate users
 */
export async function getCorporateUsers() {
    try {
        const corporateRoles = ['gerente', 'administrador', 'contador', 'rrhh', 'soporte', 'analista', 'supervisor', 'admin', 'corporate'];

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('role', corporateRoles)
            .order('access_level', { ascending: false });

        if (error) {
            console.error('[getCorporateUsers] Error:', error);
            throw error;
        }

        console.log('[getCorporateUsers] Found:', data?.length || 0, 'corporate users');
        return data || [];

    } catch (error) {
        console.error('[getCorporateUsers] Failed:', error);
        return [];
    }
}

/**
 * Update a corporate user's role and permissions
 */
export async function updateCorporateUser(
    userId: string,
    updates: {
        corporate_role?: CorporateRole;
        access_level?: number;
        permissions?: Partial<CorporatePermissions>;
        department?: string;
        is_active?: boolean;
    }
) {
    try {
        console.log('[updateCorporateUser] Updating user:', userId);

        const updateData: any = {};

        if (updates.corporate_role) {
            updateData.role = updates.corporate_role;
        }
        if (updates.access_level !== undefined) {
            updateData.access_level = updates.access_level;
        }
        if (updates.permissions) {
            // Merge with existing permissions
            const { data: currentUser } = await supabase
                .from('profiles')
                .select('permissions')
                .eq('id', userId)
                .single();

            updateData.permissions = {
                ...currentUser?.permissions,
                ...updates.permissions
            };
        }
        if (updates.department) {
            updateData.department = updates.department;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('[updateCorporateUser] Error:', error);
            throw error;
        }

        console.log('[updateCorporateUser] Updated successfully');
        return { success: true };

    } catch (error) {
        console.error('[updateCorporateUser] Failed:', error);
        throw error;
    }
}

/**
 * Get corporate users count by role
 */
export async function getCorporateUsersStats() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role');

        if (error) throw error;

        const stats: Record<string, number> = {
            gerente: 0,
            administrador: 0,
            contador: 0,
            rrhh: 0,
            soporte: 0,
            analista: 0,
            supervisor: 0,
            admin: 0,
            total: 0
        };

        data?.forEach(profile => {
            if (stats[profile.role] !== undefined) {
                stats[profile.role]++;
                stats.total++;
            }
        });

        return stats;

    } catch (error) {
        console.error('[getCorporateUsersStats] Failed:', error);
        return null;
    }
}

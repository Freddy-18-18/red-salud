import { supabase } from '@/lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY || 'red-salud-internal-key-2026'; // Placeholder, should be in .env

export interface Specialty {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    doctorCount: number;
    created_at: string;
}

export interface Doctor {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    cedula: string | null;
    cedula_verificada: boolean;
    sacs_verificado: boolean;
    sacs_especialidad: string | null;
    avatar_url: string | null;
}

export const SpecialtiesService = {
    async getAllSpecialties(params: { search?: string; limit?: number; offset?: number } = {}) {
        const query = new URLSearchParams();
        if (params.search) query.append('search', params.search);
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.offset) query.append('offset', params.offset.toString());

        const response = await fetch(`${API_BASE_URL}/api/internal/specialties?${query.toString()}`, {
            headers: {
                'x-api-key': INTERNAL_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch specialties: ${response.statusText}`);
        }

        return response.json();
    },

    async updateSpecialty(slug: string, updates: { description?: string; icon?: string }) {
        const response = await fetch(`${API_BASE_URL}/api/internal/specialties`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': INTERNAL_API_KEY
            },
            body: JSON.stringify({ slug, updates })
        });

        if (!response.ok) {
            throw new Error(`Failed to update specialty: ${response.statusText}`);
        }

        return response.json();
    },

    async getSpecialtyDoctors(slug: string, params: { verified?: boolean; limit?: number; offset?: number } = {}) {
        const query = new URLSearchParams();
        if (params.verified !== undefined) query.append('verified', params.verified.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.offset) query.append('offset', params.offset.toString());

        const response = await fetch(`${API_BASE_URL}/api/internal/specialties/${slug}/doctors?${query.toString()}`, {
            headers: {
                'x-api-key': INTERNAL_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch doctors: ${response.statusText}`);
        }

        return response.json();
    }
};

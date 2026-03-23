export type UserRole =
  | 'paciente'
  | 'medico'
  | 'secretaria'
  | 'farmacia'
  | 'laboratorio'
  | 'clinica'
  | 'seguro'
  | 'ambulancia'
  | 'admin';

export interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  metadata: Record<string, unknown>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  metadata?: Record<string, unknown>;
}

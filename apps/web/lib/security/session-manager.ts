/**
 * Sistema de Gestión de Sesiones con Seguridad Mejorada
 * 
 * Características:
 * - Sesiones temporales vs persistentes
 * - Timeout de inactividad
 * - Detección de cambio de dispositivo
 * - Logs de actividad de sesión
 */

import { supabase } from "@/lib/supabase/client";

// Configuración de timeouts por rol
const SESSION_TIMEOUTS = {
  paciente: 30 * 60 * 1000, // 30 minutos
  medico: 60 * 60 * 1000, // 1 hora
  farmacia: 60 * 60 * 1000, // 1 hora
  laboratorio: 60 * 60 * 1000, // 1 hora
  clinica: 60 * 60 * 1000, // 1 hora
  ambulancia: 30 * 60 * 1000, // 30 minutos (emergencias)
  seguro: 60 * 60 * 1000, // 1 hora
} as const;

interface SessionConfig {
  rememberMe: boolean;
  role: string;
  deviceFingerprint?: string;
  createdAt?: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();

  private constructor() {
    this.setupActivityListeners();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Configura la sesión después del login
   */
  async setupSession(config: SessionConfig): Promise<void> {
    const { rememberMe, role, deviceFingerprint } = config;

    // Guardar preferencias de sesión
    localStorage.setItem("session_config", JSON.stringify({
      rememberMe,
      role,
      deviceFingerprint,
      createdAt: Date.now(),
    }));

    // Si NO es "recordarme", usar sessionStorage en lugar de localStorage
    if (!rememberMe) {
      await this.convertToTemporarySession();
    }

    // Iniciar monitoreo de inactividad
    this.startInactivityMonitor(role);

    // Registrar inicio de sesión
    await this.logSessionActivity("login", { rememberMe, role });
  }

  /**
   * Convierte la sesión a temporal (se borra al cerrar navegador)
   */
  private async convertToTemporarySession(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Mover tokens a sessionStorage
      sessionStorage.setItem("supabase.auth.token", JSON.stringify(session));
      
      // Limpiar localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Monitorea inactividad del usuario
   */
  private startInactivityMonitor(role: string): void {
    const timeout = SESSION_TIMEOUTS[role as keyof typeof SESSION_TIMEOUTS] || 30 * 60 * 1000;

    this.resetInactivityTimer(timeout);
  }

  private resetInactivityTimer(timeout: number): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.lastActivity = Date.now();

    this.inactivityTimer = setTimeout(async () => {
      await this.handleInactivityTimeout();
    }, timeout);
  }

  private async handleInactivityTimeout(): Promise<void> {
    console.log("⏰ Sesión cerrada por inactividad");
    
    await this.logSessionActivity("timeout", {
      lastActivity: new Date(this.lastActivity).toISOString(),
    });

    await this.logout("inactivity");
  }

  /**
   * Configura listeners para detectar actividad del usuario
   */
  private setupActivityListeners(): void {
    if (typeof window === "undefined") return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    
    const handleActivity = () => {
      const config = this.getSessionConfig();
      if (config?.role) {
        const timeout = SESSION_TIMEOUTS[config.role as keyof typeof SESSION_TIMEOUTS];
        this.resetInactivityTimer(timeout);
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
  }

  /**
   * Obtiene la configuración de la sesión actual
   */
  private getSessionConfig(): SessionConfig | null {
    const config = localStorage.getItem("session_config") || 
                   sessionStorage.getItem("session_config");
    
    if (!config) return null;
    
    try {
      return JSON.parse(config);
    } catch {
      return null;
    }
  }

  /**
   * Verifica si la sesión es válida
   */
  async validateSession(): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { valid: false, reason: "no_session" };
    }

    const config = this.getSessionConfig();
    
    if (!config) {
      return { valid: false, reason: "no_config" };
    }

    // Verificar si la sesión ha expirado por tiempo
    if (config.createdAt) {
      const sessionAge = Date.now() - config.createdAt;
      const maxAge = config.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      
      if (sessionAge > maxAge) {
        await this.logout("expired");
        return { valid: false, reason: "expired" };
      }
    }

    // Verificar fingerprint del dispositivo (opcional)
    if (config.deviceFingerprint) {
      const currentFingerprint = await this.getDeviceFingerprint();
      if (currentFingerprint !== config.deviceFingerprint) {
        await this.logout("device_changed");
        return { valid: false, reason: "device_changed" };
      }
    }

    return { valid: true };
  }

  /**
   * Genera un fingerprint del dispositivo
   */
  private async getDeviceFingerprint(): Promise<string> {
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ].join("|");

    // Hash simple (en producción usar crypto.subtle.digest)
    return btoa(data);
  }

  /**
   * Registra actividad de la sesión
   */
  private async logSessionActivity(
    activityType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: `session_${activityType}`,
        description: `Sesión: ${activityType}`,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
        status: "info",
      });
    } catch (error) {
      console.error("Error logging session activity:", error);
    }
  }

  /**
   * Cierra la sesión
   */
  async logout(reason: string = "manual"): Promise<void> {
    await this.logSessionActivity("logout", { reason });

    // Limpiar timers
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Limpiar storage
    localStorage.removeItem("session_config");
    sessionStorage.removeItem("session_config");
    sessionStorage.removeItem("supabase.auth.token");

    // Cerrar sesión en Supabase
    await supabase.auth.signOut();

    // Redirigir al login
    window.location.href = "/login";
  }

  /**
   * Obtiene el tiempo restante de la sesión
   */
  getRemainingTime(): number {
    const config = this.getSessionConfig();
    if (!config) return 0;

    const timeout = SESSION_TIMEOUTS[config.role as keyof typeof SESSION_TIMEOUTS];
    const elapsed = Date.now() - this.lastActivity;
    
    return Math.max(0, timeout - elapsed);
  }

  /**
   * Extiende la sesión (renovar)
   */
  async extendSession(): Promise<void> {
    const config = this.getSessionConfig();
    if (!config) return;

    const timeout = SESSION_TIMEOUTS[config.role as keyof typeof SESSION_TIMEOUTS];
    this.resetInactivityTimer(timeout);

    await this.logSessionActivity("extended");
  }
}

// Exportar instancia singleton
export const sessionManager = SessionManager.getInstance();

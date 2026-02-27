import { invoke } from '@tauri-apps/api/core';

/**
 * Servicio unificado de API que funciona tanto en web como en Tauri
 * Automáticamente usa comandos Rust en desktop y fetch en web
 */
class TauriApiService {
  private isTauri: boolean;

  constructor() {
    this.isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
  }

  /**
   * Verifica si estamos en entorno Tauri
   */
  isDesktop(): boolean {
    return this.isTauri;
  }

  /**
   * Obtiene la configuración de Supabase
   */
  async getSupabaseConfig(): Promise<{ url: string; anon_key: string }> {
    if (!this.isTauri) {
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      };
    }

    return invoke<{ url: string; anon_key: string }>('get_supabase_config');
  }

  /**
   * Hace una petición GET a Supabase
   */
  /**
   * Hace una petición GET a Supabase
   */
  async supabaseGet<T = unknown>(
    endpoint: string,
    accessToken: string,
    cacheKey?: string
  ): Promise<T> {
    if (!this.isTauri) {
      // Fallback a fetch en web
      const config = await this.getSupabaseConfig();
      const response = await fetch(`${config.url}${endpoint}`, {
        headers: {
          apikey: config.anon_key,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.json();
    }

    const result = await invoke<string>('supabase_get', {
      endpoint,
      accessToken,
      cacheKey,
    });
    return JSON.parse(result);
  }

  /**
   * Hace una petición POST a Supabase
   */
  async supabasePost<T = unknown>(
    endpoint: string,
    body: unknown,
    accessToken: string
  ): Promise<T> {
    if (!this.isTauri) {
      const config = await this.getSupabaseConfig();
      const response = await fetch(`${config.url}${endpoint}`, {
        method: 'POST',
        headers: {
          apikey: config.anon_key,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return response.json();
    }

    const result = await invoke<string>('supabase_post', {
      endpoint,
      body: JSON.stringify(body),
      accessToken,
    });
    return JSON.parse(result);
  }

  /**
   * Hace una petición PATCH a Supabase
   */
  async supabasePatch<T = unknown>(
    endpoint: string,
    body: unknown,
    accessToken: string
  ): Promise<T> {
    if (!this.isTauri) {
      const config = await this.getSupabaseConfig();
      const response = await fetch(`${config.url}${endpoint}`, {
        method: 'PATCH',
        headers: {
          apikey: config.anon_key,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return response.json();
    }

    const result = await invoke<string>('supabase_patch', {
      endpoint,
      body: JSON.stringify(body),
      accessToken,
    });
    return JSON.parse(result);
  }

  /**
   * Hace una petición DELETE a Supabase
   */
  async supabaseDelete<T = unknown>(
    endpoint: string,
    accessToken: string
  ): Promise<T> {
    if (!this.isTauri) {
      const config = await this.getSupabaseConfig();
      const response = await fetch(`${config.url}${endpoint}`, {
        method: 'DELETE',
        headers: {
          apikey: config.anon_key,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.json();
    }

    const result = await invoke<string>('supabase_delete', {
      endpoint,
      accessToken,
    });
    return JSON.parse(result);
  }


  /**
   * Guarda un archivo localmente (solo desktop)
   */
  async saveFileLocally(
    filename: string,
    data: Uint8Array,
    subfolder?: string
  ): Promise<string> {
    if (!this.isTauri) {
      throw new Error('File save only available in desktop app');
    }

    return invoke<string>('save_file_locally', {
      filename,
      data: Array.from(data),
      subfolder,
    });
  }

  /**
   * Abre un archivo con la aplicación predeterminada (solo desktop)
   */
  async openFile(path: string): Promise<void> {
    if (!this.isTauri) {
      window.open(path, '_blank');
      return;
    }

    return invoke('open_file', { path });
  }

  /**
   * Lee un archivo local (solo desktop)
   */
  async readFileLocally(
    filename: string,
    subfolder?: string
  ): Promise<Uint8Array> {
    if (!this.isTauri) {
      throw new Error('File read only available in desktop app');
    }

    const data = await invoke<number[]>('read_file_locally', {
      filename,
      subfolder,
    });
    return new Uint8Array(data);
  }

  /**
   * Verifica conectividad
   */
  async checkConnectivity(): Promise<boolean> {
    if (!this.isTauri) {
      return navigator.onLine;
    }

    return invoke<boolean>('check_connectivity');
  }

  /**
   * Guarda datos offline
   */
  async saveOfflineData(key: string, data: unknown): Promise<void> {
    if (!this.isTauri) {
      localStorage.setItem(key, JSON.stringify(data));
      return;
    }

    return invoke('save_offline_data', {
      key,
      data: JSON.stringify(data),
    });
  }

  /**
   * Obtiene datos offline
   */
  async getOfflineData<T = unknown>(key: string): Promise<T | null> {
    if (!this.isTauri) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }

    const result = await invoke<string | null>('get_offline_data', { key });
    return result ? JSON.parse(result) : null;
  }

  /**
   * Elimina datos offline
   */
  async deleteOfflineData(key: string): Promise<void> {
    if (!this.isTauri) {
      localStorage.removeItem(key);
      return;
    }

    return invoke('delete_offline_data', { key });
  }
}

export const tauriApiService = new TauriApiService();

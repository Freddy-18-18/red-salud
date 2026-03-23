/**
 * Tauri Storage Service
 * 
 * Storage service implementation for Tauri (desktop) environment.
 * Uses Rust commands for persistent offline storage.
 * 
 * Validates: Requirements 2.4, 7.5
 */

import { invoke } from '@tauri-apps/api/core';
import type { StorageService } from '../types';

export class TauriStorageService implements StorageService {
  private fallbackStorage = new Map<string, string>();
  private useFallback = false;

  private shouldFallback(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return (
      this.useFallback ||
      message.includes("reading 'invoke'") ||
      message.includes('reading "invoke"') ||
      message.includes('__TAURI_INTERNALS__')
    );
  }

  private enableFallback(): void {
    this.useFallback = true;
  }

  /**
   * Retrieve data from storage by key
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.useFallback) {
      const cached = this.fallbackStorage.get(key);
      return cached ? (JSON.parse(cached) as T) : null;
    }

    try {
      const result = await invoke<string | null>('get_offline_data', { key });
      return result ? JSON.parse(result) : null;
    } catch (error) {
      if (this.shouldFallback(error)) {
        this.enableFallback();
        const cached = this.fallbackStorage.get(key);
        return cached ? (JSON.parse(cached) as T) : null;
      }

      console.error(`Failed to get data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Save data to storage
   */
  async save<T>(key: string, data: T): Promise<void> {
    const serialized = JSON.stringify(data);

    if (this.useFallback) {
      this.fallbackStorage.set(key, serialized);
      return;
    }

    try {
      await invoke('save_offline_data', {
        key,
        data: serialized,
      });
    } catch (error) {
      if (this.shouldFallback(error)) {
        this.enableFallback();
        this.fallbackStorage.set(key, serialized);
        return;
      }

      console.error(`Failed to save data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete data from storage by key
   */
  async delete(key: string): Promise<void> {
    if (this.useFallback) {
      this.fallbackStorage.delete(key);
      return;
    }

    try {
      await invoke('delete_offline_data', { key });
    } catch (error) {
      if (this.shouldFallback(error)) {
        this.enableFallback();
        this.fallbackStorage.delete(key);
        return;
      }

      console.error(`Failed to delete data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    if (this.useFallback) {
      this.fallbackStorage.clear();
      return;
    }

    try {
      await invoke('clear_offline_data');
    } catch (error) {
      if (this.shouldFallback(error)) {
        this.enableFallback();
        this.fallbackStorage.clear();
        return;
      }

      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Get all storage keys
   */
  async keys(): Promise<string[]> {
    if (this.useFallback) {
      return Array.from(this.fallbackStorage.keys());
    }

    try {
      return await invoke<string[]>('get_offline_keys');
    } catch (error) {
      if (this.shouldFallback(error)) {
        this.enableFallback();
        return Array.from(this.fallbackStorage.keys());
      }

      console.error('Failed to get keys:', error);
      return [];
    }
  }
}

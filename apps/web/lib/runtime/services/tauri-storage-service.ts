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
  /**
   * Retrieve data from storage by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await invoke<string | null>('get_offline_data', { key });
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error(`Failed to get data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Save data to storage
   */
  async save<T>(key: string, data: T): Promise<void> {
    try {
      await invoke('save_offline_data', {
        key,
        data: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete data from storage by key
   */
  async delete(key: string): Promise<void> {
    try {
      await invoke('delete_offline_data', { key });
    } catch (error) {
      console.error(`Failed to delete data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    try {
      await invoke('clear_offline_data');
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Get all storage keys
   */
  async keys(): Promise<string[]> {
    try {
      return await invoke<string[]>('get_offline_keys');
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }
}

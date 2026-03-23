/**
 * Web Storage Service
 * 
 * Storage service implementation for web environment.
 * Uses IndexedDB for persistent offline storage.
 * 
 * Validates: Requirements 2.4, 7.5
 */

import type { StorageService } from '../types';

export class WebStorageService implements StorageService {
  private dbName = 'red-salud-medico';
  private storeName = 'offline-data';
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB connection
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  /**
   * Retrieve data from storage by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? JSON.parse(result) : null);
        };
      });
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
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(JSON.stringify(data), key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
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
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
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
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
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
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as string[]);
      });
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }
}

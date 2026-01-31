/**
 * Sync Service - Synchronization between local storage and server
 * 
 * This service manages automatic synchronization of data between the local
 * offline store and the remote server. It handles:
 * - Automatic sync every 5 minutes when online
 * - Manual sync on demand
 * - Queueing changes when offline
 * - Conflict resolution with last-write-wins strategy
 * - Retry with exponential backoff
 * 
 * Validates: Requirements 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.6
 */

import type {
  SyncService as ISyncService,
  SyncResult,
  PendingChange,
  SyncMetadata,
  SyncError,
  StorageService,
  NetworkService,
} from './types';
import { SYNC_QUEUE, SYNC_METADATA, SYNC_ERRORS } from './storage-keys';

export class SyncService implements ISyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private syncing = false;
  private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_BACKOFF_MS = 1000; // 1 second

  constructor(
    private storage: StorageService,
    private network: NetworkService,
    private onConnectivityChange?: (online: boolean) => void
  ) {}

  /**
   * Start automatic synchronization
   * Syncs every 5 minutes when online
   */
  public start(): void {
    if (this.syncInterval) {
      return; // Already started
    }

    // Start periodic sync
    this.syncInterval = setInterval(() => {
      this.syncNow().catch(error => {
        console.error('Automatic sync failed:', error);
      });
    }, this.SYNC_INTERVAL_MS);

    // Trigger initial sync
    this.syncNow().catch(error => {
      console.error('Initial sync failed:', error);
    });
  }

  /**
   * Stop automatic synchronization
   */
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Check if sync is currently in progress
   */
  public isSyncing(): boolean {
    return this.syncing;
  }

  /**
   * Trigger immediate synchronization
   * 
   * Sync Algorithm:
   * 1. Check connectivity
   * 2. Upload pending changes from queue (FIFO order)
   * 3. Handle conflicts with last-write-wins
   * 4. Download updates since last sync timestamp
   * 5. Update local storage with fresh data
   * 6. Update sync metadata (last sync time)
   */
  public async syncNow(): Promise<SyncResult> {
    // Prevent concurrent syncs
    if (this.syncing) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: [
          {
            id: Date.now().toString(),
            changeId: '',
            error: 'Sync already in progress',
            timestamp: new Date(),
            retries: 0,
          },
        ],
      };
    }

    this.syncing = true;

    try {
      // Step 1: Check connectivity
      const isOnline = await this.network.checkConnectivity();
      if (!isOnline) {
        return {
          success: false,
          uploaded: 0,
          downloaded: 0,
          conflicts: 0,
          errors: [
            {
              id: Date.now().toString(),
              changeId: '',
              error: 'No network connectivity',
              timestamp: new Date(),
              retries: 0,
            },
          ],
        };
      }

      const result: SyncResult = {
        success: true,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: [],
      };

      // Step 2: Upload pending changes (priority: upload before download)
      const uploadResult = await this.uploadPendingChanges();
      result.uploaded = uploadResult.uploaded;
      result.conflicts = uploadResult.conflicts;
      result.errors.push(...uploadResult.errors);

      // Step 3: Download updates since last sync
      const downloadResult = await this.downloadUpdates();
      result.downloaded = downloadResult.downloaded;
      result.errors.push(...downloadResult.errors);

      // Step 4: Update sync metadata
      await this.updateSyncMetadata(result);

      // If there were any errors, mark as partial success
      if (result.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: [
          {
            id: Date.now().toString(),
            changeId: '',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
            retries: 0,
          },
        ],
      };
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Queue a change for later synchronization
   * Called when operations are performed offline
   */
  public async queueChange(change: PendingChange): Promise<void> {
    const queue = await this.getPendingChanges();
    queue.push(change);
    await this.storage.save(SYNC_QUEUE, queue);

    // Update metadata
    const metadata = await this.getSyncMetadata();
    metadata.pendingChanges = queue.length;
    await this.storage.save(SYNC_METADATA, metadata);
  }

  /**
   * Get all pending changes from the queue
   */
  public async getPendingChanges(): Promise<PendingChange[]> {
    const queue = await this.storage.get<PendingChange[]>(SYNC_QUEUE);
    return queue || [];
  }

  /**
   * Get sync metadata
   */
  public async getSyncMetadata(): Promise<SyncMetadata> {
    const metadata = await this.storage.get<SyncMetadata>(SYNC_METADATA);
    return (
      metadata || {
        lastSyncTime: null,
        lastSuccessfulSync: null,
        pendingChanges: 0,
        conflicts: 0,
        errors: [],
      }
    );
  }

  /**
   * Upload pending changes to the server
   * Uses FIFO order and retry with exponential backoff
   */
  private async uploadPendingChanges(): Promise<{
    uploaded: number;
    conflicts: number;
    errors: SyncError[];
  }> {
    const queue = await this.getPendingChanges();
    const result = {
      uploaded: 0,
      conflicts: 0,
      errors: [] as SyncError[],
    };

    if (queue.length === 0) {
      return result;
    }

    const remainingQueue: PendingChange[] = [];

    // Process each change in FIFO order
    for (const change of queue) {
      try {
        const uploadSuccess = await this.uploadChange(change);
        if (uploadSuccess) {
          result.uploaded++;
        } else {
          // Retry logic
          if (change.retries < this.MAX_RETRIES) {
            change.retries++;
            remainingQueue.push(change);
          } else {
            // Max retries reached, log error
            result.errors.push({
              id: Date.now().toString(),
              changeId: change.id,
              error: `Max retries (${this.MAX_RETRIES}) reached`,
              timestamp: new Date(),
              retries: change.retries,
            });
          }
        }
      } catch (error) {
        // Handle conflicts
        if (this.isConflictError(error)) {
          result.conflicts++;
          // Apply last-write-wins: if server timestamp > local timestamp, skip
          // Otherwise, retry
          const shouldRetry = await this.resolveConflict(change, error);
          if (shouldRetry && change.retries < this.MAX_RETRIES) {
            change.retries++;
            remainingQueue.push(change);
          }
        } else {
          // Other errors: retry with backoff
          if (change.retries < this.MAX_RETRIES) {
            change.retries++;
            remainingQueue.push(change);
          } else {
            result.errors.push({
              id: Date.now().toString(),
              changeId: change.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date(),
              retries: change.retries,
            });
          }
        }
      }
    }

    // Update queue with remaining changes
    await this.storage.save(SYNC_QUEUE, remainingQueue);

    return result;
  }

  /**
   * Upload a single change to the server
   */
  private async uploadChange(change: PendingChange): Promise<boolean> {
    // Apply exponential backoff for retries
    if (change.retries > 0) {
      const backoffMs = this.INITIAL_BACKOFF_MS * Math.pow(2, change.retries - 1);
      await this.sleep(backoffMs);
    }

    try {
      const endpoint = this.getEndpointForEntity(change.entity);

      switch (change.type) {
        case 'create':
          await this.network.post(endpoint, change.data);
          break;
        case 'update':
          await this.network.patch(`${endpoint}/${change.data.id}`, change.data);
          break;
        case 'delete':
          await this.network.delete(`${endpoint}/${change.data.id}`);
          break;
      }

      return true;
    } catch (error) {
      console.error(`Failed to upload change ${change.id}:`, error);
      throw error;
    }
  }

  /**
   * Download updates from the server since last sync
   */
  private async downloadUpdates(): Promise<{
    downloaded: number;
    errors: SyncError[];
  }> {
    const result = {
      downloaded: 0,
      errors: [] as SyncError[],
    };

    try {
      const metadata = await this.getSyncMetadata();
      const lastSyncTime = metadata.lastSuccessfulSync;

      // Download updates for each entity type
      const entities: Array<PendingChange['entity']> = [
        'patient',
        'appointment',
        'consultation',
        'message',
        'settings',
      ];

      for (const entity of entities) {
        try {
          const updates = await this.downloadEntityUpdates(entity, lastSyncTime);
          result.downloaded += updates;
        } catch (error) {
          result.errors.push({
            id: Date.now().toString(),
            changeId: '',
            error: `Failed to download ${entity} updates: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
            timestamp: new Date(),
            retries: 0,
          });
        }
      }
    } catch (error) {
      result.errors.push({
        id: Date.now().toString(),
        changeId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retries: 0,
      });
    }

    return result;
  }

  /**
   * Download updates for a specific entity type
   */
  private async downloadEntityUpdates(
    entity: PendingChange['entity'],
    since: Date | null
  ): Promise<number> {
    const endpoint = this.getEndpointForEntity(entity);
    const params = since ? `?since=${since.toISOString()}` : '';

    try {
      const updates = await this.network.get<any[]>(`${endpoint}${params}`);

      if (!updates || updates.length === 0) {
        return 0;
      }

      // Save updates to local storage
      for (const item of updates) {
        const key = this.getStorageKeyForEntity(entity, item.id);
        await this.storage.save(key, item);
      }

      // Update collection cache
      const collectionKey = this.getCollectionKeyForEntity(entity);
      await this.storage.save(collectionKey, updates);

      return updates.length;
    } catch (error) {
      console.error(`Failed to download ${entity} updates:`, error);
      throw error;
    }
  }

  /**
   * Update sync metadata after sync operation
   */
  private async updateSyncMetadata(result: SyncResult): Promise<void> {
    const metadata = await this.getSyncMetadata();

    metadata.lastSyncTime = new Date();
    if (result.success) {
      metadata.lastSuccessfulSync = new Date();
    }

    const queue = await this.getPendingChanges();
    metadata.pendingChanges = queue.length;
    metadata.conflicts += result.conflicts;

    // Keep only recent errors (last 10)
    metadata.errors = [...result.errors, ...metadata.errors].slice(0, 10);

    await this.storage.save(SYNC_METADATA, metadata);
  }

  /**
   * Resolve conflict using last-write-wins strategy
   * Returns true if should retry, false if should skip
   */
  private async resolveConflict(
    change: PendingChange,
    error: any
  ): Promise<boolean> {
    // Extract server timestamp from error (if available)
    const serverTimestamp = this.extractServerTimestamp(error);

    if (!serverTimestamp) {
      // Can't determine, retry
      return true;
    }

    // Last-write-wins: if local timestamp > server timestamp, retry
    // Otherwise, skip (server version is newer)
    const shouldRetry = change.timestamp > serverTimestamp;

    if (!shouldRetry) {
      console.log(
        `Conflict resolved: Server version is newer for change ${change.id}`
      );
    }

    return shouldRetry;
  }

  /**
   * Check if error is a conflict error
   */
  private isConflictError(error: any): boolean {
    // Check for common conflict indicators
    if (error?.status === 409) return true;
    if (error?.code === 'CONFLICT') return true;
    if (error?.message?.includes('conflict')) return true;
    return false;
  }

  /**
   * Extract server timestamp from error response
   */
  private extractServerTimestamp(error: any): number | null {
    try {
      if (error?.data?.timestamp) {
        return new Date(error.data.timestamp).getTime();
      }
      if (error?.response?.data?.timestamp) {
        return new Date(error.response.data.timestamp).getTime();
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }

  /**
   * Get API endpoint for entity type
   */
  private getEndpointForEntity(entity: PendingChange['entity']): string {
    const endpoints: Record<PendingChange['entity'], string> = {
      patient: '/api/patients',
      appointment: '/api/appointments',
      consultation: '/api/consultations',
      message: '/api/messages',
      settings: '/api/settings',
    };
    return endpoints[entity];
  }

  /**
   * Get storage key for entity
   */
  private getStorageKeyForEntity(
    entity: PendingChange['entity'],
    id: string
  ): string {
    return `${entity}s:${id}`;
  }

  /**
   * Get collection storage key for entity
   */
  private getCollectionKeyForEntity(entity: PendingChange['entity']): string {
    return `${entity}s:all`;
  }

  /**
   * Sleep utility for backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

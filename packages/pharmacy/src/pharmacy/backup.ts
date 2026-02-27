import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
// @ts-ignore
import * as LZUTF8 from 'lzutf8';
import {
  BackupConfig,
  BackupLog,
  BackupStatus,
  BackupType,
  BackupFrequency,
} from '@red-salud/types';

export interface BackupOptions {
  config: BackupConfig;
  tables?: string[];
  incrementalSince?: Date;
}

export interface BackupResult {
  success: boolean;
  log: BackupLog;
  error?: string;
}

export class BackupManager {
  private configs: Map<string, BackupConfig> = new Map();
  private logs: BackupLog[] = [];

  constructor() {
    this.loadConfigs();
  }

  async loadConfigs(): Promise<void> {
    // Load from database or localStorage
    const stored = localStorage.getItem('backup_configs');
    if (stored) {
      const configs = JSON.parse(stored) as BackupConfig[];
      configs.forEach((config) => {
        this.configs.set(config.id, config);
      });
    }
  }

  async saveConfigs(): Promise<void> {
    const configs = Array.from(this.configs.values());
    localStorage.setItem('backup_configs', JSON.stringify(configs));
  }

  async createConfig(config: Omit<BackupConfig, 'id' | 'created_at' | 'updated_at'>): Promise<BackupConfig> {
    const newConfig: BackupConfig = {
      ...config,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.configs.set(newConfig.id, newConfig);
    await this.saveConfigs();

    return newConfig;
  }

  async updateConfig(id: string, updates: Partial<BackupConfig>): Promise<BackupConfig | null> {
    const config = this.configs.get(id);
    if (!config) return null;

    const updated: BackupConfig = {
      ...config,
      ...updates,
      updated_at: new Date(),
    };

    this.configs.set(id, updated);
    await this.saveConfigs();

    return updated;
  }

  async deleteConfig(id: string): Promise<boolean> {
    return this.configs.delete(id);
  }

  getConfig(id: string): BackupConfig | undefined {
    return this.configs.get(id);
  }

  getAllConfigs(): BackupConfig[] {
    return Array.from(this.configs.values());
  }

  async performBackup(configId: string, options?: Partial<BackupOptions>): Promise<BackupResult> {
    const config = this.configs.get(configId);
    if (!config) {
      return {
        success: false,
        log: this.createLog(configId, BackupStatus.FAILED, BackupType.FULL),
        error: 'Configuration not found',
      };
    }

    if (!config.is_active) {
      return {
        success: false,
        log: this.createLog(configId, BackupStatus.FAILED, config.backup_type),
        error: 'Backup configuration is inactive',
      };
    }

    const log = this.createLog(configId, BackupStatus.IN_PROGRESS, config.backup_type);
    log.started_at = new Date();

    try {
      // Simulate backup process
      await this.simulateBackupProcess(config);

      log.status = BackupStatus.COMPLETED;
      log.completed_at = new Date();
      log.duration_seconds = Math.floor((log.completed_at.getTime() - log.started_at.getTime()) / 1000);
      log.size_bytes = Math.floor(Math.random() * 1000000000); // Simulated size
      log.size_compressed_bytes = Math.floor(log.size_bytes * 0.3); // 70% compression
      // Note: LZUTF8 might need additional setup for Node.js if being used there
      // log.size_compressed_bytes = LZUTF8.compressToGzip(new Uint8Array(log.size_bytes)).length;
      log.tables_backed_up = ['products', 'patients', 'invoices', 'batches', 'suppliers'];
      log.records_count = Math.floor(Math.random() * 100000);
      log.verified = true;
      log.verification_date = new Date();

      // Store backup location
      if (config.local_path) {
        log.local_path = path.join(config.local_path, `backup_${log.id}.sql.gz`);
      }
      if (config.cloud_provider !== 'none') {
        log.cloud_path = `${config.cloud_bucket}/${log.id}.sql.gz`;
      }

      this.logs.push(log);
      await this.saveLogs();

      return { success: true, log };
    } catch (error) {
      log.status = BackupStatus.FAILED;
      log.completed_at = new Date();
      log.error_message = error instanceof Error ? error.message : 'Unknown error';

      this.logs.push(log);
      await this.saveLogs();

      return {
        success: false,
        log,
        error: log.error_message,
      };
    }
  }

  private createLog(configId: string, status: BackupStatus, backupType: BackupType): BackupLog {
    const config = this.configs.get(configId);
    return {
      id: uuidv4(),
      config_id: configId,
      warehouse_id: config?.warehouse_id || '',
      status,
      backup_type: backupType,
      started_at: new Date(),
      created_at: new Date(),
      verified: false,
    };
  }

  private async simulateBackupProcess(config: BackupConfig): Promise<void> {
    // Simulate backup duration (2-5 seconds)
    const duration = 2000 + Math.random() * 3000;
    await new Promise((resolve) => setTimeout(resolve, duration));

    // Simulate potential failure (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Backup failed due to network error');
    }
  }

  async saveLogs(): Promise<void> {
    localStorage.setItem('backup_logs', JSON.stringify(this.logs));
  }

  async loadLogs(): Promise<void> {
    const stored = localStorage.getItem('backup_logs');
    if (stored) {
      this.logs = JSON.parse(stored) as BackupLog[];
    }
  }

  getLogs(configId?: string, limit?: number): BackupLog[] {
    let logs = this.logs;

    if (configId) {
      logs = logs.filter((log) => log.config_id === configId);
    }

    logs.sort((a, b) => b.started_at.getTime() - a.started_at.getTime());

    return limit ? logs.slice(0, limit) : logs;
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    const log = this.logs.find((l) => l.id === backupId);
    if (!log) {
      return { success: false, error: 'Backup not found' };
    }

    if (log.status !== BackupStatus.COMPLETED) {
      return { success: false, error: 'Backup is not in completed status' };
    }

    if (!log.verified) {
      return { success: false, error: 'Backup has not been verified' };
    }

    try {
      // Simulate restore process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      };
    }
  }

  async verifyBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    const log = this.logs.find((l) => l.id === backupId);
    if (!log) {
      return { success: false, error: 'Backup not found' };
    }

    try {
      // Simulate verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      log.verified = true;
      log.verification_date = new Date();
      await this.saveLogs();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  getBackupStats(configId?: string) {
    const logs = configId ? this.getLogs(configId) : this.logs;

    const total = logs.length;
    const completed = logs.filter((l) => l.status === BackupStatus.COMPLETED).length;
    const failed = logs.filter((l) => l.status === BackupStatus.FAILED).length;
    const inProgress = logs.filter((l) => l.status === BackupStatus.IN_PROGRESS).length;

    const successRate = total > 0 ? (completed / total) * 100 : 0;
    const avgDuration =
      completed > 0
        ? logs
          .filter((l) => l.duration_seconds)
          .reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / completed
        : 0;

    const lastSuccessfulBackup = logs
      .filter((l) => l.status === BackupStatus.COMPLETED)
      .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())[0];

    return {
      total,
      completed,
      failed,
      inProgress,
      successRate,
      avgDuration,
      lastSuccessfulBackup: lastSuccessfulBackup?.completed_at || null,
    };
  }

  async cleanupOldBackups(configId: string): Promise<number> {
    const config = this.configs.get(configId);
    if (!config) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.retention_days);

    const logsToRemove = this.logs.filter(
      (log) =>
        log.config_id === configId &&
        log.completed_at &&
        log.completed_at < cutoffDate &&
        log.status === BackupStatus.COMPLETED,
    );

    logsToRemove.forEach((log) => {
      const index = this.logs.findIndex((l) => l.id === log.id);
      if (index > -1) {
        this.logs.splice(index, 1);
      }
    });

    await this.saveLogs();

    return logsToRemove.length;
  }

  async scheduleBackups(): Promise<void> {
    // This would be implemented with a cron job or similar scheduler
    // For now, it's a placeholder for the scheduling logic
    const configs = this.getAllConfigs().filter((c) => c.is_active);

    for (const config of configs) {
      if (this.shouldRunBackup(config)) {
        await this.performBackup(config.id);
      }
    }
  }

  private shouldRunBackup(config: BackupConfig): boolean {
    const now = new Date();
    const lastBackup = this.getLogs(config.id, 1)[0];

    if (!lastBackup) return true;

    const timeSinceLastBackup = now.getTime() - lastBackup.started_at.getTime();
    const hoursSinceLastBackup = timeSinceLastBackup / (1000 * 60 * 60);

    switch (config.frequency) {
      case BackupFrequency.HOURLY:
        return hoursSinceLastBackup >= 1;
      case BackupFrequency.DAILY:
        return hoursSinceLastBackup >= 24;
      case BackupFrequency.WEEKLY:
        return hoursSinceLastBackup >= 168;
      case BackupFrequency.MONTHLY:
        return hoursSinceLastBackup >= 720;
      default:
        return false;
    }
  }
}

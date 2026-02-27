import { v4 as uuidv4 } from 'uuid';
import {
  SystemVersion,
  UpdateLog,
  UpdateStatus,
  UpdateChannel,
} from '@red-salud/types';

export interface CheckForUpdatesOptions {
  currentVersion: string;
  channel?: UpdateChannel;
}

export interface UpdateResult {
  success: boolean;
  version?: SystemVersion;
  error?: string;
}

export class UpdateManager {
  private versions: SystemVersion[] = [];
  private updateLogs: UpdateLog[] = [];
  private currentVersion: string = '1.0.0';

  constructor() {
    this.loadVersions();
    this.loadUpdateLogs();
    this.initializeVersions();
  }

  async loadVersions(): Promise<void> {
    const stored = localStorage.getItem('system_versions');
    if (stored) {
      this.versions = JSON.parse(stored) as SystemVersion[];
    }
  }

  async saveVersions(): Promise<void> {
    localStorage.setItem('system_versions', JSON.stringify(this.versions));
  }

  async loadUpdateLogs(): Promise<void> {
    const stored = localStorage.getItem('update_logs');
    if (stored) {
      this.updateLogs = JSON.parse(stored) as UpdateLog[];
    }
  }

  async saveUpdateLogs(): Promise<void> {
    localStorage.setItem('update_logs', JSON.stringify(this.updateLogs));
  }

  private initializeVersions(): void {
    if (this.versions.length === 0) {
      this.versions.push({
        id: uuidv4(),
        version: '1.0.0',
        version_number: '1.0.0',
        channel: UpdateChannel.STABLE,
        release_date: new Date(),
        is_latest: true,
        is_critical: false,
        created_at: new Date(),
      });
      this.saveVersions();
    }
  }

  async checkForUpdates(options: CheckForUpdatesOptions): Promise<UpdateResult> {
    const currentVersion = options.currentVersion || this.currentVersion;
    const channel = options.channel || UpdateChannel.STABLE;

    const availableVersions = this.versions.filter(
      (v) => v.channel === channel && !v.is_latest,
    );

    if (availableVersions.length === 0) {
      return {
        success: true,
        version: this.versions.find((v) => v.is_latest),
      };
    }

    const latestVersion = availableVersions.sort((a, b) =>
      b.version_number.localeCompare(a.version_number),
    )[0];

    if (!latestVersion) {
      return {
        success: true,
        version: this.versions.find((v) => v.is_latest),
      };
    }

    const isNewer = latestVersion.version_number.localeCompare(currentVersion) > 0;

    if (isNewer) {
      return {
        success: true,
        version: latestVersion,
      };
    }

    return {
      success: true,
      version: this.versions.find((v) => v.is_latest),
    };
  }

  async downloadUpdate(versionId: string): Promise<UpdateResult> {
    const version = this.versions.find((v) => v.id === versionId);
    if (!version) {
      return { success: false, error: 'Version not found' };
    }

    const updateLog: UpdateLog = {
      id: uuidv4(),
      version_id: versionId,
      version: version.version,
      status: UpdateStatus.DOWNLOADING,
      started_at: new Date(),
      rollback_available: false,
      created_at: new Date(),
    };

    this.updateLogs.push(updateLog);
    await this.saveUpdateLogs();

    // Simulate download
    setTimeout(async () => {
      updateLog.status = UpdateStatus.COMPLETED;
      updateLog.completed_at = new Date();
      updateLog.rollback_available = true;
      await this.saveUpdateLogs();
    }, 2000);

    return { success: true, version };
  }

  async installUpdate(versionId: string): Promise<UpdateResult> {
    const version = this.versions.find((v) => v.id === versionId);
    if (!version) {
      return { success: false, error: 'Version not found' };
    }

    const updateLog: UpdateLog = {
      id: uuidv4(),
      version_id: versionId,
      version: version.version,
      status: UpdateStatus.INSTALLING,
      started_at: new Date(),
      rollback_available: false,
      created_at: new Date(),
    };

    this.updateLogs.push(updateLog);
    await this.saveUpdateLogs();

    // Simulate installation
    setTimeout(async () => {
      updateLog.status = UpdateStatus.COMPLETED;
      updateLog.completed_at = new Date();
      updateLog.rollback_available = true;

      // Update current version
      this.currentVersion = version.version_number;
      this.versions.forEach((v) => {
        v.is_latest = v.id === versionId;
      });

      await this.saveUpdateLogs();
      await this.saveVersions();
    }, 3000);

    return { success: true, version };
  }

  async rollbackUpdate(updateId: string): Promise<{ success: boolean; error?: string }> {
    const updateLog = this.updateLogs.find((l) => l.id === updateId);
    if (!updateLog) {
      return { success: false, error: 'Update log not found' };
    }

    if (!updateLog.rollback_available) {
      return { success: false, error: 'Rollback not available for this update' };
    }

    try {
      // Simulate rollback
      await new Promise((resolve) => setTimeout(resolve, 2000));

      updateLog.status = UpdateStatus.ROLLED_BACK;
      updateLog.rollback_date = new Date();

      await this.saveUpdateLogs();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Rollback failed',
      };
    }
  }

  getVersions(channel?: UpdateChannel): SystemVersion[] {
    let versions = [...this.versions];

    if (channel) {
      versions = versions.filter((v) => v.channel === channel);
    }

    return versions.sort((a, b) => b.release_date.getTime() - a.release_date.getTime());
  }

  getLatestVersion(channel?: UpdateChannel): SystemVersion | undefined {
    let versions = this.versions.filter((v) => v.is_latest);

    if (channel) {
      versions = versions.filter((v) => v.channel === channel);
    }

    return versions[0];
  }

  getUpdateLogs(versionId?: string): UpdateLog[] {
    let logs = [...this.updateLogs];

    if (versionId) {
      logs = logs.filter((l) => l.version_id === versionId);
    }

    return logs.sort((a, b) => b.started_at.getTime() - a.started_at.getTime());
  }

  getUpdateStats() {
    const total = this.updateLogs.length;
    const completed = this.updateLogs.filter((l) => l.status === UpdateStatus.COMPLETED).length;
    const failed = this.updateLogs.filter((l) => l.status === UpdateStatus.FAILED).length;
    const rolledBack = this.updateLogs.filter((l) => l.status === UpdateStatus.ROLLED_BACK).length;

    const pending = this.updateLogs.filter((l) => l.status === UpdateStatus.PENDING).length;
    const downloading = this.updateLogs.filter((l) => l.status === UpdateStatus.DOWNLOADING).length;
    const installing = this.updateLogs.filter((l) => l.status === UpdateStatus.INSTALLING).length;

    return {
      total,
      completed,
      failed,
      rolledBack,
      pending,
      downloading,
      installing,
      currentVersion: this.currentVersion,
    };
  }

  async addVersion(version: Omit<SystemVersion, 'id' | 'created_at'>): Promise<SystemVersion> {
    const newVersion: SystemVersion = {
      ...version,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.versions.push(newVersion);
    await this.saveVersions();

    return newVersion;
  }
}

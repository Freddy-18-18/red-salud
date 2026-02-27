import { ImmutableAuditLogManager } from './security';

/**
 * Version Audit Record
 */
export interface VersionAuditRecord {
  id: string;
  version: string;
  build_number: string;
  hash: string;
  
  installed_at: Date;
  installed_by: string;
  
  homologation_id?: string;
  homologation_status: 'pending' | 'approved' | 'rejected' | 'expired';
  
  files_checksum: Record<string, string>;
  
  is_authorized: boolean;
  authorization_expires?: Date;
  
  created_at: Date;
  updated_at: Date;
}

/**
 * Version Audit Manager
 * Implements version tracking and authorization per SENIAT requirements
 * Prevents use of unauthorized or modified software
 */
export class VersionAuditManager {
  private static currentVersion: VersionAuditRecord | null = null;
  private static STORAGE_KEY = 'version_audit';
  
  /**
   * Generate SHA-256 hash of application files
   */
  private static async generateFileHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Generate combined hash of all application files
   */
  private static async generateCombinedHash(files: Record<string, string>): Promise<string> {
    const sortedFiles = Object.entries(files).sort(([a], [b]) => a.localeCompare(b));
    const combined = sortedFiles.map(([name, content]) => `${name}:${content}`).join('|');
    return this.generateFileHash(combined);
  }
  
  /**
   * Register a new version installation
   */
  static async registerVersion(data: {
    version: string;
    buildNumber: string;
    installedBy: string;
    homologationId?: string;
    files: Record<string, string>;
  }): Promise<VersionAuditRecord> {
    const filesChecksum: Record<string, string> = {};
    
    // Generate checksum for each file
    for (const [filename, content] of Object.entries(data.files)) {
      filesChecksum[filename] = await this.generateFileHash(content);
    }
    
    // Generate combined hash for the entire version
    const hash = await this.generateCombinedHash(filesChecksum);
    
    const record: VersionAuditRecord = {
      id: crypto.randomUUID(),
      version: data.version,
      build_number: data.buildNumber,
      hash,
      installed_at: new Date(),
      installed_by: data.installedBy,
      homologation_id: data.homologationId,
      homologation_status: data.homologationId ? 'pending' : 'approved',
      files_checksum: filesChecksum,
      is_authorized: true, // Default to authorized, will be validated
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    this.currentVersion = record;
    await this.persistVersion();
    
    // Log version installation for compliance
    await ImmutableAuditLogManager.logSecurityEvent({
      userId: data.installedBy,
      eventType: 'suspicious_activity',
      details: {
        action: 'version_installed',
        version: data.version,
        build_number: data.buildNumber,
        hash,
      },
    });
    
    return record;
  }
  
  /**
   * Verify current version integrity
   */
  static async verifyVersionIntegrity(files: Record<string, string>): Promise<{
    isValid: boolean;
    details?: string;
    modifiedFiles?: string[];
  }> {
    if (!this.currentVersion) {
      return {
        isValid: false,
        details: 'No version registered',
      };
    }
    
    const modifiedFiles: string[] = [];
    
    // Check each file against stored checksum
    for (const [filename, expectedHash] of Object.entries(this.currentVersion.files_checksum)) {
      if (files[filename]) {
        const actualHash = await this.generateFileHash(files[filename]);
        if (actualHash !== expectedHash) {
          modifiedFiles.push(filename);
        }
      } else {
        modifiedFiles.push(filename);
      }
    }
    
    if (modifiedFiles.length > 0) {
      return {
        isValid: false,
        details: 'Files have been modified',
        modifiedFiles,
      };
    }
    
    // Verify combined hash
    const currentHash = await this.generateCombinedHash(this.currentVersion.files_checksum);
    if (currentHash !== this.currentVersion.hash) {
      return {
        isValid: false,
        details: 'Version hash mismatch - possible tampering detected',
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Check if current version is authorized
   */
  static isVersionAuthorized(): { authorized: boolean; reason?: string } {
    if (!this.currentVersion) {
      return {
        authorized: false,
        reason: 'No version registered - system may be using unauthorized software',
      };
    }
    
    if (!this.currentVersion.is_authorized) {
      return {
        authorized: false,
        reason: 'Version is not authorized for fiscal operations',
      };
    }
    
    // Check if authorization has expired
    if (this.currentVersion.authorization_expires && new Date() > this.currentVersion.authorization_expires) {
      return {
        authorized: false,
        reason: 'Version authorization has expired - update required',
      };
    }
    
    // Check homologation status
    if (this.currentVersion.homologation_status === 'rejected') {
      return {
        authorized: false,
        reason: 'Version homologation rejected by SENIAT',
      };
    }
    
    if (this.currentVersion.homologation_status === 'expired') {
      return {
        authorized: false,
        reason: 'Version homologation has expired',
      };
    }
    
    return { authorized: true };
  }
  
  /**
   * Update homologation status
   */
  static async updateHomologationStatus(versionId: string, status: 'approved' | 'rejected' | 'expired', updatedBy: string): Promise<void> {
    if (!this.currentVersion || this.currentVersion.id !== versionId) {
      throw new Error('Version not found');
    }
    
    this.currentVersion.homologation_status = status;
    this.currentVersion.is_authorized = status === 'approved';
    this.currentVersion.updated_at = new Date();
    
    await this.persistVersion();
    
    await ImmutableAuditLogManager.logSecurityEvent({
      userId: updatedBy,
      eventType: 'suspicious_activity',
      details: {
        action: 'homologation_updated',
        version_id: versionId,
        status,
      },
    });
  }
  
  /**
   * Set authorization expiration
   */
  static async setAuthorizationExpiration(versionId: string, expiresAt: Date, setBy: string): Promise<void> {
    if (!this.currentVersion || this.currentVersion.id !== versionId) {
      throw new Error('Version not found');
    }
    
    this.currentVersion.authorization_expires = expiresAt;
    this.currentVersion.updated_at = new Date();
    
    await this.persistVersion();
    
    await ImmutableAuditLogManager.logSecurityEvent({
      userId: setBy,
      eventType: 'suspicious_activity',
      details: {
        action: 'authorization_expiration_set',
        version_id: versionId,
        expires_at: expiresAt.toISOString(),
      },
    });
  }
  
  /**
   * Get current version
   */
  static getCurrentVersion(): VersionAuditRecord | null {
    return this.currentVersion;
  }
  
  /**
   * Get version information
   */
  static getVersionInfo(): {
    version: string | null;
    buildNumber: string | null;
    hash: string | null;
    installedAt: Date | null;
    isAuthorized: boolean;
    homologationStatus: string | null;
  } {
    if (!this.currentVersion) {
      return {
        version: null,
        buildNumber: null,
        hash: null,
        installedAt: null,
        isAuthorized: false,
        homologationStatus: null,
      };
    }
    
    return {
      version: this.currentVersion.version,
      buildNumber: this.currentVersion.build_number,
      hash: this.currentVersion.hash,
      installedAt: this.currentVersion.installed_at,
      isAuthorized: this.currentVersion.is_authorized,
      homologationStatus: this.currentVersion.homologation_status,
    };
  }
  
  /**
   * Generate version report for SENIAT
   */
  static generateVersionReport(): {
    version: string;
    buildNumber: string;
    hash: string;
    installedAt: Date;
    installedBy: string;
    homologationId?: string;
    homologationStatus: string;
    isAuthorized: boolean;
    authorizationExpires?: Date;
    filesCount: number;
  } | null {
    if (!this.currentVersion) {
      return null;
    }
    
    return {
      version: this.currentVersion.version,
      buildNumber: this.currentVersion.build_number,
      hash: this.currentVersion.hash,
      installedAt: this.currentVersion.installed_at,
      installedBy: this.currentVersion.installed_by,
      homologationId: this.currentVersion.homologation_id,
      homologationStatus: this.currentVersion.homologation_status,
      isAuthorized: this.currentVersion.is_authorized,
      authorizationExpires: this.currentVersion.authorization_expires,
      filesCount: Object.keys(this.currentVersion.files_checksum).length,
    };
  }
  
  /**
   * Persist version to localStorage
   */
  private static async persistVersion(): Promise<void> {
    try {
      if (this.currentVersion) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentVersion));
      }
    } catch (error) {
      console.error('Error persisting version audit:', error);
      throw new Error('Failed to persist version audit - compliance violation');
    }
  }
  
  /**
   * Load version from localStorage
   */
  static async loadVersion(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentVersion = JSON.parse(stored, (key, value) => {
          if (key === 'installed_at' || key === 'created_at' || key === 'authorization_expires') {
            return new Date(value);
          }
          return value;
        });
      }
    } catch (error) {
      console.error('Error loading version audit:', error);
    }
  }
  
  /**
   * Clear version (for testing or reinstallation)
   */
  static async clearVersion(): Promise<void> {
    this.currentVersion = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

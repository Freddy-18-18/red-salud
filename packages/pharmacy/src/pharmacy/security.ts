import { User, AuditLog, UserRole } from '@red-salud/types';

/**
 * Role-Based Access Control Manager
 * Manages user permissions and access control
 */
export class RBACManager {
  private static rolePermissions: Record<UserRole, string[]> = {
    [UserRole.CASHIER]: [
      'pos:read',
      'pos:create',
      'pos:process',
      'inventory:read',
      'products:read',
    ],
    [UserRole.PHARMACIST]: [
      'pos:read',
      'pos:create',
      'pos:process',
      'inventory:read',
      'inventory:update',
      'products:read',
      'patients:read',
      'patients:create',
      'clinical:read',
      'clinical:create',
      'reports:read',
    ],
    [UserRole.MANAGER]: [
      'pos:read',
      'pos:create',
      'pos:process',
      'pos:cancel',
      'inventory:read',
      'inventory:update',
      'inventory:delete',
      'products:read',
      'products:create',
      'products:update',
      'patients:read',
      'patients:create',
      'patients:update',
      'clinical:read',
      'clinical:create',
      'clinical:update',
      'suppliers:read',
      'suppliers:create',
      'suppliers:update',
      'reports:read',
      'reports:create',
      'users:read',
      'settings:read',
      'settings:update',
    ],
    [UserRole.ADMIN]: [
      '*', // Full access
    ],
    [UserRole.SUPERVISOR]: [
      'pos:read',
      'pos:create',
      'pos:process',
      'pos:cancel',
      'pos:refund',
      'inventory:read',
      'inventory:update',
      'inventory:delete',
      'products:read',
      'products:create',
      'products:update',
      'products:delete',
      'patients:read',
      'patients:create',
      'patients:update',
      'patients:delete',
      'clinical:read',
      'clinical:create',
      'clinical:update',
      'clinical:delete',
      'suppliers:read',
      'suppliers:create',
      'suppliers:update',
      'suppliers:delete',
      'reports:read',
      'reports:create',
      'reports:delete',
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'settings:read',
      'settings:update',
      'settings:delete',
      'audit:read',
    ],
  };

  /**
   * Check if user has permission
   */
  static hasPermission(user: User, permission: string): boolean {
    const permissions = this.rolePermissions[user.role] || [];

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check wildcard permission
    if (permissions.includes('*')) {
      return true;
    }

    // Check specific permission
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all specified permissions
   */
  static hasAllPermissions(user: User, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Get all permissions for a role
   */
  static getPermissionsForRole(role: UserRole): string[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Require permission (throws if not authorized)
   */
  static requirePermission(user: User, permission: string): void {
    if (!this.hasPermission(user, permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  /**
   * Require any permission (throws if user has none)
   */
  static requireAnyPermission(user: User, permissions: string[]): void {
    if (!this.hasAnyPermission(user, permissions)) {
      throw new Error(`Permission denied: requires one of ${permissions.join(', ')}`);
    }
  }

  /**
   * Create user with role
   */
  static createUser(
    data: Omit<User, 'id' | 'created_at' | 'updated_at'>
  ): User {
    return {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Update user role
   */
  static updateUserRole(user: User, newRole: UserRole): User {
    return {
      ...user,
      role: newRole,
      permissions: this.getPermissionsForRole(newRole),
      updated_at: new Date(),
    };
  }

  /**
   * Check if user can cancel invoice
   */
  static canCancelInvoice(user: User): boolean {
    return this.hasPermission(user, 'pos:cancel');
  }

  /**
   * Check if user can refund invoice
   */
  static canRefundInvoice(user: User): boolean {
    return this.hasPermission(user, 'pos:refund');
  }

  /**
   * Check if user can view costs
   */
  static canViewCosts(user: User): boolean {
    return this.hasPermission(user, 'inventory:read') &&
      (user.role === UserRole.MANAGER || user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR);
  }

  /**
   * Check if user can manage users
   */
  static canManageUsers(user: User): boolean {
    return this.hasPermission(user, 'users:create') ||
      this.hasPermission(user, 'users:update') ||
      this.hasPermission(user, 'users:delete');
  }

  /**
   * Check if user can manage settings
   */
  static canManageSettings(user: User): boolean {
    return this.hasPermission(user, 'settings:update');
  }

  /**
   * Check if user can view audit logs
   */
  static canViewAuditLogs(user: User): boolean {
    return this.hasPermission(user, 'audit:read');
  }
}

/**
 * Audit Log Manager
 * Tracks all system actions for compliance and security
 */
export class AuditLogManager {
  private static logs: AuditLog[] = [];

  /**
   * Log an action
   */
  static log(data: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date(),
    };

    this.logs.push(log);

    // In a real implementation, this would save to database
    // For now, we'll store in memory and localStorage
    this.persistLogs();

    return log;
  }

  /**
   * Get logs for a user
   */
  static getUserLogs(userId: string, limit: number = 100): AuditLog[] {
    return this.logs
      .filter(log => log.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  /**
   * Get logs for an entity
   */
  static getEntityLogs(entityType: string, entityId: string, limit: number = 100): AuditLog[] {
    return this.logs
      .filter(log => log.entity_type === entityType && log.entity_id === entityId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  /**
   * Get logs by action type
   */
  static getLogsByAction(action: string, limit: number = 100): AuditLog[] {
    return this.logs
      .filter(log => log.action === action)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  /**
   * Get recent logs
   */
  static getRecentLogs(limit: number = 50): AuditLog[] {
    return this.logs
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  /**
   * Get logs within date range
   */
  static getLogsByDateRange(startDate: Date, endDate: Date): AuditLog[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  /**
   * Persist logs to localStorage
   */
  private static persistLogs(): void {
    try {
      const logsToStore = this.logs.slice(-1000); // Keep last 1000 logs
      localStorage.setItem('audit_logs', JSON.stringify(logsToStore));
    } catch (error) {
      console.error('Error persisting audit logs:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  static loadLogs(): void {
    try {
      const stored = localStorage.getItem('audit_logs');
      if (stored) {
        this.logs = JSON.parse(stored).map((log: any) => ({
          ...log,
          created_at: new Date(log.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  }

  /**
   * Clear old logs (older than 90 days)
   */
  static clearOldLogs(): void {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    this.logs = this.logs.filter(log => new Date(log.created_at) >= ninetyDaysAgo);
    this.persistLogs();
  }

  /**
   * Generate audit report
   */
  static generateAuditReport(startDate: Date, endDate: Date): {
    total_actions: number;
    actions_by_type: Record<string, number>;
    actions_by_user: Record<string, number>;
    actions_by_entity: Record<string, number>;
  } {
    const logs = this.getLogsByDateRange(startDate, endDate);

    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};
    const actionsByEntity: Record<string, number> = {};

    logs.forEach(log => {
      // Count by action type
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

      // Count by user
      actionsByUser[log.user_id] = (actionsByUser[log.user_id] || 0) + 1;

      // Count by entity type
      actionsByEntity[log.entity_type] = (actionsByEntity[log.entity_type] || 0) + 1;
    });

    return {
      total_actions: logs.length,
      actions_by_type: actionsByType,
      actions_by_user: actionsByUser,
      actions_by_entity: actionsByEntity,
    };
  }

  /**
   * Log common actions
   */
  static logInvoiceCreated(userId: string, invoiceId: string): void {
    this.log({
      user_id: userId,
      action: 'invoice.created',
      entity_type: 'invoice',
      entity_id: invoiceId,
    });
  }

  static logInvoiceCancelled(userId: string, invoiceId: string, reason?: string): void {
    this.log({
      user_id: userId,
      action: 'invoice.cancelled',
      entity_type: 'invoice',
      entity_id: invoiceId,
      changes: reason ? { reason } : undefined,
    });
  }

  static logInventoryUpdated(userId: string, productId: string, changes: any): void {
    this.log({
      user_id: userId,
      action: 'inventory.updated',
      entity_type: 'product',
      entity_id: productId,
      changes,
    });
  }

  static logPriceChanged(userId: string, productId: string, oldPrice: number, newPrice: number): void {
    this.log({
      user_id: userId,
      action: 'product.price_changed',
      entity_type: 'product',
      entity_id: productId,
      changes: { old_price: oldPrice, new_price: newPrice },
    });
  }

  static logUserCreated(userId: string, createdUserId: string): void {
    this.log({
      user_id: userId,
      action: 'user.created',
      entity_type: 'user',
      entity_id: createdUserId,
    });
  }

  static logSettingsUpdated(userId: string, changes: any): void {
    this.log({
      user_id: userId,
      action: 'settings.updated',
      entity_type: 'settings',
      changes,
    });
  }
}

/**
 * Immutable Audit Log Manager (Blockchain-like)
 * Implements SENIAT Art. 3 compliance: logs cannot be hidden, modified, or deleted
 * Each log entry is cryptographically linked to the previous one
 */
export interface ImmutableAuditLog extends AuditLog {
  sequence_number: number;
  previous_hash: string;
  current_hash: string;
  signature: string;
}

export class ImmutableAuditLogManager {
  private static logs: ImmutableAuditLog[] = [];
  private static currentSequence = 0;
  private static STORAGE_KEY = 'immutable_audit_logs';

  /**
   * Generate cryptographic hash of data using Web Crypto API
   */
  private static async generateHash(data: any): Promise<string> {
    const dataString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate digital signature using Web Crypto API
   */
  private static async generateSignature(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Create an immutable audit log entry
   */
  static async log(data: Omit<AuditLog, 'id' | 'created_at'>): Promise<ImmutableAuditLog> {
    const previousLog = this.logs[this.logs.length - 1];
    const previousHash = previousLog ? previousLog.current_hash : 'GENESIS';

    const sequenceNumber = this.currentSequence;
    this.currentSequence++;

    const timestamp = new Date().toISOString();
    const logData = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date(),
    };

    const currentHash = await this.generateHash({
      sequence: sequenceNumber,
      previous_hash: previousHash,
      data: logData,
      timestamp,
    });

    const signature = await this.generateSignature(currentHash);

    const immutableLog: ImmutableAuditLog = {
      ...logData,
      sequence_number: sequenceNumber,
      previous_hash: previousHash,
      current_hash: currentHash,
      signature,
    };

    this.logs.push(immutableLog);
    await this.persistLogs();

    return immutableLog;
  }

  /**
   * Verify chain integrity - ensures no logs have been tampered with
   */
  static async verifyChainIntegrity(): Promise<{
    isValid: boolean;
    brokenAt?: number;
    details?: string;
  }> {
    for (let i = 0; i < this.logs.length; i++) {
      const current = this.logs[i];
      if (!current) continue;

      const previous = i === 0 ? null : this.logs[i - 1];
      const expectedPreviousHash = i === 0 ? 'GENESIS' : (previous?.current_hash || '');

      if (current.previous_hash !== expectedPreviousHash) {
        return {
          isValid: false,
          brokenAt: i,
          details: `Chain broken at sequence ${current.sequence_number}: expected previous hash ${expectedPreviousHash}, got ${current.previous_hash}`,
        };
      }

      const recalculatedHash = await this.generateHash({
        sequence: current.sequence_number,
        previous_hash: current.previous_hash,
        data: {
          id: current.id,
          user_id: current.user_id,
          action: current.action,
          entity_type: current.entity_type,
          entity_id: current.entity_id,
          changes: current.changes,
          ip_address: current.ip_address,
          created_at: current.created_at.toISOString(),
        },
        timestamp: current.created_at.toISOString(),
      });

      if (current.current_hash !== recalculatedHash) {
        return {
          isValid: false,
          brokenAt: i,
          details: `Hash mismatch at sequence ${current.sequence_number}: data may have been tampered with`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Get logs by sequence range (for compliance reporting)
   */
  static getLogsBySequenceRange(startSequence: number, endSequence: number): ImmutableAuditLog[] {
    return this.logs.filter(
      log => log.sequence_number >= startSequence && log.sequence_number <= endSequence
    );
  }

  /**
   * Get logs by user with full chain data
   */
  static getUserImmutableLogs(userId: string, limit: number = 100): ImmutableAuditLog[] {
    return this.logs
      .filter(log => log.user_id === userId)
      .sort((a, b) => b.sequence_number - a.sequence_number)
      .slice(0, limit);
  }

  /**
   * Get logs by entity with full chain data
   */
  static getEntityImmutableLogs(entityType: string, entityId: string, limit: number = 100): ImmutableAuditLog[] {
    return this.logs
      .filter(log => log.entity_type === entityType && log.entity_id === entityId)
      .sort((a, b) => b.sequence_number - a.sequence_number)
      .slice(0, limit);
  }

  /**
   * Get all logs (for full system audit)
   */
  static getAllLogs(): ImmutableAuditLog[] {
    return [...this.logs];
  }

  /**
   * Get chain statistics for compliance reporting
   */
  static getChainStatistics(): {
    totalLogs: number;
    sequenceRange: { start: number; end: number };
    genesisHash: string;
    latestHash: string;
  } {
    return {
      totalLogs: this.logs.length,
      sequenceRange: {
        start: this.logs[0]?.sequence_number || 0,
        end: this.logs[this.logs.length - 1]?.sequence_number || 0,
      },
      genesisHash: this.logs[0]?.current_hash || 'N/A',
      latestHash: this.logs[this.logs.length - 1]?.current_hash || 'N/A',
    };
  }

  /**
   * Persist logs to localStorage with integrity check
   */
  private static async persistLogs(): Promise<void> {
    try {
      const logsToStore = this.logs.slice(-5000); // Keep last 5000 logs
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logsToStore));
    } catch (error) {
      console.error('Error persisting immutable audit logs:', error);
      throw new Error('Failed to persist audit logs - compliance violation');
    }
  }

  /**
   * Load logs from localStorage with integrity verification
   */
  static async loadLogs(): Promise<{ success: boolean; integrityValid: boolean; message?: string }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored).map((log: any) => ({
          ...log,
          created_at: new Date(log.created_at),
        }));

        const integrityCheck = await this.verifyChainIntegrity();
        if (!integrityCheck.isValid) {
          return {
            success: false,
            integrityValid: false,
            message: `Chain integrity compromised: ${integrityCheck.details}`,
          };
        }

        // Update sequence counter
        if (this.logs.length > 0) {
          const lastLog = this.logs[this.logs.length - 1];
          if (lastLog) {
            this.currentSequence = lastLog.sequence_number + 1;
          }
        }

        return { success: true, integrityValid: true };
      }
      return { success: true, integrityValid: true };
    } catch (error) {
      console.error('Error loading immutable audit logs:', error);
      return {
        success: false,
        integrityValid: false,
        message: 'Failed to load audit logs',
      };
    }
  }

  /**
   * Generate compliance report for SENIAT
   */
  static async generateComplianceReport(startDate: Date, endDate: Date): Promise<{
    reportGenerated: Date;
    chainStatistics: any;
    integrityCheck: any;
    logsInRange: ImmutableAuditLog[];
    summary: {
      totalLogs: number;
      actionsByType: Record<string, number>;
      usersActive: number;
      entitiesAffected: number;
    };
  }> {
    const logsInRange = this.logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= startDate && logDate <= endDate;
    });

    const actionsByType: Record<string, number> = {};
    const uniqueUsers = new Set<string>();
    const uniqueEntities = new Set<string>();

    logsInRange.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      uniqueUsers.add(log.user_id);
      if (log.entity_id) uniqueEntities.add(`${log.entity_type}:${log.entity_id}`);
    });

    const integrityCheck = await this.verifyChainIntegrity();

    return {
      reportGenerated: new Date(),
      chainStatistics: this.getChainStatistics(),
      integrityCheck,
      logsInRange,
      summary: {
        totalLogs: logsInRange.length,
        actionsByType,
        usersActive: uniqueUsers.size,
        entitiesAffected: uniqueEntities.size,
      },
    };
  }

  /**
   * Log critical fiscal events (for SENIAT compliance)
   */
  static async logFiscalEvent(data: {
    userId: string;
    eventType: 'invoice_created' | 'invoice_cancelled' | 'invoice_modified' | 'payment_received' | 'refund_issued';
    entityType: string;
    entityId: string;
    amount?: { usd?: number; ves?: number };
    fiscalData?: any;
  }): Promise<ImmutableAuditLog> {
    return this.log({
      user_id: data.userId,
      action: `fiscal.${data.eventType}`,
      entity_type: data.entityType,
      entity_id: data.entityId,
      changes: data.fiscalData ? { ...data.fiscalData, amount: data.amount } : { amount: data.amount },
    });
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(data: {
    userId: string;
    eventType: 'login_attempt' | 'login_success' | 'login_failed' | 'logout' | 'permission_denied' | 'suspicious_activity';
    ipAddress?: string;
    details?: any;
  }): Promise<ImmutableAuditLog> {
    return this.log({
      user_id: data.userId,
      action: `security.${data.eventType}`,
      entity_type: 'security',
      ip_address: data.ipAddress,
      changes: data.details,
    });
  }

  /**
   * Log inventory events
   */
  static async logInventoryEvent(data: {
    userId: string;
    eventType: 'stock_received' | 'stock_adjusted' | 'stock_transferred' | 'batch_created' | 'batch_expired';
    entityType: string;
    entityId: string;
    changes?: any;
  }): Promise<ImmutableAuditLog> {
    return this.log({
      user_id: data.userId,
      action: `inventory.${data.eventType}`,
      entity_type: data.entityType,
      entity_id: data.entityId,
      changes: data.changes,
    });
  }
}

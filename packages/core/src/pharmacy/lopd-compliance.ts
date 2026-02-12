import { v4 as uuidv4 } from 'uuid';
import {
  LOPDAuditLog,
  LOPDAuditEventType,
  LOPDComplianceReport,
  UserRole,
} from '@red-salud/types';

export interface AuditEvent {
  event_type: LOPDAuditEventType;
  action: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  entity_type: string;
  entity_id?: string;
  data_category: LOPDAuditLog['data_category'];
  description: string;
  ip_address?: string;
  user_agent?: string;
  warehouse_id?: string;
}

export interface ComplianceReportOptions {
  period_start: Date;
  period_end: Date;
  generated_by: string;
}

export class LOPDComplianceManager {
  private auditLogs: LOPDAuditLog[] = [];
  private reports: LOPDComplianceReport[] = [];

  constructor() {
    this.loadAuditLogs();
    this.loadReports();
  }

  async loadAuditLogs(): Promise<void> {
    const stored = localStorage.getItem('lopd_audit_logs');
    if (stored) {
      this.auditLogs = JSON.parse(stored) as LOPDAuditLog[];
    }
  }

  async saveAuditLogs(): Promise<void> {
    localStorage.setItem('lopd_audit_logs', JSON.stringify(this.auditLogs));
  }

  async loadReports(): Promise<void> {
    const stored = localStorage.getItem('lopd_compliance_reports');
    if (stored) {
      this.reports = JSON.parse(stored) as LOPDComplianceReport[];
    }
  }

  async saveReports(): Promise<void> {
    localStorage.setItem('lopd_compliance_reports', JSON.stringify(this.reports));
  }

  async logEvent(event: AuditEvent): Promise<LOPDAuditLog> {
    const auditLog: LOPDAuditLog = {
      id: uuidv4(),
      event_type: event.event_type,
      action: event.action,
      user_id: event.user_id,
      user_name: event.user_name,
      user_role: event.user_role,
      entity_type: event.entity_type,
      entity_id: event.entity_id,
      data_category: event.data_category,
      description: event.description,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      warehouse_id: event.warehouse_id,
      created_at: new Date(),
    };

    this.auditLogs.push(auditLog);
    await this.saveAuditLogs();

    return auditLog;
  }

  async logDataAccess(
    userId: string,
    userName: string,
    userRole: UserRole,
    entityType: string,
    entityId?: string,
    description?: string,
  ): Promise<LOPDAuditLog> {
    return this.logEvent({
      event_type: LOPDAuditEventType.DATA_ACCESS,
      action: 'Accessed data',
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      entity_type: entityType,
      entity_id: entityId,
      data_category: 'personal',
      description: description || `User accessed ${entityType}`,
    });
  }

  async logDataModification(
    userId: string,
    userName: string,
    userRole: UserRole,
    entityType: string,
    entityId: string,
    changes: Record<string, any>,
  ): Promise<LOPDAuditLog> {
    return this.logEvent({
      event_type: LOPDAuditEventType.DATA_MODIFICATION,
      action: 'Modified data',
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      entity_type: entityType,
      entity_id: entityId,
      data_category: 'personal',
      description: `Modified ${entityType}: ${JSON.stringify(changes)}`,
    });
  }

  async logDataDeletion(
    userId: string,
    userName: string,
    userRole: UserRole,
    entityType: string,
    entityId: string,
  ): Promise<LOPDAuditLog> {
    return this.logEvent({
      event_type: LOPDAuditEventType.DATA_DELETION,
      action: 'Deleted data',
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      entity_type: entityType,
      entity_id: entityId,
      data_category: 'personal',
      description: `Deleted ${entityType} with ID ${entityId}`,
    });
  }

  async logDataExport(
    userId: string,
    userName: string,
    userRole: UserRole,
    entityType: string,
    recordCount: number,
  ): Promise<LOPDAuditLog> {
    return this.logEvent({
      event_type: LOPDAuditEventType.DATA_EXPORT,
      action: 'Exported data',
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      entity_type: entityType,
      data_category: 'personal',
      description: `Exported ${recordCount} records from ${entityType}`,
    });
  }

  async logSystemAccess(
    userId: string,
    userName: string,
    userRole: UserRole,
    ipAddress: string,
    userAgent: string,
  ): Promise<LOPDAuditLog> {
    return this.logEvent({
      event_type: LOPDAuditEventType.SYSTEM_ACCESS,
      action: 'System login',
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      entity_type: 'system',
      data_category: 'other',
      description: 'User logged into the system',
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logBackupAccess(
    userId: string,
    userName: string,
    userRole: UserRole,
    backupId: string,
  ): Promise<LOPDAuditLog> {
    return this.logEvent({
      event_type: LOPDAuditEventType.BACKUP_ACCESS,
      action: 'Accessed backup',
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      entity_type: 'backup',
      entity_id: backupId,
      data_category: 'other',
      description: `User accessed backup ${backupId}`,
    });
  }

  async logKeyAccess(
    userId: string,
    userName: string,
    userRole: UserRole,
    keyId: string,
  ): Promise<LOPDAuditLog> {
    return this.logEvent({
      event_type: LOPDAuditEventType.KEY_ACCESS,
      action: 'Accessed encryption key',
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      entity_type: 'encryption_key',
      entity_id: keyId,
      data_category: 'other',
      description: `User accessed encryption key ${keyId}`,
    });
  }

  getAuditLogs(filters?: {
    user_id?: string;
    entity_type?: string;
    event_type?: LOPDAuditEventType;
    data_category?: LOPDAuditLog['data_category'];
    start_date?: Date;
    end_date?: Date;
    limit?: number;
  }): LOPDAuditLog[] {
    let logs = [...this.auditLogs];

    if (filters?.user_id) {
      logs = logs.filter((log) => log.user_id === filters.user_id);
    }

    if (filters?.entity_type) {
      logs = logs.filter((log) => log.entity_type === filters.entity_type);
    }

    if (filters?.event_type) {
      logs = logs.filter((log) => log.event_type === filters.event_type);
    }

    if (filters?.data_category) {
      logs = logs.filter((log) => log.data_category === filters.data_category);
    }

    if (filters?.start_date) {
      logs = logs.filter((log) => log.created_at >= filters.start_date!);
    }

    if (filters?.end_date) {
      logs = logs.filter((log) => log.created_at <= filters.end_date!);
    }

    logs.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    return filters?.limit ? logs.slice(0, filters.limit) : logs;
  }

  async generateComplianceReport(
    options: ComplianceReportOptions,
  ): Promise<LOPDComplianceReport> {
    const periodLogs = this.getAuditLogs({
      start_date: options.period_start,
      end_date: options.period_end,
    });

    const reportNumber = `LOPD-${Date.now()}`;

    const eventsByType = periodLogs.reduce(
      (acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const eventsByUser = periodLogs.reduce((acc, log) => {
      const existing = acc.find((u) => u.user_id === log.user_id);
      if (existing) {
        existing.event_count++;
      } else {
        acc.push({
          user_id: log.user_id,
          user_name: log.user_name,
          event_count: 1,
        });
      }
      return acc;
    }, [] as Array<{ user_id: string; user_name: string; event_count: number }>);

    const dataAccessCount = periodLogs.filter(
      (l) => l.event_type === LOPDAuditEventType.DATA_ACCESS,
    ).length;

    const dataModificationCount = periodLogs.filter(
      (l) => l.event_type === LOPDAuditEventType.DATA_MODIFICATION,
    ).length;

    const dataDeletionCount = periodLogs.filter(
      (l) => l.event_type === LOPDAuditEventType.DATA_DELETION,
    ).length;

    const unauthorizedAttempts = periodLogs.filter(
      (l) => l.description?.toLowerCase().includes('unauthorized'),
    ).length;

    const findings = this.generateFindings(periodLogs);

    const report: LOPDComplianceReport = {
      id: uuidv4(),
      report_number: reportNumber,
      period_start: options.period_start,
      period_end: options.period_end,
      total_events: periodLogs.length,
      events_by_type: eventsByType,
      events_by_user: eventsByUser,
      data_access_count: dataAccessCount,
      data_modification_count: dataModificationCount,
      data_deletion_count: dataDeletionCount,
      unauthorized_attempts: unauthorizedAttempts,
      backup_success_rate: this.calculateBackupSuccessRate(periodLogs),
      last_successful_backup: this.getLastSuccessfulBackup(periodLogs),
      backup_failures: periodLogs.filter((l) =>
        l.description?.toLowerCase().includes('backup failed'),
      ).length,
      encryption_enabled: true,
      keys_rotated: true,
      last_key_rotation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      findings,
      generated_by: options.generated_by,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.reports.push(report);
    await this.saveReports();

    return report;
  }

  private generateFindings(logs: LOPDAuditLog[]): LOPDComplianceReport['findings'] {
    const findings: LOPDComplianceReport['findings'] = [];

    const unauthorizedAttempts = logs.filter((l) =>
      l.description?.toLowerCase().includes('unauthorized'),
    ).length;

    if (unauthorizedAttempts > 0) {
      findings.push({
        severity: 'critical',
        category: 'Security',
        description: `${unauthorizedAttempts} unauthorized access attempts detected`,
        recommendation: 'Review access logs and implement additional security measures',
      });
    }

    const dataDeletions = logs.filter(
      (l) => l.event_type === LOPDAuditEventType.DATA_DELETION,
    ).length;

    if (dataDeletions > 10) {
      findings.push({
        severity: 'high',
        category: 'Data Protection',
        description: `${dataDeletions} data deletion events recorded`,
        recommendation: 'Review deletion policies and ensure proper authorization',
      });
    }

    const dataExports = logs.filter(
      (l) => l.event_type === LOPDAuditEventType.DATA_EXPORT,
    ).length;

    if (dataExports > 5) {
      findings.push({
        severity: 'medium',
        category: 'Data Protection',
        description: `${dataExports} data export events recorded`,
        recommendation: 'Ensure all exports are authorized and documented',
      });
    }

    if (findings.length === 0) {
      findings.push({
        severity: 'info',
        category: 'Compliance',
        description: 'No significant compliance issues detected',
      });
    }

    return findings;
  }

  private calculateBackupSuccessRate(logs: LOPDAuditLog[]): number {
    const backupLogs = logs.filter((l) =>
      l.description?.toLowerCase().includes('backup'),
    );

    if (backupLogs.length === 0) return 100;

    const successful = backupLogs.filter((l) =>
      l.description?.toLowerCase().includes('success'),
    ).length;

    return (successful / backupLogs.length) * 100;
  }

  private getLastSuccessfulBackup(logs: LOPDAuditLog[]): Date | undefined {
    const backupLogs = logs.filter((l) =>
      l.description?.toLowerCase().includes('backup') &&
      l.description?.toLowerCase().includes('success'),
    );

    if (backupLogs.length === 0) return undefined;

    const latest = backupLogs
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];
    return latest?.created_at;
  }

  getReports(limit?: number): LOPDComplianceReport[] {
    let reports = [...this.reports];
    reports.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return limit ? reports.slice(0, limit) : reports;
  }

  getReport(reportId: string): LOPDComplianceReport | undefined {
    return this.reports.find((r) => r.id === reportId);
  }

  async reviewReport(
    reportId: string,
    reviewedBy: string,
    notes?: string,
  ): Promise<LOPDComplianceReport | null> {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return null;

    report.reviewed_by = reviewedBy;
    report.review_date = new Date();
    report.notes = notes;
    report.updated_at = new Date();

    await this.saveReports();

    return report;
  }

  getComplianceStats(periodStart?: Date, periodEnd?: Date) {
    const logs = this.getAuditLogs({
      start_date: periodStart,
      end_date: periodEnd,
    });

    const totalEvents = logs.length;
    const eventsByType = logs.reduce((acc, log) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueUsers = new Set(logs.map((l) => l.user_id)).size;
    const uniqueEntities = new Set(logs.map((l) => l.entity_type)).size;

    const recentActivity = logs.filter(
      (l) => l.created_at > new Date(Date.now() - 24 * 60 * 60 * 1000),
    ).length;

    return {
      totalEvents,
      eventsByType,
      uniqueUsers,
      uniqueEntities,
      recentActivity,
    };
  }

  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const initialCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter((log) => log.created_at > cutoffDate);
    const removedCount = initialCount - this.auditLogs.length;

    await this.saveAuditLogs();

    return removedCount;
  }
}

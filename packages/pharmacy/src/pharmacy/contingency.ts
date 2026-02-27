import { Invoice, InvoiceStatus } from '@red-salud/types';
import { ImmutableAuditLogManager } from './security';

/**
 * Contingency Types
 */
export enum ContingencyType {
  SYSTEM_FAILURE = 'system_failure',
  NETWORK_FAILURE = 'network_failure',
  FISCAL_DEVICE_FAILURE = 'fiscal_device_failure',
  POWER_OUTAGE = 'power_outage',
  MANUAL_INVOICE = 'manual_invoice',
}

/**
 * Contingency Status
 */
export enum ContingencyStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  SYNC_PENDING = 'sync_pending',
  SYNCED = 'synced',
}

/**
 * Contingency Session
 */
export interface ContingencySession {
  id: string;
  type: ContingencyType;
  status: ContingencyStatus;
  
  started_at: Date;
  ended_at?: Date;
  resolved_at?: Date;
  
  reason: string;
  reported_by: string;
  
  manual_invoice_start?: number;
  manual_invoice_end?: number;
  
  invoices_created: string[];
  sync_errors: string[];
  
  created_at: Date;
  updated_at: Date;
}

/**
 * Contingency Manager
 * Implements real contingency management per SENIAT requirements
 * Blocks digital emission when system detects irregularities
 */
export class ContingencyManager {
  private static activeSession: ContingencySession | null = null;
  private static sessions: ContingencySession[] = [];
  private static STORAGE_KEY = 'contingency_sessions';
  
  /**
   * Check if system is in contingency mode
   */
  static isInContingency(): boolean {
    return this.activeSession !== null && this.activeSession.status === ContingencyStatus.ACTIVE;
  }
  
  /**
   * Start a contingency session
   */
  static async startContingency(data: {
    type: ContingencyType;
    reason: string;
    reportedBy: string;
    manualInvoiceStart?: number;
  }): Promise<ContingencySession> {
    // Validate that this is a valid contingency scenario
    if (!this.isValidContingencyScenario(data.type, data.reason)) {
      throw new Error('Invalid contingency scenario. This action will be logged for SENIAT compliance.');
    }
    
    // If there's already an active session, don't allow another
    if (this.activeSession) {
      throw new Error('A contingency session is already active. Resolve the current session first.');
    }
    
    const session: ContingencySession = {
      id: crypto.randomUUID(),
      type: data.type,
      status: ContingencyStatus.ACTIVE,
      started_at: new Date(),
      reason: data.reason,
      reported_by: data.reportedBy,
      manual_invoice_start: data.manualInvoiceStart,
      invoices_created: [],
      sync_errors: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    this.activeSession = session;
    this.sessions.push(session);
    await this.persistSessions();
    
    // Log the contingency start for compliance
    await ImmutableAuditLogManager.logSecurityEvent({
      userId: data.reportedBy,
      eventType: 'suspicious_activity',
      details: {
        action: 'contingency_started',
        type: data.type,
        reason: data.reason,
      },
    });
    
    return session;
  }
  
  /**
   * End a contingency session
   */
  static async endContingency(sessionId: string, resolvedBy: string): Promise<ContingencySession> {
    const session = this.sessions.find(s => s.id === sessionId);
    
    if (!session) {
      throw new Error('Contingency session not found');
    }
    
    if (session.status !== ContingencyStatus.ACTIVE) {
      throw new Error('Session is not active');
    }
    
    session.ended_at = new Date();
    session.status = ContingencyStatus.SYNC_PENDING;
    session.updated_at = new Date();
    
    await this.persistSessions();
    
    // Log the contingency end for compliance
    await ImmutableAuditLogManager.logSecurityEvent({
      userId: resolvedBy,
      eventType: 'suspicious_activity',
      details: {
        action: 'contingency_ended',
        sessionId: sessionId,
        duration: session.ended_at.getTime() - session.started_at.getTime(),
      },
    });
    
    return session;
  }
  
  /**
   * Mark session as synced
   */
  static async markSessionSynced(sessionId: string, syncedBy: string): Promise<ContingencySession> {
    const session = this.sessions.find(s => s.id === sessionId);
    
    if (!session) {
      throw new Error('Contingency session not found');
    }
    
    session.status = ContingencyStatus.SYNCED;
    session.resolved_at = new Date();
    session.updated_at = new Date();
    
    await this.persistSessions();
    
    await ImmutableAuditLogManager.logFiscalEvent({
      userId: syncedBy,
      eventType: 'invoice_modified',
      entityType: 'contingency_session',
      entityId: sessionId,
      fiscalData: { action: 'synced' },
    });
    
    return session;
  }
  
  /**
   * Add invoice to contingency session
   */
  static async addInvoiceToContingency(invoice: Invoice): Promise<void> {
    if (!this.activeSession) {
      throw new Error('No active contingency session');
    }
    
    this.activeSession.invoices_created.push(invoice.id);
    this.activeSession.updated_at = new Date();
    
    await this.persistSessions();
    
    await ImmutableAuditLogManager.logFiscalEvent({
      userId: invoice.cashier_id,
      eventType: 'invoice_created',
      entityType: 'invoice',
      entityId: invoice.id,
      amount: { usd: invoice.total_usd, ves: invoice.total_ves },
      fiscalData: {
        contingency_session: this.activeSession.id,
        manual_invoice_number: invoice.invoice_number,
      },
    });
  }
  
  /**
   * Validate if this is a valid contingency scenario
   * Prevents abuse of contingency mode
   */
  private static isValidContingencyScenario(type: ContingencyType, reason: string): boolean {
    // Valid scenarios per SENIAT requirements
    const validScenarios = [
      'Fiscal printer not responding',
      'Network connection lost',
      'System crash',
      'Power outage',
      'Fiscal device malfunction',
      'Internet service provider down',
      'SENAT server unreachable',
    ];
    
    // For manual invoices, must have explicit authorization
    if (type === ContingencyType.MANUAL_INVOICE) {
      return reason.includes('authorized') || reason.includes('authorization');
    }
    
    // Check if reason matches valid scenarios
    return validScenarios.some(scenario => 
      reason.toLowerCase().includes(scenario.toLowerCase())
    );
  }
  
  /**
   * Block digital invoice emission if in contingency
   */
  static canEmitDigitalInvoice(): { allowed: boolean; reason?: string } {
    if (this.isInContingency()) {
      return {
        allowed: false,
        reason: `System is in contingency mode (${this.activeSession!.type}). Manual invoices required. Use of Excel or unauthorized software is prohibited by SENIAT.`,
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Get active session
   */
  static getActiveSession(): ContingencySession | null {
    return this.activeSession;
  }
  
  /**
   * Get all sessions
   */
  static getAllSessions(): ContingencySession[] {
    return [...this.sessions];
  }
  
  /**
   * Get pending sync sessions
   */
  static getPendingSyncSessions(): ContingencySession[] {
    return this.sessions.filter(s => s.status === ContingencyStatus.SYNC_PENDING);
  }
  
  /**
   * Get session statistics
   */
  static getStatistics(): {
    totalSessions: number;
    activeSessions: number;
    pendingSync: number;
    synced: number;
    averageDuration: number;
  } {
    const synced = this.sessions.filter(s => s.status === ContingencyStatus.SYNCED);
    const durations = synced
      .filter(s => s.started_at && s.ended_at)
      .map(s => s.ended_at!.getTime() - s.started_at.getTime());
    
    const averageDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    
    return {
      totalSessions: this.sessions.length,
      activeSessions: this.activeSession ? 1 : 0,
      pendingSync: this.getPendingSyncSessions().length,
      synced: synced.length,
      averageDuration,
    };
  }
  
  /**
   * Persist sessions to localStorage
   */
  private static async persistSessions(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error persisting contingency sessions:', error);
      throw new Error('Failed to persist contingency sessions - compliance violation');
    }
  }
  
  /**
   * Load sessions from localStorage
   */
  static async loadSessions(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.sessions = JSON.parse(stored).map((session: any) => ({
          ...session,
          started_at: new Date(session.started_at),
          ended_at: session.ended_at ? new Date(session.ended_at) : undefined,
          resolved_at: session.resolved_at ? new Date(session.resolved_at) : undefined,
          created_at: new Date(session.created_at),
          updated_at: new Date(session.updated_at),
        }));
        
        // Set active session if any
        this.activeSession = this.sessions.find(s => s.status === ContingencyStatus.ACTIVE) || null;
      }
    } catch (error) {
      console.error('Error loading contingency sessions:', error);
    }
  }
  
  /**
   * Generate contingency report for SENIAT
   */
  static generateReport(startDate: Date, endDate: Date): {
    sessions: ContingencySession[];
    summary: {
      totalSessions: number;
      byType: Record<string, number>;
      totalInvoices: number;
      totalDuration: number;
    };
  } {
    const sessionsInRange = this.sessions.filter(session => {
      const sessionDate = new Date(session.started_at);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
    
    const byType: Record<string, number> = {};
    let totalInvoices = 0;
    let totalDuration = 0;
    
    sessionsInRange.forEach(session => {
      byType[session.type] = (byType[session.type] || 0) + 1;
      totalInvoices += session.invoices_created.length;
      if (session.ended_at) {
        totalDuration += session.ended_at.getTime() - session.started_at.getTime();
      }
    });
    
    return {
      sessions: sessionsInRange,
      summary: {
        totalSessions: sessionsInRange.length,
        byType,
        totalInvoices,
        totalDuration,
      },
    };
  }
}

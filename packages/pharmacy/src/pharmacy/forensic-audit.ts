/**
 * Forensic Audit Entry
 * WORM (Write Once, Read Many) compliant audit trail per SENIAT Providencia 00121
 */
export interface ForensicAuditEntry {
  id: string;
  
  // User identification
  user_id: string;
  user_name: string;
  user_role: string;
  
  // Event details
  timestamp_milliseconds: number;
  ip_origin?: string;
  action_exact: string; // Exact action description
  
  // Entity affected
  entity_type: string;
  entity_id?: string;
  
  // Data changes
  old_value?: any;
  new_value?: any;
  field_name?: string;
  
  // Integrity
  integrity_hash: string;
  previous_entry_hash?: string;
  sequence_number: number;
  
  // Metadata
  created_at: Date;
}

/**
 * Forensic Audit Manager
 * Implements WORM audit trail with cryptographic integrity
 */
export class ForensicAuditManager {
  private static entries: ForensicAuditEntry[] = [];
  private static currentSequence = 0;
  private static STORAGE_KEY = 'forensic_audit_worm';

  /**
   * Generate SHA-256 hash for integrity verification
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
   * Create forensic audit entry
   */
  static async createEntry(data: {
    userId: string;
    userName: string;
    userRole: string;
    ipAddress?: string;
    actionExact: string;
    entityType: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    fieldName?: string;
  }): Promise<ForensicAuditEntry> {
    const previousEntry = this.entries[this.entries.length - 1];
    const previousHash = previousEntry ? previousEntry.integrity_hash : 'GENESIS';
    
    const sequenceNumber = this.currentSequence;
    this.currentSequence++;

    const timestamp = Date.now();
    
    // Create entry data for hashing
    const entryData = {
      id: crypto.randomUUID(),
      user_id: data.userId,
      user_name: data.userName,
      user_role: data.userRole,
      timestamp_milliseconds: timestamp,
      ip_origin: data.ipAddress,
      action_exact: data.actionExact,
      entity_type: data.entityType,
      entity_id: data.entityId,
      old_value: data.oldValue,
      new_value: data.newValue,
      field_name: data.fieldName,
      sequence_number: sequenceNumber,
      previous_hash: previousHash,
    };

    const integrityHash = await this.generateHash(entryData);

    const entry: ForensicAuditEntry = {
      ...entryData,
      integrity_hash: integrityHash,
      created_at: new Date(),
    };

    this.entries.push(entry);
    await this.persistEntries();

    return entry;
  }

  /**
   * Verify chain integrity
   * Ensures no entries have been tampered with
   */
  static async verifyChainIntegrity(): Promise<{
    isValid: boolean;
    brokenAt?: number;
    details?: string;
  }> {
    for (let i = 0; i < this.entries.length; i++) {
      const current = this.entries[i];
      const expectedPreviousHash = i === 0 ? 'GENESIS' : this.entries[i - 1].integrity_hash;

      if (current.previous_entry_hash !== expectedPreviousHash) {
        return {
          isValid: false,
          brokenAt: i,
          details: `Chain broken at sequence ${current.sequence_number}: expected previous hash ${expectedPreviousHash}, got ${current.previous_entry_hash}`,
        };
      }

      // Recalculate hash to verify data integrity
      const entryData = {
        id: current.id,
        user_id: current.user_id,
        user_name: current.user_name,
        user_role: current.user_role,
        timestamp_milliseconds: current.timestamp_milliseconds,
        ip_origin: current.ip_origin,
        action_exact: current.action_exact,
        entity_type: current.entity_type,
        entity_id: current.entity_id,
        old_value: current.old_value,
        new_value: current.new_value,
        field_name: current.field_name,
        sequence_number: current.sequence_number,
        previous_entry_hash: current.previous_entry_hash,
      };

      const recalculatedHash = await this.generateHash(entryData);

      if (current.integrity_hash !== recalculatedHash) {
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
   * Get entries by date range
   */
  static getEntriesByDateRange(startDate: Date, endDate: Date): ForensicAuditEntry[] {
    return this.entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Get entries by user
   */
  static getEntriesByUser(userId: string): ForensicAuditEntry[] {
    return this.entries
      .filter(entry => entry.user_id === userId)
      .sort((a, b) => b.timestamp_milliseconds - a.timestamp_milliseconds);
  }

  /**
   * Get entries by entity
   */
  static getEntriesByEntity(entityType: string, entityId?: string): ForensicAuditEntry[] {
    return this.entries
      .filter(entry => entry.entity_type === entityType && (!entityId || entry.entity_id === entityId))
      .sort((a, b) => b.timestamp_milliseconds - a.timestamp_milliseconds);
  }

  /**
   * Get all entries
   */
  static getAllEntries(): ForensicAuditEntry[] {
    return [...this.entries];
  }

  /**
   * Get chain statistics
   */
  static getChainStatistics(): {
    totalEntries: number;
    sequenceRange: { start: number; end: number };
    genesisHash: string;
    latestHash: string;
  } {
    return {
      totalEntries: this.entries.length,
      sequenceRange: {
        start: this.entries[0]?.sequence_number || 0,
        end: this.entries[this.entries.length - 1]?.sequence_number || 0,
      },
      genesisHash: this.entries[0]?.integrity_hash || 'N/A',
      latestHash: this.entries[this.entries.length - 1]?.integrity_hash || 'N/A',
    };
  }

  /**
   * Generate forensic report for SENIAT
   */
  static async generateForensicReport(startDate: Date, endDate: Date): Promise<{
    reportGenerated: Date;
    chainStatistics: any;
    integrityCheck: any;
    entriesInRange: ForensicAuditEntry[];
    summary: {
      totalEntries: number;
      actionsByType: Record<string, number>;
      usersActive: number;
      entitiesAffected: number;
    };
  }> {
    const entriesInRange = this.getEntriesByDateRange(startDate, endDate);
    
    const actionsByType: Record<string, number> = {};
    const uniqueUsers = new Set<string>();
    const uniqueEntities = new Set<string>();

    entriesInRange.forEach(entry => {
      actionsByType[entry.action_exact] = (actionsByType[entry.action_exact] || 0) + 1;
      uniqueUsers.add(entry.user_id);
      if (entry.entity_id) uniqueEntities.add(`${entry.entity_type}:${entry.entity_id}`);
    });

    const integrityCheck = await this.verifyChainIntegrity();

    return {
      reportGenerated: new Date(),
      chainStatistics: this.getChainStatistics(),
      integrityCheck,
      entriesInRange,
      summary: {
        totalEntries: entriesInRange.length,
        actionsByType,
        usersActive: uniqueUsers.size,
        entitiesAffected: uniqueEntities.size,
      },
    };
  }

  /**
   * Persist entries
   */
  private static async persistEntries(): Promise<void> {
    try {
      const entriesToStore = this.entries.slice(-10000); // Keep last 10,000 entries
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entriesToStore));
    } catch (error) {
      console.error('Error persisting forensic audit entries:', error);
      throw new Error('Failed to persist forensic audit - compliance violation');
    }
  }

  /**
   * Load entries
   */
  static async loadEntries(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.entries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          created_at: new Date(entry.created_at),
        }));

        // Update sequence counter
        if (this.entries.length > 0) {
          this.currentSequence = this.entries[this.entries.length - 1].sequence_number + 1;
        }
      }
    } catch (error) {
      console.error('Error loading forensic audit entries:', error);
    }
  }
}

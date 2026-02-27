import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes, scryptSync } from 'crypto';
import { AES } from 'crypto-js';
import { EncryptionKey, EncryptionAlgorithm } from '@red-salud/types';

export interface EncryptionOptions {
  algorithm?: EncryptionAlgorithm;
  keyId?: string;
  purpose?: EncryptionKey['purpose'];
}

export interface EncryptionResult {
  success: boolean;
  encryptedData?: string;
  error?: string;
}

export interface DecryptionResult {
  success: boolean;
  decryptedData?: string;
  error?: string;
}

export class EncryptionManager {
  private keys: Map<string, EncryptionKey> = new Map();
  private readonly DEFAULT_ALGORITHM = EncryptionAlgorithm.AES256;
  private readonly SALT_LENGTH = 32;
  private readonly KEY_LENGTH = 32; // 256 bits for AES-256

  constructor() {
    this.loadKeys();
  }

  async loadKeys(): Promise<void> {
    const stored = localStorage.getItem('encryption_keys');
    if (stored) {
      const keys = JSON.parse(stored) as EncryptionKey[];
      keys.forEach((key) => {
        this.keys.set(key.id, key);
      });
    }
  }

  async saveKeys(): Promise<void> {
    const keys = Array.from(this.keys.values());
    localStorage.setItem('encryption_keys', JSON.stringify(keys));
  }

  async createKey(
    keyName: string,
    purpose: EncryptionKey['purpose'],
    options?: Partial<EncryptionKey>,
  ): Promise<EncryptionKey> {
    const salt = randomBytes(this.SALT_LENGTH).toString('hex');
    const keyBytes = randomBytes(this.KEY_LENGTH);
    const keyHash = createHash('sha256').update(keyBytes).digest('hex');

    const newKey: EncryptionKey = {
      id: uuidv4(),
      key_name: keyName,
      algorithm: options?.algorithm || this.DEFAULT_ALGORITHM,
      key_hash: keyHash,
      salt,
      purpose,
      created_at: new Date(),
      expires_at: options?.expires_at,
      last_rotated_at: new Date(),
      rotation_frequency_days: options?.rotation_frequency_days || 90,
      is_active: true,
      created_by: options?.created_by || 'system',
    };

    this.keys.set(newKey.id, newKey);
    await this.saveKeys();

    return newKey;
  }

  async rotateKey(keyId: string): Promise<EncryptionKey | null> {
    const key = this.keys.get(keyId);
    if (!key) return null;

    const newSalt = randomBytes(this.SALT_LENGTH).toString('hex');
    const newKeyBytes = randomBytes(this.KEY_LENGTH);
    const newKeyHash = createHash('sha256').update(newKeyBytes).digest('hex');

    const rotatedKey: EncryptionKey = {
      ...key,
      key_hash: newKeyHash,
      salt: newSalt,
      last_rotated_at: new Date(),
      expires_at: new Date(Date.now() + key.rotation_frequency_days * 24 * 60 * 60 * 1000),
    };

    this.keys.set(keyId, rotatedKey);
    await this.saveKeys();

    return rotatedKey;
  }

  async deleteKey(keyId: string): Promise<boolean> {
    return this.keys.delete(keyId);
  }

  getKey(keyId: string): EncryptionKey | undefined {
    return this.keys.get(keyId);
  }

  getAllKeys(): EncryptionKey[] {
    return Array.from(this.keys.values());
  }

  getKeysByPurpose(purpose: EncryptionKey['purpose']): EncryptionKey[] {
    return Array.from(this.keys.values()).filter((key) => key.purpose === purpose);
  }

  getActiveKeys(): EncryptionKey[] {
    return Array.from(this.keys.values()).filter((key) => key.is_active);
  }

  getExpiredKeys(): EncryptionKey[] {
    const now = new Date();
    return Array.from(this.keys.values()).filter(
      (key) => key.expires_at && key.expires_at < now,
    );
  }

  async encrypt(data: string, options?: EncryptionOptions): Promise<EncryptionResult> {
    try {
      const keyId = options?.keyId || this.getDefaultKey(options?.purpose);
      const key = this.keys.get(keyId);

      if (!key) {
        return {
          success: false,
          error: 'Encryption key not found',
        };
      }

      if (!key.is_active) {
        return {
          success: false,
          error: 'Encryption key is not active',
        };
      }

      const algorithm = options?.algorithm || key.algorithm;

      if (algorithm === EncryptionAlgorithm.AES256) {
        const encrypted = AES.encrypt(data, key.key_hash).toString();
        return {
          success: true,
          encryptedData: encrypted,
        };
      } else {
        return {
          success: false,
          error: 'Algorithm not supported',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed',
      };
    }
  }

  async decrypt(encryptedData: string, keyId: string): Promise<DecryptionResult> {
    try {
      const key = this.keys.get(keyId);

      if (!key) {
        return {
          success: false,
          error: 'Encryption key not found',
        };
      }

      if (!key.is_active) {
        return {
          success: false,
          error: 'Encryption key is not active',
        };
      }

      if (key.expires_at && key.expires_at < new Date()) {
        return {
          success: false,
          error: 'Encryption key has expired',
        };
      }

      const decrypted = AES.decrypt(encryptedData, key.key_hash).toString();
      return {
        success: true,
        decryptedData: decrypted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed',
      };
    }
  }

  async hashPassword(password: string, salt?: string): Promise<string> {
    const saltValue = salt || randomBytes(this.SALT_LENGTH).toString('hex');
    const derivedKey = scryptSync(password, saltValue, 64).toString('hex');
    return `${saltValue}:${derivedKey}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    const derivedKey = await this.hashPassword(password, salt);
    return derivedKey === hash;
  }

  async encryptBackup(data: string, keyId?: string): Promise<EncryptionResult> {
    const purpose: EncryptionKey['purpose'] = 'backup';
    const keyIdToUse = keyId || this.getDefaultKey(purpose);

    return this.encrypt(data, { keyId: keyIdToUse, purpose });
  }

  async decryptBackup(encryptedData: string, keyId: string): Promise<DecryptionResult> {
    return this.decrypt(encryptedData, keyId);
  }

  async encryptDataAtRest(data: string, keyId?: string): Promise<EncryptionResult> {
    const purpose: EncryptionKey['purpose'] = 'data_at_rest';
    const keyIdToUse = keyId || this.getDefaultKey(purpose);

    return this.encrypt(data, { keyId: keyIdToUse, purpose });
  }

  async decryptDataAtRest(encryptedData: string, keyId: string): Promise<DecryptionResult> {
    return this.decrypt(encryptedData, keyId);
  }

  private getDefaultKey(purpose?: EncryptionKey['purpose']): string {
    const activeKeys = this.getActiveKeys();

    if (purpose) {
      const purposeKeys = activeKeys.filter((key) => key.purpose === purpose);
      if (purposeKeys.length > 0) {
        const firstPurposeKey = purposeKeys[0];
        if (firstPurposeKey) return firstPurposeKey.id;
      }
    }

    if (activeKeys.length > 0) {
      const firstActiveKey = activeKeys[0];
      if (firstActiveKey) return firstActiveKey.id;
    }

    throw new Error('No active encryption key found');
  }

  async checkKeyRotation(): Promise<EncryptionKey[]> {
    const now = new Date();
    const keysToRotate: EncryptionKey[] = [];

    for (const [keyId, key] of this.keys) {
      if (!key.is_active) continue;

      if (key.expires_at && key.expires_at < now) {
        keysToRotate.push(key);
      }
    }

    return keysToRotate;
  }

  async rotateExpiredKeys(): Promise<number> {
    const keysToRotate = await this.checkKeyRotation();

    for (const key of keysToRotate) {
      await this.rotateKey(key.id);
    }

    return keysToRotate.length;
  }

  getKeyStats() {
    const allKeys = Array.from(this.keys.values());
    const activeKeys = allKeys.filter((k) => k.is_active);
    const expiredKeys = this.getExpiredKeys();

    return {
      total: allKeys.length,
      active: activeKeys.length,
      expired: expiredKeys.length,
      byPurpose: {
        backup: activeKeys.filter((k) => k.purpose === 'backup').length,
        data_at_rest: activeKeys.filter((k) => k.purpose === 'data_at_rest').length,
        transmission: activeKeys.filter((k) => k.purpose === 'transmission').length,
      },
    };
  }

  async generateKeyReport(): Promise<{
    keys: EncryptionKey[];
    stats: ReturnType<EncryptionManager['getKeyStats']>;
    recommendations: string[];
  }> {
    const keys = Array.from(this.keys.values());
    const stats = this.getKeyStats();
    const recommendations: string[] = [];

    if (stats.expired > 0) {
      recommendations.push(`${stats.expired} keys need to be rotated immediately`);
    }

    if (stats.active === 0) {
      recommendations.push('No active encryption keys found. Create at least one key.');
    }

    const keysExpiringSoon = keys.filter(
      (k) => k.expires_at && k.expires_at < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    if (keysExpiringSoon.length > 0) {
      recommendations.push(
        `${keysExpiringSoon.length} keys will expire in the next 7 days`,
      );
    }

    return {
      keys,
      stats,
      recommendations,
    };
  }
}

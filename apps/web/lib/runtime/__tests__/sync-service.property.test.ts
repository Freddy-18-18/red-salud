/**
 * Property-Based Tests for Sync Service
 * 
 * These tests validate correctness properties that should hold true
 * across all valid executions of the sync service.
 * 
 * Testing Framework: fast-check (property-based testing)
 * Test Runner: Vitest
 * 
 * Feature: tauri-dashboard-medico
 * Validates: Requirements 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { SyncService } from '../sync-service';
import { RuntimeServiceImpl } from '../runtime-service';
import type { StorageService, NetworkService, PendingChange } from '../types';
import { SYNC_QUEUE, SYNC_METADATA } from '../storage-keys';

/**
 * Property 1: Offline Operations Queue Changes
 * 
 * For any CRUD operation (create, update, delete) performed while offline
 * on any entity (patient, appointment, consultation, message, settings),
 * the Change_Queue SHALL store the operation with all necessary data for
 * later synchronization.
 * 
 * **Validates: Requirements 2.2, 12.3, 13.3, 15.3, 16.3**
 */
describe('Property 1: Offline Operations Queue Changes', () => {
  let syncService: SyncService;
  let storageService: StorageService;
  let networkService: NetworkService;
  let runtimeService: RuntimeServiceImpl;

  beforeEach(() => {
    // Reset runtime service
    runtimeService = RuntimeServiceImpl.getInstance();
    runtimeService.resetServices();
    
    // Get services
    storageService = runtimeService.getStorageService();
    networkService = runtimeService.getNetworkService();
    
    // Create sync service
    syncService = new SyncService(storageService, networkService);
  });

  afterEach(async () => {
    // Stop sync service if it exists
    if (syncService) {
      syncService.stop();
    }
    
    // Clean up storage
    try {
      if (storageService) {
        await storageService.clear();
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * Test that any CRUD operation is queued correctly
   */
  it('should queue all CRUD operations with complete data', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary CRUD operations
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('create', 'update', 'delete'),
          entity: fc.constantFrom(
            'patient',
            'appointment',
            'consultation',
            'message',
            'settings'
          ),
          data: fc.record({
            id: fc.uuid(),
            name: fc.string(),
            value: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
            timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
          }),
          timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
          retries: fc.constant(0),
        }),
        async (operation: PendingChange) => {
          // Queue the operation
          await syncService.queueChange(operation);

          // Verify operation is in queue
          const queue = await syncService.getPendingChanges();
          
          // Should contain the operation
          expect(queue).toContainEqual(operation);
          
          // Should have all required fields
          const queuedOp = queue.find(op => op.id === operation.id);
          expect(queuedOp).toBeDefined();
          expect(queuedOp?.type).toBe(operation.type);
          expect(queuedOp?.entity).toBe(operation.entity);
          expect(queuedOp?.data).toEqual(operation.data);
          expect(queuedOp?.timestamp).toBe(operation.timestamp);
          expect(queuedOp?.retries).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that patient operations are queued correctly
   */
  it('should queue patient CRUD operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('create', 'update', 'delete'),
          entity: fc.constant('patient' as const),
          data: fc.record({
            id: fc.uuid(),
            firstName: fc.string({ minLength: 1 }),
            lastName: fc.string({ minLength: 1 }),
            dateOfBirth: fc.date({ max: new Date() }).map(d => d.toISOString()),
            gender: fc.constantFrom('male', 'female', 'other'),
            phone: fc.string({ minLength: 10, maxLength: 15 }),
          }),
          timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
          retries: fc.constant(0),
        }),
        async (operation: PendingChange) => {
          await syncService.queueChange(operation);

          const queue = await syncService.getPendingChanges();
          const queuedOp = queue.find(op => op.id === operation.id);

          expect(queuedOp).toBeDefined();
          expect(queuedOp?.entity).toBe('patient');
          expect(queuedOp?.data.firstName).toBe(operation.data.firstName);
          expect(queuedOp?.data.lastName).toBe(operation.data.lastName);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that appointment operations are queued correctly
   */
  it('should queue appointment CRUD operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('create', 'update', 'delete'),
          entity: fc.constant('appointment' as const),
          data: fc.record({
            id: fc.uuid(),
            patientId: fc.uuid(),
            doctorId: fc.uuid(),
            date: fc.date({ min: new Date() }).map(d => d.toISOString()),
            duration: fc.integer({ min: 15, max: 120 }),
            type: fc.constantFrom('consultation', 'follow-up', 'emergency'),
            status: fc.constantFrom('scheduled', 'completed', 'cancelled', 'no-show'),
          }),
          timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
          retries: fc.constant(0),
        }),
        async (operation: PendingChange) => {
          await syncService.queueChange(operation);

          const queue = await syncService.getPendingChanges();
          const queuedOp = queue.find(op => op.id === operation.id);

          expect(queuedOp).toBeDefined();
          expect(queuedOp?.entity).toBe('appointment');
          expect(queuedOp?.data.patientId).toBe(operation.data.patientId);
          expect(queuedOp?.data.type).toBe(operation.data.type);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that consultation operations are queued correctly
   */
  it('should queue consultation CRUD operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('create', 'update', 'delete'),
          entity: fc.constant('consultation' as const),
          data: fc.record({
            id: fc.uuid(),
            patientId: fc.uuid(),
            doctorId: fc.uuid(),
            date: fc.date().map(d => d.toISOString()),
            chiefComplaint: fc.string({ minLength: 1 }),
            symptoms: fc.array(fc.string(), { minLength: 1 }),
            diagnoses: fc.array(
              fc.record({
                id: fc.uuid(),
                icd11Code: fc.string(),
                description: fc.string(),
                type: fc.constantFrom('primary', 'secondary'),
              }),
              { minLength: 1 }
            ),
          }),
          timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
          retries: fc.constant(0),
        }),
        async (operation: PendingChange) => {
          await syncService.queueChange(operation);

          const queue = await syncService.getPendingChanges();
          const queuedOp = queue.find(op => op.id === operation.id);

          expect(queuedOp).toBeDefined();
          expect(queuedOp?.entity).toBe('consultation');
          expect(queuedOp?.data.chiefComplaint).toBe(operation.data.chiefComplaint);
          expect(queuedOp?.data.diagnoses).toEqual(operation.data.diagnoses);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that message operations are queued correctly
   */
  it('should queue message CRUD operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('create', 'update', 'delete'),
          entity: fc.constant('message' as const),
          data: fc.record({
            id: fc.uuid(),
            conversationId: fc.uuid(),
            senderId: fc.uuid(),
            recipientId: fc.uuid(),
            content: fc.string({ minLength: 1 }),
            sentAt: fc.date().map(d => d.toISOString()),
          }),
          timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
          retries: fc.constant(0),
        }),
        async (operation: PendingChange) => {
          await syncService.queueChange(operation);

          const queue = await syncService.getPendingChanges();
          const queuedOp = queue.find(op => op.id === operation.id);

          expect(queuedOp).toBeDefined();
          expect(queuedOp?.entity).toBe('message');
          expect(queuedOp?.data.content).toBe(operation.data.content);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that settings operations are queued correctly
   */
  it('should queue settings CRUD operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('create', 'update', 'delete'),
          entity: fc.constant('settings' as const),
          data: fc.record({
            id: fc.uuid(),
            userId: fc.uuid(),
            credentials: fc.string(),
            specialties: fc.array(fc.string(), { minLength: 1 }),
            licenseNumber: fc.string(),
          }),
          timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
          retries: fc.constant(0),
        }),
        async (operation: PendingChange) => {
          await syncService.queueChange(operation);

          const queue = await syncService.getPendingChanges();
          const queuedOp = queue.find(op => op.id === operation.id);

          expect(queuedOp).toBeDefined();
          expect(queuedOp?.entity).toBe('settings');
          expect(queuedOp?.data.credentials).toBe(operation.data.credentials);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that multiple operations are queued in order (FIFO)
   */
  it('should maintain FIFO order for multiple operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom('create', 'update', 'delete'),
            entity: fc.constantFrom(
              'patient',
              'appointment',
              'consultation',
              'message',
              'settings'
            ),
            data: fc.record({
              id: fc.uuid(),
              value: fc.string(),
            }),
            timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
            retries: fc.constant(0),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (operations: PendingChange[]) => {
          // Clear queue first
          await storageService.save(SYNC_QUEUE, []);

          // Queue all operations
          for (const operation of operations) {
            await syncService.queueChange(operation);
          }

          // Get queue
          const queue = await syncService.getPendingChanges();

          // Should have all operations
          expect(queue.length).toBe(operations.length);

          // Should maintain order (FIFO)
          for (let i = 0; i < operations.length; i++) {
            expect(queue[i].id).toBe(operations[i].id);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that queue updates metadata correctly
   */
  it('should update sync metadata when queueing changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom('create', 'update', 'delete'),
            entity: fc.constantFrom(
              'patient',
              'appointment',
              'consultation',
              'message',
              'settings'
            ),
            data: fc.record({
              id: fc.uuid(),
              value: fc.string(),
            }),
            timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
            retries: fc.constant(0),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (operations: PendingChange[]) => {
          // Clear queue first
          await storageService.save(SYNC_QUEUE, []);

          // Queue all operations
          for (const operation of operations) {
            await syncService.queueChange(operation);
          }

          // Get metadata
          const metadata = await syncService.getSyncMetadata();

          // Should reflect correct pending count
          expect(metadata.pendingChanges).toBe(operations.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that queue handles duplicate IDs correctly
   */
  it('should handle operations with duplicate IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom('create', 'update', 'delete'),
          entity: fc.constantFrom(
            'patient',
            'appointment',
            'consultation',
            'message',
            'settings'
          ),
          data: fc.record({
            id: fc.uuid(),
            value: fc.string(),
          }),
          timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
          retries: fc.constant(0),
        }),
        fc.integer({ min: 2, max: 5 }),
        async (operation: PendingChange, count: number) => {
          // Clear queue first
          await storageService.save(SYNC_QUEUE, []);

          // Queue same operation multiple times
          for (let i = 0; i < count; i++) {
            await syncService.queueChange(operation);
          }

          // Get queue
          const queue = await syncService.getPendingChanges();

          // Should have all instances (duplicates allowed for idempotency)
          expect(queue.length).toBe(count);
          
          // All should have same ID
          queue.forEach(op => {
            expect(op.id).toBe(operation.id);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that empty queue returns empty array
   */
  it('should return empty array for empty queue', async () => {
    // Clear queue
    await storageService.save(SYNC_QUEUE, []);

    const queue = await syncService.getPendingChanges();
    expect(queue).toEqual([]);
  });

  /**
   * Test that queue persists across service instances
   */
  it('should persist queue across service instances', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom('create', 'update', 'delete'),
            entity: fc.constantFrom(
              'patient',
              'appointment',
              'consultation',
              'message',
              'settings'
            ),
            data: fc.record({
              id: fc.uuid(),
              value: fc.string(),
            }),
            timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
            retries: fc.constant(0),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (operations: PendingChange[]) => {
          // Clear queue first
          await storageService.save(SYNC_QUEUE, []);

          // Queue operations with first service instance
          const service1 = new SyncService(storageService, networkService);
          for (const operation of operations) {
            await service1.queueChange(operation);
          }

          // Create new service instance
          const service2 = new SyncService(storageService, networkService);
          const queue = await service2.getPendingChanges();

          // Should have all operations
          expect(queue.length).toBe(operations.length);
          
          // Should match original operations
          for (let i = 0; i < operations.length; i++) {
            expect(queue[i].id).toBe(operations[i].id);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});


/**
 * Property 7: Sync Store Update
 * 
 * For any successful synchronization operation, the Offline_Store SHALL be
 * updated with all fresh data received from the server.
 * 
 * **Validates: Requirements 3.3**
 */
describe('Property 7: Sync Store Update', () => {
  let syncService: SyncService;
  let storageService: StorageService;
  let networkService: NetworkService;
  let runtimeService: RuntimeServiceImpl;

  beforeEach(() => {
    // Reset runtime service
    runtimeService = RuntimeServiceImpl.getInstance();
    runtimeService.resetServices();
    
    // Get services
    storageService = runtimeService.getStorageService();
    networkService = runtimeService.getNetworkService();
    
    // Mock network service to simulate server responses
    vi.spyOn(networkService, 'checkConnectivity').mockResolvedValue(true);
    
    // Create sync service
    syncService = new SyncService(storageService, networkService);
  });

  afterEach(async () => {
    // Stop sync service if it exists
    if (syncService) {
      syncService.stop();
    }
    
    // Clean up storage
    try {
      if (storageService) {
        await storageService.clear();
      }
    } catch (error) {
      // Ignore cleanup errors
    }
    
    // Restore mocks
    vi.restoreAllMocks();
  });

  /**
   * Test that sync updates storage with fresh patient data
   */
  it('should update storage with fresh patient data after sync', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            firstName: fc.string({ minLength: 1 }),
            lastName: fc.string({ minLength: 1 }),
            dateOfBirth: fc.date({ max: new Date() }).map(d => d.toISOString()),
            gender: fc.constantFrom('male', 'female', 'other'),
            phone: fc.string({ minLength: 10, maxLength: 15 }),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (patients) => {
          // Mock network to return fresh patient data
          vi.spyOn(networkService, 'get').mockImplementation(async (url: string) => {
            if (url.includes('/api/patients')) {
              return patients;
            }
            return [];
          });

          // Mock network post/patch/delete to succeed
          vi.spyOn(networkService, 'post').mockResolvedValue({});
          vi.spyOn(networkService, 'patch').mockResolvedValue({});
          vi.spyOn(networkService, 'delete').mockResolvedValue({});

          // Perform sync
          const result = await syncService.syncNow();

          // Verify sync was successful
          expect(result.success).toBe(true);
          expect(result.downloaded).toBeGreaterThan(0);

          // Verify storage was updated with fresh data
          const storedPatients = await storageService.get('patients:all');
          expect(storedPatients).toEqual(patients);

          // Verify individual patients are stored
          for (const patient of patients) {
            const storedPatient = await storageService.get(`patients:${patient.id}`);
            expect(storedPatient).toEqual(patient);
          }
        }
      ),
      { numRuns: 50 } // Fewer runs since this involves mocking
    );
  });

  /**
   * Test that sync updates storage with fresh appointment data
   */
  it('should update storage with fresh appointment data after sync', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            patientId: fc.uuid(),
            doctorId: fc.uuid(),
            date: fc.date({ min: new Date() }).map(d => d.toISOString()),
            duration: fc.integer({ min: 15, max: 120 }),
            type: fc.constantFrom('consultation', 'follow-up', 'emergency'),
            status: fc.constantFrom('scheduled', 'completed', 'cancelled', 'no-show'),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (appointments) => {
          // Mock network to return fresh appointment data
          vi.spyOn(networkService, 'get').mockImplementation(async (url: string) => {
            if (url.includes('/api/appointments')) {
              return appointments;
            }
            return [];
          });

          // Mock network post/patch/delete to succeed
          vi.spyOn(networkService, 'post').mockResolvedValue({});
          vi.spyOn(networkService, 'patch').mockResolvedValue({});
          vi.spyOn(networkService, 'delete').mockResolvedValue({});

          // Perform sync
          const result = await syncService.syncNow();

          // Verify sync was successful
          expect(result.success).toBe(true);

          // Verify storage was updated with fresh data
          const storedAppointments = await storageService.get('appointments:all');
          expect(storedAppointments).toEqual(appointments);

          // Verify individual appointments are stored
          for (const appointment of appointments) {
            const storedAppointment = await storageService.get(`appointments:${appointment.id}`);
            expect(storedAppointment).toEqual(appointment);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that sync updates storage with fresh consultation data
   */
  it('should update storage with fresh consultation data after sync', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            patientId: fc.uuid(),
            doctorId: fc.uuid(),
            date: fc.date().map(d => d.toISOString()),
            chiefComplaint: fc.string({ minLength: 1 }),
            symptoms: fc.array(fc.string(), { minLength: 1 }),
            diagnoses: fc.array(
              fc.record({
                id: fc.uuid(),
                icd11Code: fc.string(),
                description: fc.string(),
                type: fc.constantFrom('primary', 'secondary'),
              }),
              { minLength: 1 }
            ),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (consultations) => {
          // Mock network to return fresh consultation data
          vi.spyOn(networkService, 'get').mockImplementation(async (url: string) => {
            if (url.includes('/api/consultations')) {
              return consultations;
            }
            return [];
          });

          // Mock network post/patch/delete to succeed
          vi.spyOn(networkService, 'post').mockResolvedValue({});
          vi.spyOn(networkService, 'patch').mockResolvedValue({});
          vi.spyOn(networkService, 'delete').mockResolvedValue({});

          // Perform sync
          const result = await syncService.syncNow();

          // Verify sync was successful
          expect(result.success).toBe(true);

          // Verify storage was updated with fresh data
          const storedConsultations = await storageService.get('consultations:all');
          expect(storedConsultations).toEqual(consultations);

          // Verify individual consultations are stored
          for (const consultation of consultations) {
            const storedConsultation = await storageService.get(`consultations:${consultation.id}`);
            expect(storedConsultation).toEqual(consultation);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that sync updates storage with fresh message data
   */
  it('should update storage with fresh message data after sync', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            conversationId: fc.uuid(),
            senderId: fc.uuid(),
            recipientId: fc.uuid(),
            content: fc.string({ minLength: 1 }),
            sentAt: fc.date().map(d => d.toISOString()),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (messages) => {
          // Mock network to return fresh message data
          vi.spyOn(networkService, 'get').mockImplementation(async (url: string) => {
            if (url.includes('/api/messages')) {
              return messages;
            }
            return [];
          });

          // Mock network post/patch/delete to succeed
          vi.spyOn(networkService, 'post').mockResolvedValue({});
          vi.spyOn(networkService, 'patch').mockResolvedValue({});
          vi.spyOn(networkService, 'delete').mockResolvedValue({});

          // Perform sync
          const result = await syncService.syncNow();

          // Verify sync was successful
          expect(result.success).toBe(true);

          // Verify storage was updated with fresh data
          const storedMessages = await storageService.get('messages:all');
          expect(storedMessages).toEqual(messages);

          // Verify individual messages are stored
          for (const message of messages) {
            const storedMessage = await storageService.get(`messages:${message.id}`);
            expect(storedMessage).toEqual(message);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that sync updates storage with fresh settings data
   */
  it('should update storage with fresh settings data after sync', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            userId: fc.uuid(),
            credentials: fc.string(),
            specialties: fc.array(fc.string(), { minLength: 1 }),
            licenseNumber: fc.string(),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (settings) => {
          // Mock network to return fresh settings data
          vi.spyOn(networkService, 'get').mockImplementation(async (url: string) => {
            if (url.includes('/api/settings')) {
              return settings;
            }
            return [];
          });

          // Mock network post/patch/delete to succeed
          vi.spyOn(networkService, 'post').mockResolvedValue({});
          vi.spyOn(networkService, 'patch').mockResolvedValue({});
          vi.spyOn(networkService, 'delete').mockResolvedValue({});

          // Perform sync
          const result = await syncService.syncNow();

          // Verify sync was successful
          expect(result.success).toBe(true);

          // Verify storage was updated with fresh data
          const storedSettings = await storageService.get('settings:all');
          expect(storedSettings).toEqual(settings);

          // Verify individual settings are stored
          for (const setting of settings) {
            const storedSetting = await storageService.get(`settings:${setting.id}`);
            expect(storedSetting).toEqual(setting);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that sync updates metadata after successful sync
   */
  it('should update sync metadata after successful sync', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string(),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (data) => {
          // Mock network to return data
          vi.spyOn(networkService, 'get').mockResolvedValue(data);
          vi.spyOn(networkService, 'post').mockResolvedValue({});
          vi.spyOn(networkService, 'patch').mockResolvedValue({});
          vi.spyOn(networkService, 'delete').mockResolvedValue({});

          // Get metadata before sync
          const metadataBefore = await syncService.getSyncMetadata();
          const lastSyncBefore = metadataBefore.lastSyncTime;

          // Wait a bit to ensure timestamp difference
          await new Promise(resolve => setTimeout(resolve, 10));

          // Perform sync
          await syncService.syncNow();

          // Get metadata after sync
          const metadataAfter = await syncService.getSyncMetadata();

          // Verify metadata was updated
          expect(metadataAfter.lastSyncTime).not.toBeNull();
          expect(metadataAfter.lastSuccessfulSync).not.toBeNull();
          
          // Last sync time should be after previous sync time
          if (lastSyncBefore) {
            expect(new Date(metadataAfter.lastSyncTime!).getTime()).toBeGreaterThan(
              new Date(lastSyncBefore).getTime()
            );
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that sync handles empty server response correctly
   */
  it('should handle empty server response without errors', async () => {
    // Mock network to return empty arrays
    vi.spyOn(networkService, 'get').mockResolvedValue([]);
    vi.spyOn(networkService, 'post').mockResolvedValue({});
    vi.spyOn(networkService, 'patch').mockResolvedValue({});
    vi.spyOn(networkService, 'delete').mockResolvedValue({});

    // Perform sync
    const result = await syncService.syncNow();

    // Verify sync was successful even with no data
    expect(result.success).toBe(true);
    expect(result.downloaded).toBe(0);
    expect(result.errors).toEqual([]);
  });

  /**
   * Test that sync preserves existing data when no updates available
   */
  it('should preserve existing data when no updates available', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string(),
            value: fc.string(),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (existingData) => {
          // Save existing data to storage
          await storageService.save('patients:all', existingData);

          // Mock network to return empty (no updates)
          vi.spyOn(networkService, 'get').mockResolvedValue([]);
          vi.spyOn(networkService, 'post').mockResolvedValue({});
          vi.spyOn(networkService, 'patch').mockResolvedValue({});
          vi.spyOn(networkService, 'delete').mockResolvedValue({});

          // Perform sync
          await syncService.syncNow();

          // Verify existing data is still there
          const storedData = await storageService.get('patients:all');
          expect(storedData).toEqual(existingData);
        }
      ),
      { numRuns: 50 }
    );
  });
});

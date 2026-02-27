# Runtime Detection and Service Abstraction Layer

This module provides a unified interface for accessing platform-specific services that work seamlessly in both Tauri (desktop) and web environments.

## Architecture

The runtime layer follows the **Strategy Pattern** to provide different implementations based on the detected environment:

```
┌─────────────────────────────────────┐
│      Application Code               │
│  (Uses unified interfaces)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      RuntimeService                 │
│  (Detects environment & provides    │
│   appropriate service instances)    │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐   ┌─────▼──────┐
│   Tauri    │   │    Web     │
│ Services   │   │  Services  │
└────────────┘   └────────────┘
```

## Core Components

### RuntimeService (Singleton)

The main entry point for accessing all services. Automatically detects the environment and provides the correct implementations.

```typescript
import { RuntimeService } from '@/lib/runtime';

// Environment detection
const isTauri = RuntimeService.isTauri();
const isWeb = RuntimeService.isWeb();
const env = RuntimeService.getEnvironment(); // 'tauri' | 'web'

// Get service instances
const storage = RuntimeService.getStorageService();
const network = RuntimeService.getNetworkService();
const pdf = RuntimeService.getPDFService();
const notifications = RuntimeService.getNotificationService();
```

### Service Interfaces

All services implement consistent interfaces regardless of the underlying platform:

#### StorageService

Persistent offline data storage:

```typescript
interface StorageService {
  get<T>(key: string): Promise<T | null>;
  save<T>(key: string, data: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}
```

**Implementations:**
- `TauriStorageService`: Uses Rust commands for encrypted file-based storage
- `WebStorageService`: Uses IndexedDB for browser storage

#### NetworkService

HTTP requests with offline support:

```typescript
interface NetworkService {
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  post<T>(url: string, body: any, options?: RequestOptions): Promise<T>;
  patch<T>(url: string, body: any, options?: RequestOptions): Promise<T>;
  delete<T>(url: string, options?: RequestOptions): Promise<T>;
  checkConnectivity(): Promise<boolean>;
}
```

**Implementations:**
- `TauriNetworkService`: Uses Rust commands with built-in caching
- `WebNetworkService`: Uses standard fetch API

#### PDFService

Offline PDF generation:

```typescript
interface PDFService {
  generatePrescription(data: PrescriptionData): Promise<PDFResult>;
  generateMedicalHistory(data: MedicalHistoryData): Promise<PDFResult>;
}
```

**Implementations:**
- `TauriPDFService`: Generates PDFs and saves using native file system
- `WebPDFService`: Generates PDFs and triggers browser download

#### NotificationService

Native system notifications:

```typescript
interface NotificationService {
  show(notification: NotificationData): Promise<void>;
  schedule(notification: NotificationData, delay: number): Promise<string>;
  cancel(notificationId: string): Promise<void>;
  requestPermission(): Promise<boolean>;
}
```

**Implementations:**
- `TauriNotificationService`: Uses Tauri notification plugin
- `WebNotificationService`: Uses Web Notifications API

## Usage Examples

### Basic Storage Operations

```typescript
import { RuntimeService } from '@/lib/runtime';

const storage = RuntimeService.getStorageService();

// Save data
await storage.save('patients:123', patientData);

// Retrieve data
const patient = await storage.get<Patient>('patients:123');

// Delete data
await storage.delete('patients:123');

// Get all keys
const keys = await storage.keys();

// Clear all data
await storage.clear();
```

### Network Requests

```typescript
import { RuntimeService } from '@/lib/runtime';

const network = RuntimeService.getNetworkService();

// GET request
const patients = await network.get<Patient[]>('/rest/v1/patients', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// POST request
const newPatient = await network.post('/rest/v1/patients', patientData, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Check connectivity
const isOnline = await network.checkConnectivity();
```

### PDF Generation

```typescript
import { RuntimeService } from '@/lib/runtime';

const pdf = RuntimeService.getPDFService();

// Generate prescription PDF
const result = await pdf.generatePrescription({
  patient: patientInfo,
  doctor: doctorInfo,
  medications: [
    {
      id: '1',
      name: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'Every 8 hours',
      duration: '7 days',
      instructions: 'Take with food',
    },
  ],
  date: new Date(),
});

if (result.success) {
  console.log('PDF saved to:', result.filePath);
}
```

### Notifications

```typescript
import { RuntimeService } from '@/lib/runtime';

const notifications = RuntimeService.getNotificationService();

// Request permission first
const granted = await notifications.requestPermission();

if (granted) {
  // Show immediate notification
  await notifications.show({
    title: 'New Appointment',
    body: 'You have an appointment at 3:00 PM',
    action: {
      type: 'navigate',
      target: '/appointments/123',
    },
  });

  // Schedule notification for later
  const notificationId = await notifications.schedule(
    {
      title: 'Appointment Reminder',
      body: 'Your appointment starts in 15 minutes',
    },
    15 * 60 * 1000 // 15 minutes
  );

  // Cancel scheduled notification
  await notifications.cancel(notificationId);
}
```

## Data Organization

The storage service uses a key-based organization system:

- `patients:{id}` - Individual patient data
- `appointments:{date}` - Appointments by date
- `consultations:{patientId}` - Consultations by patient
- `messages:{conversationId}` - Messages by conversation
- `sync:queue` - Pending changes queue
- `sync:metadata` - Synchronization metadata

## Environment Detection

The runtime environment is detected once during initialization:

```typescript
// In browser
typeof window !== 'undefined' && '__TAURI__' in window
// → false (web environment)

// In Tauri app
typeof window !== 'undefined' && '__TAURI__' in window
// → true (tauri environment)
```

## Lazy Loading

Service implementations are lazy-loaded to optimize bundle size:

- Services are only loaded when first requested
- Unused services don't add to the bundle
- Each environment only loads its specific implementations

## Testing

The RuntimeService provides a `resetServices()` method for testing:

```typescript
import { RuntimeService } from '@/lib/runtime';

beforeEach(() => {
  RuntimeService.resetServices();
});
```

## Implementation Status

- ✅ **Task 1**: Runtime detection and service abstraction layer (COMPLETE)
- ⏳ **Task 2**: Storage service implementations (PENDING)
- ⏳ **Task 3**: Network service implementations (PENDING)
- ⏳ **Task 11**: PDF service implementations (PENDING)
- ⏳ **Task 12**: Notification service implementations (PENDING)

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 9.1**: Runtime environment detection at initialization
- **Requirement 9.2**: Use Rust commands when running in Tauri
- **Requirement 9.3**: Fall back to browser APIs when running in web
- **Requirement 9.4**: Abstract environment-specific logic behind unified interfaces
- **Requirement 9.5**: Share UI components and business logic between environments

## Next Steps

1. **Task 2**: Implement full storage service with encryption
2. **Task 3**: Implement network service with retry logic and error handling
3. **Task 4**: Implement connectivity monitor
4. **Task 5**: Implement sync service
5. **Task 11**: Implement PDF generation services
6. **Task 12**: Implement notification services

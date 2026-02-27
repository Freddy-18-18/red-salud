# Runtime Service Tests

This directory contains tests for the Runtime Service abstraction layer, including both unit tests and property-based tests.

## Test Types

### Property-Based Tests
Property-based tests verify universal properties that should hold true across all valid inputs. These tests use `fast-check` to generate hundreds of random test cases.

**Files:**
- `storage-service.property.test.ts` - Tests for storage service correctness properties

### Unit Tests
Unit tests verify specific examples, edge cases, and error conditions.

**Files:**
- `storage-service.test.ts` - Unit tests for storage service edge cases (Task 2.3)

## Running Tests

### Prerequisites
Install testing dependencies:
```bash
npm install --save-dev vitest fast-check @vitest/ui fake-indexeddb
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm test -- --ui
```

### Run Property Tests Only
```bash
npm test -- storage-service.property.test.ts
```

### Run Unit Tests Only
```bash
npm test -- storage-service.test.ts
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## Test Configuration

Tests are configured in `vitest.config.ts` at the project root.

Key settings:
- **Environment**: jsdom (for browser APIs like IndexedDB)
- **Timeout**: 30 seconds (for property tests with many iterations)
- **Coverage**: v8 provider with text, JSON, and HTML reports

## Property Test Guidelines

When writing property tests:

1. **Use descriptive test names** that explain what property is being tested
2. **Tag tests with feature and property number** (e.g., "Feature: tauri-dashboard-medico, Property 3")
3. **Run at least 100 iterations** for each property test
4. **Use smart generators** that constrain to valid input space
5. **Test round-trip consistency** (save → retrieve → verify)
6. **Test invariants** (properties that should always hold)

## Mocking Tauri APIs

For tests that need to mock Tauri commands:

```typescript
import { vi } from 'vitest';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((command, args) => {
    // Mock implementation
    if (command === 'get_offline_data') {
      return Promise.resolve(null);
    }
    // ... other commands
  }),
}));
```

## Testing Both Runtimes

To test both Tauri and Web implementations:

```typescript
describe.each([
  { name: 'Tauri', service: new TauriStorageService() },
  { name: 'Web', service: new WebStorageService() },
])('$name Storage Service', ({ service }) => {
  it('should work correctly', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### IndexedDB Errors
If you see IndexedDB errors in tests, make sure `fake-indexeddb` is installed:
```bash
npm install --save-dev fake-indexeddb
```

Then import it in `vitest.setup.ts`:
```typescript
import 'fake-indexeddb/auto';
```

### Tauri Command Errors
If Tauri commands fail in tests, ensure the Tauri API is properly mocked in `vitest.setup.ts`.

### Timeout Errors
If property tests timeout, increase the timeout in `vitest.config.ts`:
```typescript
testTimeout: 60000, // 60 seconds
```

Or reduce the number of iterations in the test:
```typescript
{ numRuns: 50 } // Instead of 100
```

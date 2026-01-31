# Testing Setup for Tauri Dashboard Médico

This document explains the testing infrastructure for the Tauri Dashboard Médico project.

## Overview

The project uses a dual testing approach:
- **Property-Based Tests**: Using `fast-check` to verify universal correctness properties
- **Unit Tests**: Using `vitest` to verify specific examples and edge cases

## Installation

To install the testing dependencies, run:

```bash
npm install
```

This will install:
- `vitest` - Fast unit test framework
- `fast-check` - Property-based testing library
- `@vitest/ui` - Visual test UI
- `fake-indexeddb` - IndexedDB mock for testing

## Running Tests

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
npm run test:ui
```

### Run Property Tests Only
```bash
npm run test:property
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
lib/runtime/__tests__/
├── README.md                           # Testing documentation
├── storage-service.property.test.ts    # Property-based tests (Task 2.2)
└── storage-service.test.ts             # Unit tests (Task 2.3)
```

## Configuration Files

- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Test environment setup
- `package.json` - Test scripts and dependencies

## Current Test Status

### Task 2.2: Property Tests ✅
- **File**: `lib/runtime/__tests__/storage-service.property.test.ts`
- **Property**: Property 3 - Dual State Update on Successful Fetch
- **Validates**: Requirements 2.4, 7.5
- **Tests**:
  - Data integrity for any valid data structure (100 iterations)
  - Patient data storage and retrieval (100 iterations)
  - Appointment data storage and retrieval (100 iterations)
  - Consultation data storage and retrieval (100 iterations)
  - Multiple saves with last-write-wins (100 iterations)
  - Delete operation removes data (100 iterations)
  - Keys() returns all stored keys (50 iterations)
  - Clear() removes all data (50 iterations)
  - Null/undefined handling
  - Special characters in keys (100 iterations)

### Task 2.3: Unit Tests (To be implemented)
- **File**: `lib/runtime/__tests__/storage-service.test.ts`
- **Tests**:
  - Empty data handling
  - Storage quota exceeded
  - Corrupted data recovery

## Property-Based Testing

Property-based tests verify that certain properties hold true for all valid inputs. Instead of writing specific test cases, we define properties and let `fast-check` generate hundreds of random test cases.

### Example Property

**Property 3: Dual State Update on Successful Fetch**

*For any successful data fetch operation, both the React state AND the Offline_Store SHALL be updated with the fresh data.*

This is tested by:
1. Generating random data structures
2. Saving them to storage
3. Retrieving them from storage
4. Verifying the retrieved data matches the saved data (round-trip consistency)
5. Running this test 100 times with different random data

## Mocking Tauri APIs

The tests mock Tauri APIs to work in the test environment:

```typescript
// In vitest.setup.ts
(window as any).__TAURI__ = {
  invoke: vi.fn(),
};
```

For specific tests, you can mock Tauri commands:

```typescript
import { vi } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((command, args) => {
    if (command === 'get_offline_data') {
      return Promise.resolve(null);
    }
    // ... other commands
  }),
}));
```

## Troubleshooting

### Tests fail with "Cannot find module 'vitest'"
Run `npm install` to install dependencies.

### IndexedDB errors
Make sure `fake-indexeddb` is installed and imported in `vitest.setup.ts`.

### Tauri command errors
Ensure Tauri APIs are properly mocked in `vitest.setup.ts`.

### Timeout errors
Increase timeout in `vitest.config.ts` or reduce iterations in property tests.

## Next Steps

1. **Install dependencies**: `npm install`
2. **Run property tests**: `npm run test:property`
3. **Implement unit tests**: Complete Task 2.3
4. **Run all tests**: `npm test`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://fast-check.dev/)
- [Property-Based Testing Guide](https://fast-check.dev/docs/introduction/)

# Design Document - Project Restructuring

## Overview

This design document outlines the comprehensive restructuring strategy for the Red-Salud healthcare platform. The restructuring will transform the current codebase into a modular, maintainable architecture by systematically decomposing large files, eliminating duplicates, and establishing a clear hierarchical directory structure.

### Design Principles

1. **Maximum File Size**: No file shall exceed 400 lines of code
2. **Single Responsibility**: Each file has exactly one clear purpose
3. **Hierarchical Organization**: Logical grouping through nested directories
4. **No Duplication**: One canonical implementation per feature
5. **Type Safety**: Preserve and enhance TypeScript type safety
6. **Backward Compatibility**: Maintain existing API contracts
7. **Incremental Safety**: Execute in verifiable phases

### Success Metrics

- **Before**: 20+ files >400 lines, 4 duplicate files, flat structure
- **After**: 0 files >400 lines, 0 duplicates, hierarchical structure
- **Compilation**: Zero TypeScript errors
- **Import Integrity**: 100% valid import paths

## Architecture

### High-Level Structure

```
red-salud/
├── app/                    # Next.js App Router (minimal changes)
├── components/             # React components (major restructuring)
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components by domain
│   ├── layout/            # Layout components
│   ├── messaging/         # Messaging components
│   ├── sections/          # Landing page sections
│   ├── ui/                # Reusable UI primitives
│   ├── video/             # Video components
│   └── providers/         # Context providers
├── lib/                   # Business logic and utilities
│   ├── supabase/          # Supabase integration
│   ├── templates/         # Medical templates
│   ├── i18n/              # Internationalization
│   ├── contexts/          # React contexts
│   ├── security/          # Security utilities
│   ├── services/          # External services
│   ├── validations/       # Zod schemas
│   ├── constants/         # Constants
│   └── utils/             # Utility functions
└── hooks/                 # Custom React hooks
    ├── auth/              # Authentication hooks
    ├── data/              # Data fetching hooks
    └── ui/                # UI-related hooks
```

### Decomposition Strategy

#### Component Decomposition Pattern

Large components follow this decomposition pattern:

```
Original: large-component.tsx (1000+ lines)

Decomposed:
├── large-component.tsx (150 lines) - Orchestrator
├── large-component-header.tsx (150 lines) - Header section
├── large-component-content.tsx (200 lines) - Main content
├── large-component-sidebar.tsx (150 lines) - Sidebar
├── large-component-footer.tsx (100 lines) - Footer
├── use-large-component.ts (150 lines) - Business logic hook
└── large-component.types.ts (100 lines) - Type definitions
```

#### Service Decomposition Pattern

Large services follow this decomposition pattern:

```
Original: feature-service.ts (800+ lines)

Decomposed:
├── feature-service.ts (100 lines) - Orchestrator/re-exports
├── feature-queries.ts (250 lines) - Read operations
├── feature-mutations.ts (250 lines) - Write operations
└── feature-types.ts (200 lines) - Type definitions
```

## Components and Interfaces

### Phase 1: Preparation

#### 1.1 Directory Structure Creation

Create the following directory structure:

```
components/
├── dashboard/
│   ├── common/
│   ├── profile/
│   │   ├── modals/
│   │   ├── tabs/
│   │   │   ├── common/
│   │   │   ├── medical/
│   │   │   └── documents/
│   │   └── components/
│   │       ├── security/
│   │       └── shared/
│   ├── medico/
│   │   ├── workspace/
│   │   ├── templates/
│   │   ├── patients/
│   │   └── components/
│   └── paciente/
│       └── profile/
├── ui/
│   ├── forms/
│   ├── feedback/
│   ├── data-display/
│   ├── navigation/
│   ├── overlays/
│   └── inputs/

lib/
├── supabase/
│   ├── services/
│   │   ├── appointments/
│   │   ├── telemedicine/
│   │   ├── health-metrics/
│   │   ├── medications/
│   │   ├── doctors/
│   │   ├── messaging/
│   │   └── medical-records/
│   └── types/
├── templates/
├── i18n/
│   └── translations/
├── validations/
│   ├── auth.ts
│   ├── profile.ts
│   └── medical.ts
└── utils/
    ├── date-utils.ts
    └── format-utils.ts
```

#### 1.2 Shared Type Definitions

Create common type files to be used across decomposed modules:

**lib/supabase/types/common.types.ts**
```typescript
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

**lib/supabase/types/database.types.ts**
- Supabase generated types
- Custom database types
- Table row types

**lib/supabase/types/api.types.ts**
- API request types
- API response types
- Query parameter types

### Phase 2: Component Refactoring

#### 2.1 Medical Workspace Decomposition

**Current**: `components/dashboard/medico/medical-workspace.tsx` (1013 lines)

**Target Structure**:

```
components/dashboard/medico/workspace/
├── medical-workspace.tsx (150 lines)
├── workspace-header.tsx (150 lines)
├── workspace-toolbar.tsx (200 lines)
├── workspace-editor.tsx (300 lines)
├── workspace-preview.tsx (200 lines)
├── use-medical-workspace.ts (200 lines)
└── medical-workspace.types.ts (150 lines)
```

**Responsibilities**:

- **medical-workspace.tsx**: Main orchestrator component
  - Composes all sub-components
  - Manages top-level state
  - Handles save/back actions
  - Props interface and exports

- **workspace-header.tsx**: Header section
  - Patient information display
  - Navigation breadcrumbs
  - Action buttons (back, save, print)
  - Loading states

- **workspace-toolbar.tsx**: Toolbar with actions
  - Tab switching (Estructurado/Libre/Plantillas)
  - AI analysis trigger
  - Template selection
  - Search functionality

- **workspace-editor.tsx**: Main editing area
  - Structured template editor
  - Free-form text editor
  - Template marketplace integration
  - ICD-11 search and selection

- **workspace-preview.tsx**: Preview and history
  - Clinical history display
  - AI analysis results
  - Suggested diagnoses
  - Historical records

- **use-medical-workspace.ts**: Business logic hook
  - State management
  - API calls (ICD search, AI analysis)
  - Data fetching (clinical history)
  - Autocomplete logic

- **medical-workspace.types.ts**: Type definitions
  - MedicalWorkspaceProps
  - HistorialItem
  - AIAnalysis
  - ICDResult

**Interface Contract**:

```typescript
// medical-workspace.types.ts
export interface MedicalWorkspaceProps {
  paciente: PatientInfo;
  alergias: string[];
  setAlergias: (value: string[]) => void;
  condicionesCronicas: string[];
  setCondicionesCronicas: (value: string[]) => void;
  medicamentosActuales: string[];
  setMedicamentosActuales: (value: string[]) => void;
  notasMedicas: string;
  setNotasMedicas: (value: string) => void;
  diagnosticos: string[];
  setDiagnosticos: (value: string[]) => void;
  onSave: () => void;
  onBack: () => void;
  loading: boolean;
}

export interface PatientInfo {
  cedula: string;
  nombre_completo: string;
  edad: number | null;
  genero: string;
}

export interface HistorialItem {
  id: string;
  fecha: string;
  diagnostico: string;
  notas: string;
  doctor: string;
}

export interface AIAnalysis {
  resumen: string;
  recomendaciones: string[];
  alertas: string[];
  diagnosticosSugeridos: string[];
}
```

#### 2.2 Medical Tab Consolidation and Decomposition

**Current**: Three duplicate files
- `medical-tab.tsx` (old version)
- `medical-tab-new.tsx` (intermediate version)
- `medical-tab-improved.tsx` (704 lines, current version)

**Strategy**: Consolidate into `medical-tab-improved.tsx` and decompose

**Target Structure**:

```
components/dashboard/profile/tabs/medical/
├── medical-tab.tsx (150 lines)
├── medical-history-section.tsx (200 lines)
├── allergies-section.tsx (150 lines)
├── medications-section.tsx (200 lines)
├── emergency-contacts-section.tsx (150 lines)
├── use-medical-tab.ts (150 lines)
└── medical-tab.types.ts (100 lines)
```

**Responsibilities**:

- **medical-tab.tsx**: Main orchestrator
  - Composes all sections
  - Manages form state
  - Handles save operations
  - Loading and error states

- **medical-history-section.tsx**: Medical history
  - Chronic conditions input
  - Previous surgeries
  - Family medical history
  - Medical notes

- **allergies-section.tsx**: Allergies management
  - Allergy list display
  - Add/remove allergies
  - Allergy severity
  - Reaction descriptions

- **medications-section.tsx**: Current medications
  - Medication list
  - Dosage information
  - Frequency and schedule
  - Add/remove medications

- **emergency-contacts-section.tsx**: Emergency contacts
  - Contact list
  - Add/edit/remove contacts
  - Contact validation
  - Relationship types

- **use-medical-tab.ts**: Business logic
  - Form state management
  - API calls to Supabase
  - Validation logic
  - Data transformation

- **medical-tab.types.ts**: Type definitions
  - MedicalTabProps
  - MedicalHistory
  - Allergy
  - Medication
  - EmergencyContact

**Deletion**: Remove old versions
- Delete `medical-tab.tsx`
- Delete `medical-tab-new.tsx`
- Update all imports to point to new `medical/medical-tab.tsx`

#### 2.3 Profile Tab Decomposition

**Current**: `components/dashboard/profile/tabs/profile-tab.tsx` (552 lines)

**Target Structure**:

```
components/dashboard/profile/tabs/common/
├── profile-tab.tsx (150 lines)
├── personal-info-section.tsx (200 lines)
├── contact-info-section.tsx (200 lines)
├── use-profile-tab.ts (150 lines)
└── profile-tab.types.ts (100 lines)
```

**Responsibilities**:

- **profile-tab.tsx**: Main orchestrator
  - Composes sections
  - Form state management
  - Save/cancel actions

- **personal-info-section.tsx**: Personal information
  - Name, ID, date of birth
  - Gender, blood type
  - Profile photo upload

- **contact-info-section.tsx**: Contact information
  - Email, phone
  - Address fields
  - City/state selection

- **use-profile-tab.ts**: Business logic
  - Profile data fetching
  - Update operations
  - Validation
  - Photo upload handling

- **profile-tab.types.ts**: Type definitions
  - ProfileTabProps
  - PersonalInfo
  - ContactInfo

#### 2.4 Date Picker Decomposition

**Current**: `components/ui/date-picker.tsx` (462 lines)

**Target Structure**:

```
components/ui/forms/
├── date-picker.tsx (100 lines)
├── date-picker-input.tsx (180 lines)
├── date-picker-calendar.tsx (180 lines)
└── date-picker.types.ts (50 lines)
```

**Responsibilities**:

- **date-picker.tsx**: Main orchestrator
  - Composes input and calendar
  - State management
  - Value formatting

- **date-picker-input.tsx**: Input field
  - Text input with icon
  - Manual date entry
  - Format validation
  - Placeholder handling

- **date-picker-calendar.tsx**: Calendar popup
  - Calendar grid display
  - Date selection
  - Month/year navigation
  - Disabled dates handling

- **date-picker.types.ts**: Type definitions
  - DatePickerProps
  - DatePickerInputProps
  - DatePickerCalendarProps

#### 2.5 Security Tab Decomposition

**Current**: `components/dashboard/profile/tabs/security-tab-new.tsx` (414 lines)

**Target Structure**:

```
components/dashboard/profile/tabs/common/
├── security-tab.tsx (100 lines)
├── password-section.tsx (150 lines)
├── two-factor-section.tsx (150 lines)
├── sessions-section.tsx (150 lines)
├── use-security-tab.ts (150 lines)
└── security-tab.types.ts (100 lines)
```

**Responsibilities**:

- **security-tab.tsx**: Main orchestrator
  - Composes security sections
  - Tab navigation
  - Loading states

- **password-section.tsx**: Password management
  - Change password form
  - Password strength indicator
  - Validation rules display

- **two-factor-section.tsx**: 2FA management
  - Enable/disable 2FA
  - QR code display
  - Backup codes
  - Verification

- **sessions-section.tsx**: Active sessions
  - Session list display
  - Device information
  - Revoke session action
  - Current session indicator

- **use-security-tab.ts**: Business logic
  - Password change API
  - 2FA setup/disable
  - Session management
  - Security event logging

- **security-tab.types.ts**: Type definitions
  - SecurityTabProps
  - SessionInfo
  - TwoFactorStatus

### Phase 3: Service Refactoring

#### 3.1 Service Decomposition Pattern

All large service files in `lib/supabase/services/` follow this pattern:

**Example: Appointments Service**

**Current**: `lib/supabase/services/appointments-service.ts` (estimated 600+ lines)

**Target Structure**:

```
lib/supabase/services/appointments/
├── appointments-service.ts (100 lines)
├── appointments-queries.ts (250 lines)
├── appointments-mutations.ts (250 lines)
└── appointments-types.ts (150 lines)
```

**appointments-service.ts** (Orchestrator):
```typescript
// Re-export all functions for backward compatibility
export * from './appointments-queries';
export * from './appointments-mutations';
export * from './appointments-types';

// Optional: Add facade functions if needed
import { getAppointments } from './appointments-queries';
import { createAppointment } from './appointments-mutations';

export const appointmentsService = {
  getAppointments,
  createAppointment,
  // ... other methods
};
```

**appointments-queries.ts** (Read operations):
```typescript
import { supabase } from '@/lib/supabase/client';
import type { Appointment, AppointmentFilters } from './appointments-types';
import type { ServiceResponse } from '@/lib/supabase/types/common.types';

export async function getAppointments(
  filters: AppointmentFilters
): Promise<ServiceResponse<Appointment[]>> {
  // Implementation
}

export async function getAppointmentById(
  id: string
): Promise<ServiceResponse<Appointment>> {
  // Implementation
}

// ... other query functions
```

**appointments-mutations.ts** (Write operations):
```typescript
import { supabase } from '@/lib/supabase/client';
import type { Appointment, CreateAppointmentInput } from './appointments-types';
import type { ServiceResponse } from '@/lib/supabase/types/common.types';

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<ServiceResponse<Appointment>> {
  // Implementation
}

export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Promise<ServiceResponse<Appointment>> {
  // Implementation
}

export async function deleteAppointment(
  id: string
): Promise<ServiceResponse<void>> {
  // Implementation
}

// ... other mutation functions
```

**appointments-types.ts** (Type definitions):
```typescript
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface AppointmentFilters {
  patient_id?: string;
  doctor_id?: string;
  status?: AppointmentStatus;
  date_from?: string;
  date_to?: string;
}

export interface CreateAppointmentInput {
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  notes?: string;
}

// ... other types
```

#### 3.2 Services to Refactor

Apply the above pattern to all large services:

1. **Telemedicine Service**
   - `telemedicine-service.ts` → 4 files
   - Video session management
   - Call history
   - Recording management

2. **Health Metrics Service**
   - `health-metrics-service.ts` → 4 files
   - Vital signs tracking
   - Metrics history
   - Alerts and thresholds

3. **Medications Service**
   - `medications-service.ts` → 4 files
   - Medication CRUD
   - Prescription management
   - Medication history

4. **Doctors Service**
   - `doctors-service.ts` → 4 files
   - Doctor profiles
   - Verification status
   - Specialties and schedules

5. **Messaging Service**
   - `messaging-service.ts` → 4 files
   - Conversation management
   - Message CRUD
   - Unread counts

6. **Medical Records Service**
   - `medical-records-service.ts` → 4 files
   - Record CRUD
   - Document uploads
   - Record sharing

### Phase 4: Consolidation

#### 4.1 Duplicate File Elimination

**Files to Delete**:

1. `components/dashboard/profile/tabs/medical-tab.tsx` (old)
2. `components/dashboard/profile/tabs/medical-tab-new.tsx` (intermediate)
3. Any `*-old.tsx` or `*-backup.tsx` files found

**Import Update Strategy**:

For each deleted file:
1. Search for all imports: `grep -r "from.*medical-tab.tsx"`
2. Update to new path: `from "@/components/dashboard/profile/tabs/medical/medical-tab"`
3. Verify no compilation errors

#### 4.2 File Relocation

Move files to their proper locations according to the new structure:

**UI Components**:
- Move all shadcn/ui components to appropriate subdirectories
- `date-picker.tsx` → `ui/forms/date-picker.tsx`
- `toast.tsx` → `ui/feedback/toast.tsx`
- `card.tsx` → `ui/data-display/card.tsx`
- etc.

**Dashboard Components**:
- Organize by role and feature
- Create subdirectories as needed
- Update all import paths

#### 4.3 Import Path Updates

**Strategy**:
1. Use automated search and replace
2. Maintain `@/` path alias
3. Update in batches by directory
4. Verify compilation after each batch

**Example Updates**:
```typescript
// Before
import { MedicalWorkspace } from "@/components/dashboard/medico/medical-workspace";

// After
import { MedicalWorkspace } from "@/components/dashboard/medico/workspace/medical-workspace";
```

### Phase 5: Validation

#### 5.1 Compilation Verification

**Process**:
1. Run TypeScript compiler: `npm run build`
2. Check for type errors
3. Verify all imports resolve
4. Fix any errors found

**Success Criteria**:
- Zero TypeScript errors
- Zero import resolution errors
- Successful build completion

#### 5.2 Import Integrity Check

**Automated Script**: `scripts/verify-imports.ts`

```typescript
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Scan all TypeScript files
// Extract import statements
// Verify each import path exists
// Report any broken imports
```

#### 5.3 File Size Verification

**Automated Script**: `scripts/verify-file-sizes.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Scan all source files
// Count lines in each file
// Report any files > 400 lines
// Generate summary report
```

## Data Models

### File Metadata

```typescript
interface FileMetadata {
  path: string;
  lines: number;
  responsibilities: string[];
  imports: string[];
  exports: string[];
  dependencies: string[];
}
```

### Refactoring Operation

```typescript
interface RefactoringOperation {
  type: 'split' | 'move' | 'delete' | 'update-imports';
  sourceFile: string;
  targetFiles?: string[];
  reason: string;
  phase: number;
}
```

### Restructuring Report

```typescript
interface RestructuringReport {
  timestamp: string;
  phase: string;
  filesModified: number;
  filesCreated: number;
  filesDeleted: number;
  operations: RefactoringOperation[];
  metrics: {
    beforeFileCount: number;
    afterFileCount: number;
    beforeAvgLines: number;
    afterAvgLines: number;
    filesOver400Before: number;
    filesOver400After: number;
  };
  errors: string[];
  warnings: string[];
}
```

## Error Handling

### Compilation Errors

**Strategy**:
- Halt execution on any TypeScript error
- Report file, line, and error message
- Provide suggested fix if possible
- Allow manual intervention before retry

### Import Resolution Errors

**Strategy**:
- Detect missing imports during compilation
- Generate list of broken import paths
- Suggest correct paths based on file location
- Batch fix common patterns

### File Operation Errors

**Strategy**:
- Validate file exists before operations
- Check write permissions
- Handle file locks gracefully
- Rollback on critical errors

### Validation Failures

**Strategy**:
- Run validation after each phase
- Report specific failures with context
- Provide remediation steps
- Allow phase retry after fixes

## Testing Strategy

### Unit Testing

**Scope**: Individual decomposed components and services

**Approach**:
- Test each new component in isolation
- Mock dependencies
- Verify props interface
- Test error states

**Example**:
```typescript
describe('WorkspaceHeader', () => {
  it('should render patient information', () => {
    // Test implementation
  });

  it('should call onBack when back button clicked', () => {
    // Test implementation
  });

  it('should disable save button when loading', () => {
    // Test implementation
  });
});
```

### Integration Testing

**Scope**: Composed components and service interactions

**Approach**:
- Test parent components with real children
- Verify data flow between components
- Test service layer with real Supabase calls (test database)

**Example**:
```typescript
describe('MedicalWorkspace Integration', () => {
  it('should save medical notes successfully', async () => {
    // Test implementation
  });

  it('should load clinical history on mount', async () => {
    // Test implementation
  });
});
```

### Regression Testing

**Scope**: Ensure existing functionality unchanged

**Approach**:
- Run existing test suite
- Verify all tests still pass
- Add tests for any previously untested code
- Test critical user flows manually

### Import Verification Testing

**Scope**: Verify all imports resolve correctly

**Approach**:
- Automated script to check imports
- Compile entire project
- Verify no missing module errors
- Check for circular dependencies

### File Size Testing

**Scope**: Verify no files exceed 400 lines

**Approach**:
- Automated script to count lines
- Report any violations
- Generate metrics report
- Fail build if violations found

## Performance Considerations

### Bundle Size Impact

**Analysis**:
- Measure bundle size before/after
- Verify code splitting still works
- Check for duplicate code in bundles
- Optimize imports (tree-shaking)

**Expected Impact**: Neutral to slightly positive
- Better tree-shaking from smaller modules
- More granular code splitting opportunities

### Build Time Impact

**Analysis**:
- Measure build time before/after
- Monitor TypeScript compilation time
- Check for circular dependencies

**Expected Impact**: Minimal increase
- More files to process
- Better caching from smaller modules
- Net impact: <10% increase acceptable

### Runtime Performance

**Analysis**:
- No runtime impact expected
- Same code, different organization
- Verify no performance regressions

**Monitoring**:
- Page load times
- Component render times
- API response times

## Security Considerations

### Code Review

**Process**:
- Review all decomposed files
- Verify no sensitive data exposed
- Check for proper error handling
- Ensure logging doesn't leak PII

### Access Control

**Verification**:
- Verify RBAC still enforced
- Check authentication flows
- Test authorization checks
- Verify session management

### Data Validation

**Verification**:
- Ensure Zod schemas still applied
- Verify input sanitization
- Check SQL injection prevention
- Test XSS prevention

## Deployment Strategy

### Incremental Deployment

**Approach**:
- Deploy each phase separately
- Verify in staging environment
- Monitor for errors
- Rollback capability at each phase

### Rollback Plan

**Strategy**:
- Git tags at each phase
- Database migrations reversible
- Feature flags for new code paths
- Quick rollback procedure documented

### Monitoring

**Metrics**:
- Error rates
- API response times
- User session errors
- Build success rate

## Documentation Updates

### Code Documentation

**Updates Required**:
- Update component documentation
- Document new file structure
- Update import examples
- Add migration guide

### Developer Guide

**New Sections**:
- File organization principles
- Where to add new components
- Naming conventions
- Import path patterns

### Architecture Documentation

**Updates Required**:
- Update architecture diagrams
- Document decomposition patterns
- Explain service layer structure
- Add decision records (ADRs)

## Maintenance Plan

### Ongoing Enforcement

**Automated Checks**:
- Pre-commit hook: Check file size
- CI/CD: Verify no files >400 lines
- Code review: Check single responsibility
- Linting: Enforce import patterns

### Refactoring Guidelines

**Documentation**:
- When to split a file
- How to decompose components
- Service layer patterns
- Type organization

### Team Training

**Topics**:
- New file structure
- Decomposition patterns
- Import conventions
- Best practices

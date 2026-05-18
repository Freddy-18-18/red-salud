export type AdminRoleType =
  | 'super_admin'
  | 'support'
  | 'finance'
  | 'ops'
  | 'read_only';

export const ADMIN_ROLE_LABELS: Record<AdminRoleType, string> = {
  super_admin: 'Super Admin',
  support:     'Soporte',
  finance:     'Finanzas',
  ops:         'Operaciones',
  read_only:   'Solo lectura',
};

export type Permission =
  | 'users.view'
  | 'users.search'
  | 'users.impersonate'
  | 'users.reset_password'
  | 'users.lock'
  | 'doctors.view'
  | 'doctors.manage'
  | 'patients.view'
  | 'appointments.view'
  | 'appointments.cancel'
  | 'finance.view'
  | 'finance.refund'
  | 'employees.view'
  | 'employees.manage'
  | 'feature_flags.view'
  | 'feature_flags.toggle'
  | 'announcements.view'
  | 'announcements.publish'
  | 'support.view'
  | 'support.manage'
  | 'alerts.view'
  | 'alerts.resolve'
  | 'audit.view'
  | 'system.settings';

export const ROLE_PERMISSIONS: Record<AdminRoleType, ReadonlySet<Permission>> = {
  super_admin: new Set<Permission>([
    'users.view', 'users.search', 'users.impersonate', 'users.reset_password', 'users.lock',
    'doctors.view', 'doctors.manage',
    'patients.view',
    'appointments.view', 'appointments.cancel',
    'finance.view', 'finance.refund',
    'employees.view', 'employees.manage',
    'feature_flags.view', 'feature_flags.toggle',
    'announcements.view', 'announcements.publish',
    'support.view', 'support.manage',
    'alerts.view', 'alerts.resolve',
    'audit.view',
    'system.settings',
  ]),
  support: new Set<Permission>([
    'users.view', 'users.search', 'users.impersonate', 'users.reset_password',
    'doctors.view',
    'patients.view',
    'appointments.view', 'appointments.cancel',
    'announcements.view',
    'support.view', 'support.manage',
    'alerts.view',
  ]),
  finance: new Set<Permission>([
    'users.view', 'users.search',
    'doctors.view',
    'patients.view',
    'appointments.view',
    'finance.view', 'finance.refund',
    'alerts.view',
    'audit.view',
  ]),
  ops: new Set<Permission>([
    'users.view', 'users.search',
    'doctors.view', 'doctors.manage',
    'feature_flags.view', 'feature_flags.toggle',
    'announcements.view', 'announcements.publish',
    'alerts.view', 'alerts.resolve',
    'audit.view',
    'system.settings',
  ]),
  read_only: new Set<Permission>([
    'users.view', 'users.search',
    'doctors.view',
    'patients.view',
    'appointments.view',
    'finance.view',
    'alerts.view',
    'audit.view',
  ]),
};

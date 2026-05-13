/**
 * @file index.ts
 * @description Public barrel for the medico AppShell.
 *
 * Consumers (page modules + the dashboard layout) import from this barrel
 * rather than reaching into individual files. Keeps the import surface small
 * and lets us refactor internals (e.g. split a component into multiple files)
 * without breaking consumers.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

// Orchestrator (used by app/dashboard/layout.tsx).
export { DashboardShell } from './dashboard-shell';

// Layout components (typically not consumed outside the shell, but exported
// for completeness and so storybook-style harnesses can render them in
// isolation).
export { DesktopSidebar } from './desktop-sidebar';
export { MobileBottomNav } from './mobile-bottom-nav';
export { MobileSidebarSheet } from './mobile-sidebar-sheet';
export { MobileTopBar } from './mobile-top-bar';

// Supabase-style global header + action cluster (Phase 2 of
// medico-shell-supabase-style). Mounted under `NEXT_PUBLIC_FEATURE_NEW_SHELL`.
export { GlobalHeader } from './global-header';
export { BreadcrumbPicker } from './breadcrumb-picker';
export { AdvisorButton } from './advisor-button';
export { HelpButton } from './help-button';
export { AIAssistantButton } from './ai-assistant-button';

// Per-page header (consumed by all 11 dashboard pages in Phase E).
export { PageHeader } from './page-header';

// User menu (used inside the sidebar; re-exported for tests/storybook).
export { UserMenuDropdown } from './user-menu-dropdown';

// Leaf nav primitives (used by both the desktop sidebar and the mobile sheet).
export { NavGroup } from './nav-group';
export { NavLink } from './nav-link';

// Static nav data — page modules occasionally need to introspect (e.g. to
// reverse-lookup a label from an href).
export { BOTTOM_NAV_ITEMS, NAV_GROUPS } from './nav-data';

// Public type contracts.
export type {
  BottomNavItemData,
  DashboardShellProps,
  GlobalHeaderProps,
  NavGroupData,
  NavLinkData,
  PageHeaderBreadcrumbItem,
} from './types';

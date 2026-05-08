/**
 * @file dashboard-shell.test.tsx
 * @description Behavior tests for DashboardShell orchestrator (T-012).
 *
 * The orchestrator is a pure composition: it owns `useSidebarCollapsed()` and
 * a `sheetOpen` boolean, then renders DesktopSidebar + MobileTopBar +
 * MobileSidebarSheet + main + MobileBottomNav. To keep this test fast and
 * focused, we mock all heavy children with stubs that surface their inputs as
 * data-* attributes. The `useSidebarCollapsed` hook is mocked so collapsed-state
 * branching can be exercised directly.
 *
 * Tests cover:
 * - Each child stub is rendered once.
 * - Collapsed state gates the wrapper padding (`lg:pl-72` ↔ `lg:pl-16`).
 * - DesktopSidebar receives the correct identity props and the live `collapsed` flag.
 * - Tapping `MobileTopBar.onOpenSheet` flips the sheet to open.
 * - Tapping `MobileSidebarSheet.onClose` flips the sheet back to closed.
 * - Children render inside the `<main>` element.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---- Mocks (declared BEFORE importing the SUT) -------------------------------

// Hook: collapsed state flipper. We replace per-test via `mockImplementation`.
const useSidebarCollapsedMock = vi.fn(() => ({
  collapsed: false,
  toggle: vi.fn(),
}));

vi.mock('@/hooks/use-sidebar-collapsed', () => ({
  useSidebarCollapsed: () => useSidebarCollapsedMock(),
}));

// Heavy children: replace with thin stubs that echo their props as data-*
// attributes so we can assert what the orchestrator passes them.
vi.mock('@/components/shell/desktop-sidebar', () => ({
  DesktopSidebar: (props: {
    doctorName: string;
    email: string;
    avatarUrl: string | null;
    specialtyName: string;
    collapsed: boolean;
    onToggleCollapse: () => void;
  }) => (
    <div
      data-testid="desktop-sidebar"
      data-collapsed={props.collapsed ? 'true' : 'false'}
      data-doctor-name={props.doctorName}
      data-email={props.email}
      data-avatar-url={props.avatarUrl ?? ''}
      data-specialty-name={props.specialtyName}
    >
      <button
        type="button"
        data-testid="desktop-sidebar-toggle"
        onClick={props.onToggleCollapse}
      >
        toggle
      </button>
    </div>
  ),
}));

vi.mock('@/components/shell/mobile-top-bar', () => ({
  MobileTopBar: (props: { onOpenSheet: () => void }) => (
    <button
      type="button"
      data-testid="mobile-top-bar-open"
      onClick={props.onOpenSheet}
    >
      open sheet
    </button>
  ),
}));

vi.mock('@/components/shell/mobile-sidebar-sheet', () => ({
  MobileSidebarSheet: (props: {
    open: boolean;
    onClose: () => void;
    doctorName: string;
    email: string;
    avatarUrl: string | null;
  }) => (
    <div
      data-testid="mobile-sidebar-sheet"
      data-open={props.open ? 'true' : 'false'}
      data-doctor-name={props.doctorName}
      data-email={props.email}
      data-avatar-url={props.avatarUrl ?? ''}
    >
      <button
        type="button"
        data-testid="mobile-sidebar-sheet-close"
        onClick={props.onClose}
      >
        close
      </button>
    </div>
  ),
}));

vi.mock('@/components/shell/mobile-bottom-nav', () => ({
  MobileBottomNav: () => <div data-testid="mobile-bottom-nav" />,
}));

// ---- SUT (after mocks) -------------------------------------------------------

import { DashboardShell } from './dashboard-shell';

const baseProps = {
  doctorName: 'Marianella Suarez',
  email: 'm.suarez@example.com',
  avatarUrl: null,
  specialtyName: 'Cardiología',
};

beforeEach(() => {
  useSidebarCollapsedMock.mockImplementation(() => ({
    collapsed: false,
    toggle: vi.fn(),
  }));
});

afterEach(() => {
  useSidebarCollapsedMock.mockReset();
});

describe('<DashboardShell />', () => {
  it('renders DesktopSidebar, MobileTopBar, MobileSidebarSheet, MobileBottomNav, and the children', () => {
    render(
      <DashboardShell {...baseProps}>
        <p data-testid="page-content">hola</p>
      </DashboardShell>,
    );

    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-top-bar-open')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-sidebar-sheet')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('forwards identity + specialty props to DesktopSidebar', () => {
    render(
      <DashboardShell {...baseProps}>
        <span />
      </DashboardShell>,
    );

    const sidebar = screen.getByTestId('desktop-sidebar');
    expect(sidebar).toHaveAttribute('data-doctor-name', 'Marianella Suarez');
    expect(sidebar).toHaveAttribute('data-email', 'm.suarez@example.com');
    expect(sidebar).toHaveAttribute('data-avatar-url', '');
    expect(sidebar).toHaveAttribute('data-specialty-name', 'Cardiología');
  });

  it('forwards identity props to MobileSidebarSheet', () => {
    render(
      <DashboardShell {...baseProps} avatarUrl="https://cdn.example.com/avatar.png">
        <span />
      </DashboardShell>,
    );

    const sheet = screen.getByTestId('mobile-sidebar-sheet');
    expect(sheet).toHaveAttribute('data-doctor-name', 'Marianella Suarez');
    expect(sheet).toHaveAttribute('data-email', 'm.suarez@example.com');
    expect(sheet).toHaveAttribute(
      'data-avatar-url',
      'https://cdn.example.com/avatar.png',
    );
  });

  it('renders children inside the <main> element', () => {
    const { container } = render(
      <DashboardShell {...baseProps}>
        <p data-testid="page-content">hola</p>
      </DashboardShell>,
    );

    const main = container.querySelector('main');
    expect(main).not.toBeNull();
    expect(main!.querySelector('[data-testid="page-content"]')).not.toBeNull();
  });

  it('applies lg:pl-72 to the content wrapper when sidebar is expanded', () => {
    useSidebarCollapsedMock.mockImplementation(() => ({
      collapsed: false,
      toggle: vi.fn(),
    }));

    const { container } = render(
      <DashboardShell {...baseProps}>
        <span />
      </DashboardShell>,
    );

    const wrapper = container.querySelector('main')!.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toContain('lg:pl-72');
    expect(wrapper!.className).not.toContain('lg:pl-16');
  });

  it('applies lg:pl-16 to the content wrapper when sidebar is collapsed', () => {
    useSidebarCollapsedMock.mockImplementation(() => ({
      collapsed: true,
      toggle: vi.fn(),
    }));

    const { container } = render(
      <DashboardShell {...baseProps}>
        <span />
      </DashboardShell>,
    );

    const wrapper = container.querySelector('main')!.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toContain('lg:pl-16');
    expect(wrapper!.className).not.toContain('lg:pl-72');
  });

  it('forwards the live collapsed flag to DesktopSidebar', () => {
    useSidebarCollapsedMock.mockImplementation(() => ({
      collapsed: true,
      toggle: vi.fn(),
    }));

    render(
      <DashboardShell {...baseProps}>
        <span />
      </DashboardShell>,
    );

    expect(screen.getByTestId('desktop-sidebar')).toHaveAttribute(
      'data-collapsed',
      'true',
    );
  });

  it('opens the mobile sheet when MobileTopBar fires onOpenSheet', () => {
    render(
      <DashboardShell {...baseProps}>
        <span />
      </DashboardShell>,
    );

    // Initially closed
    expect(screen.getByTestId('mobile-sidebar-sheet')).toHaveAttribute(
      'data-open',
      'false',
    );

    fireEvent.click(screen.getByTestId('mobile-top-bar-open'));

    expect(screen.getByTestId('mobile-sidebar-sheet')).toHaveAttribute(
      'data-open',
      'true',
    );
  });

  it('closes the mobile sheet when MobileSidebarSheet fires onClose', () => {
    render(
      <DashboardShell {...baseProps}>
        <span />
      </DashboardShell>,
    );

    // Open it first.
    fireEvent.click(screen.getByTestId('mobile-top-bar-open'));
    expect(screen.getByTestId('mobile-sidebar-sheet')).toHaveAttribute(
      'data-open',
      'true',
    );

    // Now close it.
    fireEvent.click(screen.getByTestId('mobile-sidebar-sheet-close'));
    expect(screen.getByTestId('mobile-sidebar-sheet')).toHaveAttribute(
      'data-open',
      'false',
    );
  });

  it('wires the desktop sidebar toggle to the hook returned by useSidebarCollapsed', () => {
    const toggle = vi.fn();
    useSidebarCollapsedMock.mockImplementation(() => ({
      collapsed: false,
      toggle,
    }));

    render(
      <DashboardShell {...baseProps}>
        <span />
      </DashboardShell>,
    );

    fireEvent.click(screen.getByTestId('desktop-sidebar-toggle'));
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});

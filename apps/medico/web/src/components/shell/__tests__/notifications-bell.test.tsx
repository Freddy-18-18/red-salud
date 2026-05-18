/**
 * @file __tests__/notifications-bell.test.tsx
 * @description Smoke tests for the header NotificationsBell.
 *
 * The component depends on `useNotifications` which itself calls Supabase
 * + realtime. We mock the hook directly so the test focuses on visual
 * behaviour (badge presence, count clamping) without driving the Radix
 * popover open — that codepath is exercised in browser-based E2E.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const mockUseNotifications = vi.fn();
vi.mock('@/lib/notifications/use-notifications', () => ({
  useNotifications: () => mockUseNotifications(),
}));

import { NotificationsBell } from '../notifications-bell';

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).hasPointerCapture = vi.fn(() => false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).releasePointerCapture = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();

  mockUseNotifications.mockReturnValue({
    notifications: [],
    unreadCount: 0,
    loading: false,
    markRead: vi.fn(),
    markAllReadAction: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<NotificationsBell />', () => {
  it('renders the bell trigger with no badge when unreadCount is 0', async () => {
    render(<NotificationsBell />);
    const trigger = await screen.findByTestId('notifications-bell');
    expect(trigger).toBeInTheDocument();
    expect(
      screen.queryByTestId('notifications-bell-badge'),
    ).not.toBeInTheDocument();
  });

  it('shows the unread count badge when there are unread notifications', async () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 3,
      loading: false,
      markRead: vi.fn(),
      markAllReadAction: vi.fn(),
      dismiss: vi.fn(),
      dismissAll: vi.fn(),
    });
    render(<NotificationsBell />);
    const badge = await screen.findByTestId('notifications-bell-badge');
    expect(badge).toHaveTextContent('3');
  });

  it('clamps the badge to "99+" when over 99', async () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 142,
      loading: false,
      markRead: vi.fn(),
      markAllReadAction: vi.fn(),
      dismiss: vi.fn(),
      dismissAll: vi.fn(),
    });
    render(<NotificationsBell />);
    const badge = await screen.findByTestId('notifications-bell-badge');
    expect(badge).toHaveTextContent('99+');
  });
});

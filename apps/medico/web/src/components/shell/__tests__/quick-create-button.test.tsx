/**
 * @file __tests__/quick-create-button.test.tsx
 * @description Smoke tests for the header "+" Quick Create dropdown.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));

import { QuickCreateButton } from '../quick-create-button';

beforeEach(() => {
  pushMock.mockReset();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).hasPointerCapture = vi.fn(() => false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).releasePointerCapture = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<QuickCreateButton />', () => {
  it('renders the trigger with the + icon', async () => {
    render(<QuickCreateButton />);
    const trigger = await screen.findByTestId('quick-create-button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'Crear nuevo');
  });
});

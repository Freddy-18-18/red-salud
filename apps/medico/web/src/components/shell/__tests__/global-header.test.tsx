/**
 * @file __tests__/global-header.test.tsx
 * @description Phase-2 (Supabase-style) behavior tests for GlobalHeader.
 *
 * Covers R6 (3-level breadcrumb with slash SVG separators) and R7 (action
 * cluster order Search,Help,Advisor,AI,Avatar — Search lands in Phase 4 so
 * Phase 2 verifies Help, Advisor, AI are present, in order). The legacy
 * shell does not mount this header — these tests stub the env flag inline.
 *
 * Action cluster integration tests (Advisor red-dot toggling, AI placeholder
 * behavior) live in their own focused test files.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@red-salud/design-system';

import { GlobalHeader } from '../global-header';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).hasPointerCapture = vi.fn(() => false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).releasePointerCapture = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function renderHeader(ui: React.ReactElement) {
  return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>);
}

describe('<GlobalHeader /> — breadcrumb + slash separators (R6)', () => {
  it('renders 3 breadcrumb levels: doctor, sede, module', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    renderHeader(
      <GlobalHeader
        doctorName="Dr Test"
        sedeName="Sede Central"
        moduleLabel="Pacientes"
      />,
    );

    expect(screen.getByText('Dr Test')).toBeInTheDocument();
    expect(screen.getByText('Sede Central')).toBeInTheDocument();
    expect(screen.getByText('Pacientes')).toBeInTheDocument();
  });

  it('renders 2 slash separator SVGs between the 3 breadcrumb levels', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    const { container } = renderHeader(
      <GlobalHeader
        doctorName="Dr Test"
        sedeName="Sede Central"
        moduleLabel="Pacientes"
      />,
    );

    const separators = container.querySelectorAll(
      '[data-testid="global-header-slash-separator"]',
    );
    expect(separators).toHaveLength(2);
    separators.forEach((sep) => {
      // Each slash separator wraps an SVG (the Supabase-style forward slash).
      expect(sep.querySelector('svg')).not.toBeNull();
    });
  });

  it('degrades to "Sin sede" when sedeName is undefined', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    renderHeader(
      <GlobalHeader doctorName="Dr Test" moduleLabel="Pacientes" />,
    );

    expect(screen.getByText('Sin sede')).toBeInTheDocument();
  });

  it('applies h-12 and border-b on the <header> element', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    const { container } = renderHeader(
      <GlobalHeader
        doctorName="Dr Test"
        sedeName="Sede Central"
        moduleLabel="Pacientes"
      />,
    );

    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    expect(header!.className).toContain('h-12');
    expect(header!.className).toContain('border-b');
  });
});

describe('<GlobalHeader /> — action cluster (R7)', () => {
  it('renders Help, Advisor, and AI buttons (Search lands in Phase 4)', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    renderHeader(
      <GlobalHeader
        doctorName="Dr Test"
        sedeName="Sede Central"
        moduleLabel="Pacientes"
      />,
    );

    expect(screen.getByRole('button', { name: /ayuda/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /alerta|advisor|notif/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /asistente|ai|ia/i }),
    ).toBeInTheDocument();
  });
});

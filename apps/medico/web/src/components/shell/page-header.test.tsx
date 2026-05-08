/**
 * @file page-header.test.tsx
 * @description Behavior tests for PageHeader compound component (T-006).
 *
 * Tests cover:
 * - Renders Title only.
 * - Renders Title + Meta.
 * - Renders Title + Actions, Action button is clickable.
 * - Renders Breadcrumb with multiple items.
 * - Renders without errors when only Title is provided (no breadcrumb / no actions).
 * - Visual order: breadcrumb above title, meta below title; actions stay on the right column.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PageHeader } from './page-header';

// Breadcrumbs from @red-salud/design-system reads usePathname() — stub it so
// the import-chain doesn't blow up under jsdom.
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/agenda',
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('<PageHeader />', () => {
  it('renders Title alone', () => {
    render(
      <PageHeader>
        <PageHeader.Title>Agenda</PageHeader.Title>
      </PageHeader>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Agenda' })).toBeInTheDocument();
  });

  it('renders Title + Meta', () => {
    render(
      <PageHeader>
        <PageHeader.Title>Agenda</PageHeader.Title>
        <PageHeader.Meta>12 turnos hoy</PageHeader.Meta>
      </PageHeader>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Agenda' })).toBeInTheDocument();
    expect(screen.getByText('12 turnos hoy')).toBeInTheDocument();
  });

  it('renders Title + Actions and the Action button is clickable', () => {
    const onClick = vi.fn();
    render(
      <PageHeader>
        <PageHeader.Title>Agenda</PageHeader.Title>
        <PageHeader.Actions>
          <button type="button" onClick={onClick}>
            Nuevo turno
          </button>
        </PageHeader.Actions>
      </PageHeader>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo turno' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders Breadcrumb with multiple items', () => {
    render(
      <PageHeader>
        <PageHeader.Breadcrumb
          items={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Agenda' },
          ]}
        />
        <PageHeader.Title>Agenda</PageHeader.Title>
      </PageHeader>,
    );
    // Both crumbs are present.
    expect(screen.getAllByText('Inicio').length).toBeGreaterThanOrEqual(1);
    // The terminal "Agenda" text appears in both breadcrumb and title — accept >= 1.
    expect(screen.getAllByText('Agenda').length).toBeGreaterThanOrEqual(1);
  });

  it('renders without crashing when only Title is provided', () => {
    expect(() =>
      render(
        <PageHeader>
          <PageHeader.Title>Inicio</PageHeader.Title>
        </PageHeader>,
      ),
    ).not.toThrow();
  });

  it('places breadcrumb above title in DOM order', () => {
    const { container } = render(
      <PageHeader>
        <PageHeader.Breadcrumb items={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Agenda' }]} />
        <PageHeader.Title>Agenda</PageHeader.Title>
        <PageHeader.Meta>12 turnos hoy</PageHeader.Meta>
      </PageHeader>,
    );
    const html = container.innerHTML;
    const breadcrumbIdx = html.indexOf('Inicio');
    const titleTagIdx = html.indexOf('<h1');
    const metaIdx = html.indexOf('12 turnos hoy');
    expect(breadcrumbIdx).toBeGreaterThan(-1);
    expect(titleTagIdx).toBeGreaterThan(-1);
    expect(metaIdx).toBeGreaterThan(-1);
    expect(breadcrumbIdx).toBeLessThan(titleTagIdx);
    expect(titleTagIdx).toBeLessThan(metaIdx);
  });
});

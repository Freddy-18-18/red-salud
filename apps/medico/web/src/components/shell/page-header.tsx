/* eslint-disable react-refresh/only-export-components -- Compound pattern: PageHeader.{Title,Meta,Breadcrumb,Actions} live on the same module by design. HMR fast refresh is irrelevant for these slot components, which are pure presentational wrappers. */
'use client';

import { Breadcrumbs } from '@red-salud/design-system';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import type { PageHeaderBreadcrumbItem } from './types';

/**
 * @file page-header.tsx
 * @description Per-page header compound component (T-006).
 *
 * Provides four named slots — Breadcrumb, Title, Meta, Actions — assembled
 * into a consistent layout used across all 11 dashboard pages (FR-2). The
 * compound pattern is preferred over a 4-prop API because:
 *  - slots are individually optional with no awkward `undefined` props
 *  - children read top-to-bottom in the consumer's source like reading the UI
 *  - per-slot styling lives in the slot, no leaky className threading
 *
 * Layout: vertical stack on small screens, horizontal split on `md:` and up
 * (title column on the left, actions on the right). Border-bottom + bottom
 * padding visually anchor the header above the page body.
 *
 * Children are sorted by their displayName so consumer order is irrelevant —
 * `<Breadcrumb>` always renders above `<Title>`, `<Actions>` always lives in
 * the right column.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

interface PageHeaderProps {
  children: ReactNode;
}

interface BreadcrumbProps {
  items: PageHeaderBreadcrumbItem[];
}

interface SlotProps {
  children: ReactNode;
}

// ---- Subcomponents -----------------------------------------------------------

function PageHeaderBreadcrumb({ items }: BreadcrumbProps): ReactElement {
  // Reuse the design-system Breadcrumbs primitive in explicit-items mode.
  return <Breadcrumbs items={items} hideOnPaths={[]} className="mb-0" />;
}
PageHeaderBreadcrumb.displayName = 'PageHeader.Breadcrumb';

function PageHeaderTitle({ children }: SlotProps): ReactElement {
  return <h1 className="text-2xl font-bold tracking-tight">{children}</h1>;
}
PageHeaderTitle.displayName = 'PageHeader.Title';

function PageHeaderMeta({ children }: SlotProps): ReactElement {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
PageHeaderMeta.displayName = 'PageHeader.Meta';

function PageHeaderActions({ children }: SlotProps): ReactElement {
  return <div className="flex items-center gap-2">{children}</div>;
}
PageHeaderActions.displayName = 'PageHeader.Actions';

// ---- Helpers ----------------------------------------------------------------

/**
 * Picks the first child whose component matches the requested displayName.
 * Returning the actual element (not the props) preserves keys, refs, and
 * future-proofing for displayName collisions across re-exports.
 */
function findSlot(children: ReactNode, displayName: string): ReactNode | null {
  let found: ReactNode | null = null;
  Children.forEach(children, (child) => {
    if (found) return;
    if (!isValidElement(child)) return;
    const childType = child.type as { displayName?: string } | undefined;
    if (childType?.displayName === displayName) {
      found = child;
    }
  });
  return found;
}

// ---- Main component ---------------------------------------------------------

function PageHeaderRoot({ children }: PageHeaderProps): ReactElement {
  const breadcrumb = findSlot(children, 'PageHeader.Breadcrumb');
  const title = findSlot(children, 'PageHeader.Title');
  const meta = findSlot(children, 'PageHeader.Meta');
  const actions = findSlot(children, 'PageHeader.Actions');

  return (
    <header className="flex flex-col gap-2 pb-4 mb-4 border-b border-border md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1 min-w-0">
        {breadcrumb}
        {title}
        {meta}
      </div>
      {actions ? <div className="flex shrink-0 items-center md:justify-end">{actions}</div> : null}
    </header>
  );
}

// ---- Compound export --------------------------------------------------------

/**
 * Compound `<PageHeader>` with named slots. All slots are optional; layout
 * adapts to whichever are provided.
 */
export const PageHeader = Object.assign(PageHeaderRoot, {
  Breadcrumb: PageHeaderBreadcrumb,
  Title: PageHeaderTitle,
  Meta: PageHeaderMeta,
  Actions: PageHeaderActions,
});

/**
 * @file header-skeleton.tsx
 * @description Placeholder rendered before the GlobalHeader's mount guard
 * flips to interactive. Matches the laid-out widths of the real header so
 * the page doesn't reflow when the real chrome arrives.
 *
 * Visible only on `md+` viewports — mobile uses MobileTopBar with its own
 * skeleton state if needed.
 */

export function HeaderSkeleton(): React.ReactElement {
  return (
    <header
      aria-hidden="true"
      className="sticky top-0 z-40 hidden h-14 shrink-0 items-center border-b border-border bg-background/95 backdrop-blur md:flex"
    >
      <div className="flex h-full flex-1 items-center gap-x-4 px-5">
        {/* Left — breadcrumb skeleton */}
        <div className="flex min-w-0 shrink items-center gap-2">
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          <div className="h-5 w-28 animate-pulse rounded-full bg-muted/70 motion-reduce:animate-none" />
          <div className="h-3 w-3 text-border-strong/70" />
          <div className="h-5 w-44 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        </div>

        {/* Center — hero buscador skeleton */}
        <div className="flex flex-1 justify-center">
          <div className="h-9 w-full max-w-md animate-pulse rounded-full bg-muted/60 motion-reduce:animate-none" />
        </div>

        {/* Right — action cluster skeleton */}
        <div className="flex shrink-0 items-center gap-1">
          <div className="h-8 w-8 animate-pulse rounded-full bg-primary/40 motion-reduce:animate-none" />
          <div className="mx-1 h-8 w-px bg-border" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          <div className="ml-2 h-8 w-px bg-border" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-background motion-reduce:animate-none" />
        </div>
      </div>
    </header>
  );
}

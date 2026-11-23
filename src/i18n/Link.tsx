"use client";

import { useLinkStatus } from "next/link";
import { type ComponentProps, useState } from "react";
import { BaseLink } from "./navigation-base";

/** Thin top-of-page progress bar. Fixed-position, so it never affects the link's layout. */
function PendingBar() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] origin-left animate-link-progress bg-gold-500"
    />
  );
}

/**
 * Drop-in replacement for the next-intl Link.
 * - No viewport prefetch; prefetching starts on first hover / focus / touch (pass `prefetch` to override).
 * - While the navigation is pending, shows a progress bar (only if the route wasn't prefetched yet).
 */
export function Link({
  prefetch,
  onMouseEnter,
  onFocus,
  onTouchStart,
  children,
  ...props
}: ComponentProps<typeof BaseLink>) {
  const [intent, setIntent] = useState(false);

  return (
    <BaseLink
      {...props}
      prefetch={prefetch ?? (intent ? null : false)}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
    >
      {children}
      <PendingBar />
    </BaseLink>
  );
}

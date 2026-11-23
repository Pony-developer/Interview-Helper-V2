"use client";

import { useParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { SlideSpinner } from "./SlideSpinner";

/**
 * Client-side loading boundary around the slide area.
 *
 * `loading.tsx` alone isn't enough: its fallback is server-rendered and arrives with the route prefetch.
 * When a link is clicked while that prefetch is still in flight, Next commits the new route without the
 * fallback content and the slide area renders empty until the page streams in. This boundary lives in the
 * client bundle, so a spinner is always available. Keyed by slide so each navigation mounts a fresh
 * boundary, which React shows its fallback for even during a transition.
 */
export function SlideFrame({ children }: { children: ReactNode }) {
  const { slide } = useParams<{ slide?: string }>();
  return (
    <Suspense key={slide} fallback={<SlideSpinner />}>
      {children}
    </Suspense>
  );
}

import { SlideSpinner } from "@/components/courses/player/SlideSpinner";

/**
 * Shown inside the player's content area while the next slide loads; header and sidebar stay put.
 * Kept so Next switches to the new slide right away; `SlideFrame` covers the case where this fallback
 * hasn't reached the browser yet.
 */
export default function Loading() {
  return <SlideSpinner />;
}

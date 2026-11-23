/** Shown inside the player's content area while the next slide loads; header and sidebar stay put. */
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="grid min-h-[60dvh] place-items-center">
      <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-forest-200 border-t-forest-700" />
    </div>
  );
}

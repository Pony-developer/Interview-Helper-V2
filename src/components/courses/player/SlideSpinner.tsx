/** Spinner for the player's content area while a slide loads. Plain markup: usable from server and client files. */
export function SlideSpinner() {
  return (
    <div role="status" aria-busy="true" className="grid min-h-[60dvh] place-items-center">
      <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-forest-200 border-t-forest-700" />
    </div>
  );
}

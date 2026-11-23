/** Instant fallback shown while a route is loading after a navigation. */
export default function Loading() {
  return (
    <>
      <div aria-hidden className="h-[4.5rem] bg-forest-700" />
      <div role="status" aria-busy="true" className="grid flex-1 place-items-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-forest-200 border-t-forest-700" />
      </div>
    </>
  );
}

/** Shown when moving between slides: the page chrome stays, the slide area spins. */
export default function Loading() {
  return (
    <>
      <div aria-hidden className="h-[4.5rem] bg-forest-700" />
      <div className="lg:grid lg:grid-cols-[minmax(19rem,23rem)_1fr]">
        <aside
          aria-hidden
          className="sticky top-[4.5rem] hidden h-[calc(100dvh-4.5rem)] border-r border-paper-3 bg-paper-2 lg:block"
        />
        <div role="status" aria-busy="true" className="on-light grid min-h-[60dvh] place-items-center">
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-forest-200 border-t-forest-700" />
        </div>
      </div>
    </>
  );
}

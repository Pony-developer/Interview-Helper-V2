/**
 * Escapes characters that could close the `<script>` element or open an HTML comment.
 * The replacements are JSON unicode escapes, so the parsed data is unchanged.
 */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

/** Renders schema.org JSON-LD as a server-rendered `<script type="application/ld+json">`. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

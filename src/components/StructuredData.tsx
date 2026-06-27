/**
 * Reusable JSON-LD <script> emitter. Server-side renders the structured
 * data inline in the static HTML so crawlers see it without executing
 * JavaScript.
 *
 * Usage:
 *   <StructuredData data={{ "@context": "https://schema.org", ... }} />
 *
 * Why a component instead of metadata.other? Next.js's `metadata.other`
 * only accepts `<meta>` tags; JSON-LD must be a `<script type="...">`
 * so we render it directly in the layout tree.
 */

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

export function StructuredData({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      // The JSON is built from controlled server-side constants; never
      // from user input. `dangerouslySetInnerHTML` is the only way to
      // emit raw JSON inside a <script> tag in React.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
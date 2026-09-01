/** Renders a JSON-LD <script> block. Data must never contain fabricated values. */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
    </>
  );
}

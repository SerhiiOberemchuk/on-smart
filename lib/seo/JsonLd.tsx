import type { Graph, Thing, WithContext } from "schema-dts";

export type JsonLdData = Graph | WithContext<Thing>;

function serializeJsonLdForScript(data: JsonLdData) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data, id }: { data: JsonLdData; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLdForScript(data) }}
    />
  );
}

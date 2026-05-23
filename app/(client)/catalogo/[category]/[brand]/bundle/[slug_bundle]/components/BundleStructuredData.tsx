import { JsonLd, type JsonLdData } from "@/lib/seo/JsonLd";

export default function BundleStructuredData({ data }: { data: JsonLdData }) {
  return <JsonLd id="bundle-jsonld" data={data} />;
}

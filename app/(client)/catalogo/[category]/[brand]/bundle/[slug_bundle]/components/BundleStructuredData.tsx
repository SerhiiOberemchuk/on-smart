import Script from "next/script";

export default function BundleStructuredData({ data }: { data: object }) {
  return (
    <Script
      id="bundle-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

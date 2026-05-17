export default function BundleStructuredData({ data }: { data: object }) {
  return (
    <script
      id="bundle-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

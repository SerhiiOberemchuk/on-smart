import { getBundleBySlug } from "@/app/actions/bundles/get-bundle-by-slug";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BundlePageContent from "./components/BundlePageContent";
import { buildBundleMetadata } from "./components/buildBundleMetadata";
import type { BundlePageParams } from "./components/bundle-page.types";

export async function generateMetadata({
  params,
}: {
  params: BundlePageParams;
}): Promise<Metadata> {
  const { slug_bundle } = await params;
  const bundleResponse = await getBundleBySlug(slug_bundle);

  if (!bundleResponse.success || !bundleResponse.data) {
    notFound();
  }

  return buildBundleMetadata(bundleResponse.data);
}

async function BundlePage({ params }: { params: BundlePageParams }) {
  const { slug_bundle } = await params;
  const bundleResponse = await getBundleBySlug(slug_bundle);

  if (!bundleResponse.success || !bundleResponse.data) {
    notFound();
  }

  return <BundlePageContent params={params} bundle={bundleResponse.data} />;
}

export default function BundleSlugPage({ params }: { params: BundlePageParams }) {
  return (
    <Suspense fallback={<p>Caricamento...</p>}>
      <BundlePage params={params} />
    </Suspense>
  );
}

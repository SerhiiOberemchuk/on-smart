import LinkYellow from "@/components/YellowLink";
import ScrollButtons from "./ReviewList/ScrollButtons";
import Script from "next/script";
import { getGoogleReviews } from "./ReviewList/action";
import ReviewList from "./ReviewList/ReviewList";
import { baseUrl } from "@/types/baseUrl";
import { Suspense } from "react";
// import { cacheTag } from "next/cache";

export default async function GoogleReviewSection() {
  "use cache";
  // cacheTag("google-reviews");
  const reviews = await getGoogleReviews();
  const hasReviews = reviews.length > 0;
  const averageRating =
    hasReviews && reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const jsonLd = hasReviews
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "OnSmart",
        url: baseUrl,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: averageRating,
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1,
        },
        review: reviews.map((r) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: r.clientName,
          },
          datePublished: new Date(r.date).toISOString(),
          reviewBody: r.reviewText,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
        })),
      }
    : null;
  return (
    <section id="top-sales-section" className="flex flex-col gap-4 py-8 lg:gap-[52px] xl:py-16">
      <div className="bg-background">
        <div className="container flex items-center justify-between py-3">
          <h2 className="H2">Esperienze dei nostri clienti</h2>
          <ScrollButtons />
        </div>
      </div>

      <Suspense>
        <ReviewList reviews={reviews} />
      </Suspense>
      <LinkYellow
        target="_blank"
        rel="noopener noreferrer"
        href="https://g.page/r/CRhuErfSy0siEAE/review"
        title="Lascia una recensione"
        className="mx-auto flex w-fit"
      />
      <Script
        id="google-review-section-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

import ButtonsScrollSwiper from "@/components/ButtonsScrollSwiper";
import LinkYellow from "@/components/YellowLink";
import { getGoogleReviewsAction } from "@/app/actions/goodle-reviews/get-google-reviews";
import { address } from "@/json/adress";
import { telephone } from "@/json/telephone";
import { JsonLd } from "@/lib/seo/JsonLd";
import { baseUrl } from "@/types/baseUrl";
import type { ElectronicsStore, PostalAddress, WithContext } from "schema-dts";

import ReviewList from "./ReviewList/ReviewList";

const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?sca_esv=b88fcdf3d66975f7&hl=it&authuser=0&sxsrf=ANbL-n7fc3UoMTWwtDDPdGd8ro1qQP2abA:1770122098295&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOXphNPWTunj8ciK-v7YwVrPKzEpLgXEo1aJuHtGDiI3mOUFoL_f0-8g9PWV4wLC_stSLgR7ROacUEXRR6MKdY_76RySk&q=ON-SMART+Recensioni&sa=X&ved=2ahUKEwjE0ILXqr2SAxVwh_0HHR1-JdkQ0bkNegQIJBAF&biw=1920&bih=911&dpr=1&aic=0";

function toIsoDateOrUndefined(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default async function GoogleReviewSection() {
  const data = await getGoogleReviewsAction();
  const reviews = data.success ? data.reviews : [];
  const hasReviews = reviews.length > 0;
  const headingId = "review-section-heading";

  const averageRating = hasReviews
    ? reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length
    : 5;
  const storeAddress: PostalAddress = { ...address, "@type": "PostalAddress" };

  const jsonLd = hasReviews
    ? {
        "@context": "https://schema.org",
        "@type": "ElectronicsStore",
        name: "OnSmart",
        url: baseUrl,
        image: `${baseUrl}/logo.png`,
        priceRange: "EUR",
        telephone,
        address: storeAddress,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: averageRating.toFixed(1),
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1,
        },
        review: reviews.map((item) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: item.clientName,
          },
          datePublished: toIsoDateOrUndefined(item.date),
          reviewBody: item.reviewText,
          reviewRating: {
            "@type": "Rating",
            ratingValue: Number(item.rating),
            bestRating: 5,
            worstRating: 1,
          },
          reviewAspect: "customer service",
        })),
      } satisfies WithContext<ElectronicsStore>
    : null;

  return (
    <section
      id="review-section"
      aria-labelledby={headingId}
      className="flex flex-col gap-4 py-8 lg:gap-[52px] xl:py-16"
    >
      <div className="bg-background">
        <div className="container flex items-center justify-between py-3">
          <h2 id={headingId} className="H2">
            Esperienze dei nostri clienti
          </h2>
          <p className="sr-only">
            Recensioni reali dei clienti OnSmart, valutazioni Google e opinioni verificate sul
            servizio.
          </p>
          <ButtonsScrollSwiper
            className="hidden sm:flex"
            idNext="review_list_slider_next"
            idPrev="review_list_slider_prev"
          />
        </div>
      </div>

      {hasReviews ? (
        <ReviewList reviews={reviews} />
      ) : (
        <p className="mx-auto py-16 text-center text-text-grey">
          Al momento non ci sono recensioni disponibili. Torna presto per leggere le esperienze dei
          nostri clienti.
        </p>
      )}

      <LinkYellow
        target="_blank"
        rel="noopener noreferrer"
        href={GOOGLE_REVIEW_URL}
        title="Lascia una recensione su Google"
        ariaLabel="Apri Google per lasciare una recensione su OnSmart"
        className="mx-auto flex w-fit"
      />

      {jsonLd ? <JsonLd id="google-review-section-jsonld" data={jsonLd} /> : null}
    </section>
  );
}

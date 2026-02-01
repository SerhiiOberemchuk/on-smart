import LinkYellow from "@/components/YellowLink";
import Script from "next/script";
// import { getGoogleReviews } from "./ReviewList/action";
import ReviewList from "./ReviewList/ReviewList";
import { baseUrl } from "@/types/baseUrl";
import { Suspense } from "react";
import ButtonsScrollSwiper from "@/components/ButtonsScrollSwiper";
import { address } from "@/json/adress";
import { telephone } from "@/json/telephone";
import { getGoogleReviewsAction } from "@/app/actions/goodle-reviews/get-google-reviews";

export default async function GoogleReviewSection() {
  // const reviews = await getGoogleReviews();
  const data = await getGoogleReviewsAction();

  const reviews = data.success ? data.reviews : [];
  const hasReviews = reviews && reviews.length > 0;

  const averageRating = hasReviews
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 5;
  const jsonLd = hasReviews
    ? {
        "@context": "https://schema.org",
        "@type": "ElectronicsStore",
        name: "OnSmart",
        url: baseUrl,
        image: `${baseUrl}/logo.png`,
        priceRange: "€€",
        telephone,
        address,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: averageRating.toFixed(1),
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
          datePublished: r.date ? new Date(r.date).toISOString() : undefined,
          reviewBody: r.reviewText,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
          reviewAspect: "customer service",
        })),
      }
    : null;

  return (
    <section id="review-section" className="flex flex-col gap-4 py-8 lg:gap-[52px] xl:py-16">
      <div className="bg-background">
        <div className="container flex items-center justify-between py-3">
          <h2 className="H2">Esperienze dei nostri clienti</h2>
          <p className="sr-only">
            Recensioni reali dei clienti OnSmart, valutazioni Google e opinioni verificate sul
            servizio.
          </p>
          <ButtonsScrollSwiper
            aria-label="Scorri le recensioni"
            className="hidden sm:flex"
            idNext="review_list_slider_next"
            idPrev="review_list_slider_prev"
          />
        </div>
      </div>
      {hasReviews ? (
        <Suspense>
          <ReviewList reviews={reviews} />
        </Suspense>
      ) : (
        <p className="mx-auto py-16 text-center text-text-grey">
          Al momento non ci sono recensioni disponibili. Torna presto per leggere le esperienze dei
          nostri clienti!
        </p>
      )}

      <LinkYellow
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.google.com/search?sca_esv=1fb5ba756bd76908&hl=it&authuser=0&sxsrf=ANbL-n7LBFa4OKajrrBb_ZJAqY3xNSA0AQ:1769884739190&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOXphNPWTunj8ciK-v7YwVrPKzEpLgXEo1aJuHtGDiI3mOUFoL_f0-8g9PWV4wLC_stSLgR7ROacUEXRR6MKdY_76RySk&q=ON-SMART+Recensioni&sa=X&ved=2ahUKEwig3LC5traSAxVnzgIHHY7-LVEQ0bkNegQIHBAF&cshid=1769884796072440&biw=1920&bih=855&dpr=1.5&aic=0"
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

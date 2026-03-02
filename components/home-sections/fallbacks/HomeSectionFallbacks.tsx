import { twMerge } from "tailwind-merge";

function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={twMerge("animate-pulse rounded-md bg-neutral-200/80", className)} />;
}

export function TopSalesSectionFallback() {
  return (
    <section className="py-8 xl:py-16">
      <div className="bg-background">
        <div className="container flex items-center justify-between py-3">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="hidden h-10 w-32 md:block" />
        </div>
      </div>
      <div className="container mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={`top-sales-skeleton-${index}`} className="h-[260px] w-full" />
        ))}
      </div>
    </section>
  );
}

export function CategorySectionFallback() {
  return (
    <section className="py-8 xl:py-16">
      <div className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="hidden h-10 w-36 md:block" />
        </div>
      </div>
      <div className="container mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={`category-skeleton-${index}`} className="h-[190px] w-full md:h-[220px]" />
        ))}
      </div>
    </section>
  );
}

export function BrandSectionFallback() {
  return (
    <section className="py-8 xl:py-16">
      <div className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="hidden h-10 w-36 md:block" />
        </div>
      </div>
      <div className="container mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={`brand-skeleton-${index}`} className="h-[84px] w-full" />
        ))}
      </div>
    </section>
  );
}

export function GoogleReviewSectionFallback() {
  return (
    <section className="py-8 xl:py-16">
      <div className="container">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`review-skeleton-${index}`}
              className="rounded-md border border-neutral-200/70 p-4"
              aria-hidden
            >
              <Skeleton className="mb-3 h-5 w-24" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-[92%]" />
              <Skeleton className="h-4 w-[64%]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeedbackFormSectionFallback() {
  return (
    <section className="py-8 xl:py-16">
      <div className="container rounded-md border border-neutral-200/70 p-4 md:p-6">
        <Skeleton className="mb-2 h-9 w-60" />
        <Skeleton className="mb-5 h-4 w-[80%]" />
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="mt-3 h-28 w-full" />
        <Skeleton className="mt-4 ml-auto h-11 w-28" />
      </div>
    </section>
  );
}

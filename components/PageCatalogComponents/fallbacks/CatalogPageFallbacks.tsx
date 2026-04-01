import { twMerge } from "tailwind-merge";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={twMerge("animate-pulse rounded-sm bg-grey-hover-stroke/85", className)}
    />
  );
}

export function CatalogHeaderFallback() {
  return (
    <header className="bg-background">
      <div className="container flex w-full flex-wrap items-center justify-between gap-3 py-3">
        <Skeleton className="h-3 w-28 bg-stroke-grey" />
        <Skeleton className="h-6 w-64 bg-stroke-grey/90" />
      </div>
    </header>
  );
}

export function CatalogMobileFiltersFallback() {
  return (
    <div className="container py-2 lg:hidden">
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

export function CatalogDesktopFiltersFallback() {
  return (
    <div className="hidden w-full max-w-[264px] flex-col gap-3 lg:flex">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={`catalog-filter-skeleton-${index}`}
          className="rounded-sm border border-stroke-grey bg-black/25 p-3"
        >
          <Skeleton className="h-6 w-40 bg-stroke-grey/95" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28 bg-grey-hover-stroke/95" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      ))}
      <Skeleton className="mx-auto h-6 w-28 bg-stroke-grey/85" />
    </div>
  );
}

export function CatalogProductsFallback() {
  return (
    <section id="products" className="flex-1">
      <div className="grid gap-2.5 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={`catalog-product-skeleton-${index}`}
            className="card_gradient rounded-sm border border-stroke-grey p-2"
          >
            <Skeleton className="h-5 w-24 bg-stroke-grey/95" />
            <Skeleton className="mt-2 aspect-square w-full bg-[#2b2b2b]" />
            <Skeleton className="mt-3 h-5 w-full bg-grey-hover-stroke/95" />
            <Skeleton className="mt-2 h-5 w-[80%] bg-grey-hover-stroke/85" />
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-8 w-24 bg-stroke-grey/90" />
              <Skeleton className="h-10 w-10 bg-stroke-grey/80" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        <Skeleton className="h-8 w-24 bg-stroke-grey/80" />
        <Skeleton className="h-8 w-8 bg-grey-hover-stroke/95" />
        <Skeleton className="h-8 w-8 bg-grey-hover-stroke/95" />
        <Skeleton className="h-8 w-8 bg-grey-hover-stroke/95" />
        <Skeleton className="h-8 w-24 bg-stroke-grey/80" />
      </div>
    </section>
  );
}

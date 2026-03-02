import { twMerge } from "tailwind-merge";

function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={twMerge("animate-pulse rounded-sm bg-neutral-200/80", className)} />
  );
}

export function CatalogHeaderFallback() {
  return (
    <header className="bg-background">
      <div className="container flex w-full flex-wrap items-center justify-between gap-3 py-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-64" />
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
        <div key={`catalog-filter-skeleton-${index}`} className="border-b border-stroke-grey pb-3">
          <Skeleton className="h-6 w-40" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      ))}
      <Skeleton className="mx-auto h-6 w-28" />
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
            className="rounded-sm border border-stroke-grey p-2"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-2 aspect-square w-full" />
            <Skeleton className="mt-3 h-5 w-full" />
            <Skeleton className="mt-2 h-5 w-[80%]" />
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-24" />
      </div>
    </section>
  );
}

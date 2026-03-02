import { twMerge } from "tailwind-merge";

function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={twMerge("animate-pulse rounded-sm bg-stroke-grey/70", className)} />;
}

export default function ProductPageFallback() {
  return (
    <>
      <nav className="py-3 text-sm text-text-grey">
        <div className="container flex items-center gap-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </nav>

      <section>
        <div className="flex flex-col items-center gap-5 pt-3 pb-6 md:container xl:flex-row xl:items-start xl:pb-3">
          <div className="flex w-full max-w-[670px] justify-around gap-6 rounded-sm bg-background p-3 xl:flex-1 xl:justify-between">
            <div className="hidden w-24 flex-col gap-3 md:flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={`fallback-thumb-${index}`} className="h-24 w-24" />
              ))}
            </div>

            <div className="w-full max-w-[532px]">
              <Skeleton className="h-[320px] w-full md:h-[532px]" />
              <Skeleton className="mx-auto mt-5 h-6 w-40" />
              <Skeleton className="mx-auto mt-2 h-4 w-56" />
              <Skeleton className="mx-auto mt-2 h-6 w-[80%]" />
            </div>
          </div>

          <section className="w-full rounded-sm bg-background p-3 xl:flex-1">
            <Skeleton className="h-8 w-[85%]" />
            <Skeleton className="mt-2 h-4 w-36" />
            <Skeleton className="mt-3 h-4 w-24" />

            <div className="mt-6 space-y-3">
              <Skeleton className="h-5 w-44" />
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={`fallback-variant-${index}`} className="h-16 w-full" />
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <Skeleton className="h-10 w-44" />
              <Skeleton className="h-11 w-44" />
              <Skeleton className="h-11 w-full" />
            </div>
          </section>
        </div>
      </section>

      <section className="pt-3 pb-6 xl:pb-3">
        <div className="container">
          <div className="flex gap-5 overflow-hidden border-b-2 border-stroke-grey py-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>

          <div className="mt-6 space-y-3">
            <Skeleton className="h-5 w-[92%]" />
            <Skeleton className="h-5 w-[88%]" />
            <Skeleton className="h-5 w-[96%]" />
            <Skeleton className="h-5 w-[80%]" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
        <div className="bg-background">
          <div className="container flex items-center justify-between py-3">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="hidden h-10 w-24 md:block" />
          </div>
        </div>

        <div className="container grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={`fallback-support-${index}`} className="h-[260px] w-full" />
          ))}
        </div>
      </section>
    </>
  );
}

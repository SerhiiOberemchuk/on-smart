function CartRowSkeleton({ bordered = true }: { bordered?: boolean }) {
  return (
    <li
      className={[
        "relative flex flex-col gap-3 xl:flex-row xl:gap-5",
        bordered ? "border-b border-grey-hover-stroke pb-3 xl:pb-6" : "",
      ].join(" ")}
    >
      <div className="card_gradient h-16 w-16 animate-pulse rounded-sm xl:h-[230px] xl:w-60" />

      <div className="flex w-full flex-col justify-between gap-4">
        <div className="mt-2 space-y-3">
          <div className="h-5 w-2/3 animate-pulse rounded bg-grey-hover-stroke" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-grey-hover-stroke" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-grey-hover-stroke" />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="h-11 w-[132px] animate-pulse rounded-sm bg-grey-hover-stroke" />
          <div className="space-y-2">
            <div className="ml-auto h-5 w-24 animate-pulse rounded bg-grey-hover-stroke" />
            <div className="ml-auto h-7 w-28 animate-pulse rounded bg-grey-hover-stroke" />
          </div>
        </div>
      </div>
    </li>
  );
}

function SummarySkeleton() {
  return (
    <div className="sticky top-5 w-full xl:max-w-[426px]">
      <div className="sticky top-5 flex min-h-[260px] w-full flex-col gap-6 rounded-sm bg-background p-3">
        <div className="h-8 w-2/3 animate-pulse rounded bg-grey-hover-stroke" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`summary-skeleton-${index}`} className="flex items-center justify-between">
              <div className="h-5 w-28 animate-pulse rounded bg-grey-hover-stroke" />
              <div className="h-5 w-20 animate-pulse rounded bg-grey-hover-stroke" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-7 w-24 animate-pulse rounded bg-grey-hover-stroke" />
          <div className="h-7 w-24 animate-pulse rounded bg-grey-hover-stroke" />
        </div>
        <div className="h-11 w-full animate-pulse rounded-sm bg-yellow-500/40" />
      </div>
    </div>
  );
}

function ProductRowSectionSkeleton() {
  return (
    <section className="container py-8">
      <div className="mb-5 h-8 w-64 animate-pulse rounded bg-grey-hover-stroke" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`product-row-skeleton-${index}`}
            className="card_gradient flex min-h-[320px] flex-col rounded-sm p-4"
          >
            <div className="mb-4 h-40 animate-pulse rounded bg-grey-hover-stroke" />
            <div className="space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-grey-hover-stroke" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-grey-hover-stroke" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-grey-hover-stroke" />
            </div>
            <div className="mt-auto pt-6">
              <div className="h-10 w-full animate-pulse rounded bg-yellow-500/40" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CarrelloPageFallback() {
  return (
    <>
      <section id="carello">
        <nav className="py-3 text-sm text-text-grey">
          <div className="container">
            <div className="h-5 w-56 animate-pulse rounded bg-grey-hover-stroke" />
          </div>
        </nav>

        <header className="bg-background">
          <div className="container py-3">
            <div className="h-9 w-52 animate-pulse rounded bg-grey-hover-stroke" />
          </div>
        </header>

        <div className="container bg-background xl:bg-transparent">
          <div className="relative flex flex-col gap-4 xl:mt-5 xl:flex-row xl:gap-5">
            <ul className="mx-auto flex min-h-[320px] w-full max-w-[916px] flex-col gap-6 rounded-sm bg-background p-3 xl:mx-0">
              <CartRowSkeleton />
              <CartRowSkeleton />
              <CartRowSkeleton bordered={false} />
            </ul>

            <SummarySkeleton />
          </div>
        </div>
      </section>

      <ProductRowSectionSkeleton />
    </>
  );
}

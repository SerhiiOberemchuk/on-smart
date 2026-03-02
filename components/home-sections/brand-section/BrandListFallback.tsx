export default function BrandListFallback() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-px py-2 lg:gap-3" aria-hidden>
      {Array.from({ length: 12 }).map((_, index) => (
        <li
          key={`brand-list-fallback-${index}`}
          className="rounded-sm border border-neutral-200/70 px-5 py-6 md:px-7"
        >
          <div className="h-8 w-[150px] animate-pulse rounded bg-neutral-200/80" />
        </li>
      ))}
    </ul>
  );
}

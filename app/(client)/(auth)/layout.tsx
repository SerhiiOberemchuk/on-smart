import { Suspense } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-stroke-grey bg-background p-6 sm:p-8">
        <Suspense fallback={<AuthCardSkeleton />}>{children}</Suspense>
      </div>
    </div>
  );
}

function AuthCardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto h-6 w-40 animate-pulse rounded bg-black/10" />
      <div className="h-10 w-full animate-pulse rounded bg-black/10" />
      <div className="h-10 w-full animate-pulse rounded bg-black/10" />
      <div className="h-11 w-full animate-pulse rounded bg-black/10" />
    </div>
  );
}

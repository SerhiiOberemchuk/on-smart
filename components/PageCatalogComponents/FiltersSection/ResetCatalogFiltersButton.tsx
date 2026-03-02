"use client";

import { usePathname, useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function ResetCatalogFiltersButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="button"
      className={twMerge("input_M_18 mx-auto flex pt-2 pb-4 text-center underline", className)}
      onClick={() => {
        router.push(pathname, { scroll: false });
      }}
    >
      Azzera filtri
    </button>
  );
}

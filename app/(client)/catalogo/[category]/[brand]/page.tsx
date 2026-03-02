import { permanentRedirect } from "next/navigation";
import { Suspense } from "react";

function toQueryString(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      query.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

async function CategoryBrandPageRedirectContent({
  paramsAction,
  searchParamsAction,
}: {
  paramsAction: PageProps<"/catalogo/[category]/[brand]">["params"];
  searchParamsAction: PageProps<"/catalogo/[category]/[brand]">["searchParams"];
}) {
  const [{ brand }, searchParams] = await Promise.all([paramsAction, searchParamsAction]);
  const queryString = toQueryString(searchParams);

  permanentRedirect(`/brand/${encodeURIComponent(brand)}${queryString}`);
  return null;
}

export default function CategoryBrandPage(props: PageProps<"/catalogo/[category]/[brand]">) {
  return (
    <Suspense fallback={null}>
      <CategoryBrandPageRedirectContent
        paramsAction={props.params}
        searchParamsAction={props.searchParams}
      />
    </Suspense>
  );
}


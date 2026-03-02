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

async function CategoryPageRedirectContent({
  paramsAction,
  searchParamsAction,
}: {
  paramsAction: PageProps<"/catalogo/[category]">["params"];
  searchParamsAction: PageProps<"/catalogo/[category]">["searchParams"];
}) {
  const [{ category }, searchParams] = await Promise.all([paramsAction, searchParamsAction]);
  const queryString = toQueryString(searchParams);

  permanentRedirect(`/categoria/${encodeURIComponent(category)}${queryString}`);
  return null;
}

export default function CategoryPage(props: PageProps<"/catalogo/[category]">) {
  return (
    <Suspense fallback={null}>
      <CategoryPageRedirectContent
        paramsAction={props.params}
        searchParamsAction={props.searchParams}
      />
    </Suspense>
  );
}


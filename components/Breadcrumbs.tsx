"use client";

import Link from "next/link";

function formatBreadcrumbLabel(value: string) {
  return value.replace(/[-_]+/g, " ").trim();
}

type Props = {
  category?: string;
  categoryLabel?: string;
  brand?: string;
  brandLabel?: string;
  productName?: string;
  carello?: string;
};

export default function Breadcrumbs({
  category,
  categoryLabel,
  brand,
  brandLabel,
  productName,
  carello,
}: Props) {
  return (
    <nav className="py-3 text-sm text-text-grey">
      <ul className="text_R container flex flex-wrap gap-1 capitalize">
        <li>
          <Link href="/" className="hover:text-white">
            Home
          </Link>{" "}
        </li>
        <li>
          /{" "}
          <Link href="/catalogo" className="hover:text-white">
            Catalogo
          </Link>
        </li>
        {category && (
          <li>
            /{" "}
            <Link href={`/categoria/${encodeURIComponent(category)}`} className="hover:text-white">
              {categoryLabel ?? formatBreadcrumbLabel(category)}
            </Link>
          </li>
        )}
        {brand && (
          <li>
            /{" "}
            <Link href={`/brand/${encodeURIComponent(brand)}`} className="hover:text-white">
              {brandLabel ?? formatBreadcrumbLabel(brand)}
            </Link>
          </li>
        )}
        {productName && (
          <li>
            / <span className="text-white underline">{productName}</span>{" "}
          </li>
        )}
        {carello && (
          <li>
            / <span className="text-white underline">{carello}</span>{" "}
          </li>
        )}
      </ul>
    </nav>
  );
}

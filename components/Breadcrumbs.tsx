"use client";
import Link from "next/link";
type Props = { category?: string; brand?: string; productName?: string; carello?: string };
export default function Breadcrumbs({ category, brand, productName, carello }: Props) {
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
            <Link href={`/catalogo?categoria=${category}`} className="hover:text-white">
              {category}
            </Link>
          </li>
        )}
        {brand && (
          <li>
            /{" "}
            <Link
              href={`/catalogo?categoria=${category}&brand=${brand}`}
              className="hover:text-white"
            >
              {brand}
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

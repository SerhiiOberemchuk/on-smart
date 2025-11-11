"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const paths = segments.map((_, i) => "/" + segments.slice(0, i + 1).join("/"));

  return (
    <nav className="py-3 text-sm text-text-grey">
      <ul className="text_R container flex flex-wrap gap-1">
        <li>
          <Link href="/" className="hover:text-white">
            Home
          </Link>{" "}
          /
        </li>
        {segments.map((seg, i) => (
          <li key={i}>
            {i === segments.length - 1 ? (
              <span className="text-white capitalize underline">{decodeURIComponent(seg)}</span>
            ) : (
              <>
                <Link href={paths[i]} className="capitalize hover:text-white">
                  {decodeURIComponent(seg)}
                </Link>{" "}
                /
              </>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

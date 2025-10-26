import Link from "next/link";

export default function LinkCatalogo({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/catalogo" className="btn" aria-label="link a catalogo">
      {children}
    </Link>
  );
}
